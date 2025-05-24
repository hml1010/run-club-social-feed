const { WechatyBuilder } = require('wechaty');
const cron = require('node-cron');
const moment = require('moment');
const CheckinManager = require('./checkinManager');
const logger = require('./logger');
const config = require('./config');

// 设置中文
moment.locale('zh-cn');

class SportsCheckinBot {
  constructor() {
    this.bot = WechatyBuilder.build({
      name: 'sports-checkin-bot',
      puppet: 'wechaty-puppet-wechat'
    });
    
    this.checkinManager = new CheckinManager();
    this.targetRoom = null;
    this.isReady = false;
    
    this.setupBot();
    this.setupScheduledTasks();
  }

  setupBot() {
    this.bot
      .on('scan', this.onScan.bind(this))
      .on('login', this.onLogin.bind(this))
      .on('logout', this.onLogout.bind(this))
      .on('message', this.onMessage.bind(this))
      .on('room-join', this.onRoomJoin.bind(this))
      .on('error', this.onError.bind(this));
  }

  async onScan(qrcode, status) {
    const qrcodeUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
    logger.info('扫描二维码登录', { qrcodeUrl, status });
    console.log(`📱 请用微信扫描二维码登录: ${qrcodeUrl}`);
  }

  async onLogin(user) {
    logger.info('机器人登录成功', { user: user.name() });
    console.log(`✅ 机器人登录成功: ${user.name()}`);
    
    // 查找目标群聊
    const room = await this.bot.Room.find({ topic: config.TARGET_ROOM_NAME });
    if (room) {
      this.targetRoom = room;
      this.isReady = true;
      const roomTopic = await room.topic();
      logger.info('找到目标群聊', { roomTopic });
      console.log(`🎯 找到目标群聊: ${roomTopic}`);
      
      // 发送启动消息
      await this.sendWelcomeMessage();
    } else {
      logger.warn('未找到目标群聊', { targetName: config.TARGET_ROOM_NAME });
      console.log('⚠️ 未找到目标群聊，请检查群名称配置');
    }
  }

  async onLogout(user) {
    this.isReady = false;
    logger.info('机器人退出登录', { user: user.name() });
    console.log(`👋 机器人退出登录: ${user.name()}`);
  }

  async onMessage(msg) {
    try {
      // 只处理群消息
      const room = msg.room();
      if (!room || !this.targetRoom || room.id !== this.targetRoom.id) return;
      
      // 忽略自己发送的消息
      if (msg.self()) return;
      
      const contact = msg.talker();
      const text = msg.text().trim();
      const userName = contact.name();
      
      logger.debug('收到群消息', { userName, text });
      
      // 识别打卡关键词
      if (this.isCheckinMessage(text)) {
        await this.handleCheckin(room, contact, text);
      }
      // 统计查询
      else if (this.isStatsQuery(text)) {
        await this.handleStatsQuery(room);
      }
      // 帮助信息
      else if (this.isHelpQuery(text)) {
        await this.handleHelp(room);
      }
      // 个人统计查询
      else if (this.isPersonalStatsQuery(text)) {
        await this.handlePersonalStats(room, contact);
      }
    } catch (error) {
      logger.error('处理消息时出错', error);
    }
  }

  isCheckinMessage(text) {
    return config.CHECKIN_KEYWORDS.some(keyword => text.includes(keyword));
  }

  isStatsQuery(text) {
    const statsKeywords = ['统计', '排行榜', '排行', '数据', '总结'];
    return statsKeywords.some(keyword => text === keyword);
  }

  isHelpQuery(text) {
    const helpKeywords = ['帮助', 'help', '使用说明', '怎么用'];
    return helpKeywords.some(keyword => text === keyword);
  }

  isPersonalStatsQuery(text) {
    const personalKeywords = ['我的统计', '我的数据', '个人统计'];
    return personalKeywords.some(keyword => text === keyword);
  }

  async handleCheckin(room, contact, message) {
    const userName = contact.name();
    const today = moment().format('YYYY-MM-DD');
    
    // 检查是否已经打卡
    const hasChecked = await this.checkinManager.hasCheckedToday(userName, today);
    if (hasChecked) {
      await room.say(`@${userName} 您今天已经打卡过了哦！💪 明天继续加油！`);
      return;
    }
    
    // 记录打卡
    const checkinData = {
      userName,
      date: today,
      time: moment().format('HH:mm:ss'),
      message: message,
      timestamp: Date.now()
    };
    
    await this.checkinManager.addCheckin(checkinData);
    logger.info('用户打卡成功', checkinData);
    
    // 获取统计数据
    const todayCount = await this.checkinManager.getTodayCount(today);
    const streak = await this.checkinManager.getUserStreak(userName);
    const totalMembers = await this.getTotalMembers();
    const exerciseTime = this.checkinManager.extractExerciseTime(message);
    
    // 回复确认消息
    const replyMessage = this.generateCheckinReply(userName, streak, todayCount, totalMembers, exerciseTime);
    await room.say(replyMessage);
  }

  generateCheckinReply(userName, streak, todayCount, totalMembers, exerciseTime) {
    const encouragements = [
      '太棒了！', '真不错！', '坚持得很好！', '继续保持！', '加油！'
    ];
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    let reply = `✅ @${userName} 打卡成功！${randomEncouragement}\n`;
    reply += `🔥 连续打卡: ${streak}天\n`;
    reply += `📊 今日群体打卡: ${todayCount}/${totalMembers}人\n`;
    
    // 添加运动时间信息
    if (exerciseTime > 0) {
      reply += `⏱️ 本次运动: ${this.checkinManager.formatTime(exerciseTime)}\n`;
    }
    
    if (streak >= 7) {
      reply += `🏆 恭喜连续打卡一周！\n`;
    } else if (streak >= 30) {
      reply += `👑 太厉害了！连续打卡一个月！\n`;
    }
    
    reply += `💪 运动使人快乐，继续保持！`;
    
    return reply;
  }

  async getTotalMembers() {
    if (!this.targetRoom) return 0;
    try {
      const memberList = await this.targetRoom.memberAll();
      return memberList.length;
    } catch (error) {
      logger.error('获取群成员数量失败', error);
      return 0;
    }
  }

  async handleStatsQuery(room) {
    const today = moment().format('YYYY-MM-DD');
    const stats = await this.checkinManager.getTodayStats(today);
    const ranking = await this.checkinManager.getWeeklyRanking();
    const timeRanking = await this.checkinManager.getExerciseTimeRanking('weekly');
    const totalMembers = await this.getTotalMembers();
    
    let message = `📊 今日打卡统计 (${moment().format('MM月DD日')})\n\n`;
    message += `✅ 已打卡: ${stats.count}/${totalMembers}人\n`;
    
    if (stats.checkedUsers.length > 0) {
      message += `👥 打卡成员: ${stats.checkedUsers.join('、')}\n\n`;
    }
    
    if (ranking.length > 0) {
      message += `🏆 本周打卡排行榜:\n`;
      ranking.slice(0, 3).forEach((user, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[index];
        message += `${medal} ${user.name}: ${user.count}次\n`;
      });
    }

    if (timeRanking.length > 0) {
      message += `\n⏱️ 本周运动时长排行:\n`;
      timeRanking.slice(0, 3).forEach((user, index) => {
        const medals = ['🏆', '🥈', '🥉'];
        const medal = medals[index];
        message += `${medal} ${user.name}: ${user.hours}小时\n`;
      });
    }
    
    await room.say(message);
  }

  async handlePersonalStats(room, contact) {
    const userName = contact.name();
    const streak = await this.checkinManager.getUserStreak(userName);
    const weeklyCount = await this.checkinManager.getUserWeeklyCount(userName);
    const monthlyCount = await this.checkinManager.getUserMonthlyCount(userName);
    const exerciseStats = await this.checkinManager.getUserExerciseStats(userName);
    
    let message = `📈 @${userName} 的个人统计:\n\n`;
    message += `🔥 连续打卡: ${streak}天\n`;
    message += `📅 本周打卡: ${weeklyCount}次\n`;
    message += `📆 本月打卡: ${monthlyCount}次\n\n`;
    
    // 新增运动时间统计
    message += `⏱️ 运动时间统计:\n`;
    message += `• 本周: ${this.checkinManager.formatTime(exerciseStats.weeklyTime)}\n`;
    message += `• 本月: ${this.checkinManager.formatTime(exerciseStats.monthlyTime)}\n`;
    message += `• 总计: ${this.checkinManager.formatTime(exerciseStats.totalTime)}\n`;
    message += `• 平均每次: ${this.checkinManager.formatTime(exerciseStats.averageDaily)}\n`;
    
    if (streak >= 7) {
      message += `\n🎉 已坚持一周，真棒！`;
    } else if (streak >= 30) {
      message += `\n👑 坚持一个月，太厉害了！`;
    }
    
    await room.say(message);
  }

  async handleHelp(room) {
    const helpText = `🤖 老胡私董会运动打卡机器人

📝 打卡方式:
• 发送包含"打卡"、"运动"、"健身"等关键词的消息

📊 查询功能:
• "统计" - 查看今日群体数据和排行榜
• "我的统计" - 查看个人数据
• "帮助" - 显示此帮助信息

⏰ 自动功能:
• 每日9:00和18:00自动提醒
• 每周一发送上周总结报告
• 实时统计连续打卡天数和群体进度

🏆 特色功能:
• 连续打卡天数统计
• 每周/每月排行榜
• 个性化鼓励消息

💪 让我们一起坚持运动，保持健康！`;
    
    await room.say(helpText);
  }

  async sendWelcomeMessage() {
    if (!this.targetRoom) return;
    
    const welcomeMsg = `🤖 运动打卡机器人已上线！

📱 使用方法:
• 发送运动相关消息即可打卡
• 发送"统计"查看群体数据
• 发送"我的统计"查看个人数据
• 发送"帮助"获取详细说明

🎯 让我们一起养成运动好习惯！`;

    await this.targetRoom.say(welcomeMsg);
  }

  async onRoomJoin(room, inviteeList, inviter) {
    if (this.targetRoom && room.id === this.targetRoom.id) {
      for (const contact of inviteeList) {
        const welcomeMsg = `🎉 欢迎 @${contact.name()} 加入老胡私董会运动打卡群！

🏃‍♂️ 这里是我们的运动打卡基地
📝 发送运动相关消息即可打卡
💪 让我们一起坚持运动，保持健康！

发送"帮助"了解详细使用方法`;
        
        await room.say(welcomeMsg);
      }
    }
  }

  onError(error) {
    logger.error('机器人运行错误', error);
    console.error('❌ 机器人错误:', error);
  }

  setupScheduledTasks() {
    // 每日9点提醒
    cron.schedule(config.REMINDERS.MORNING, async () => {
      await this.sendMorningReminder();
    }, { timezone: config.TIMEZONE });

    // 每日18点提醒
    cron.schedule(config.REMINDERS.EVENING, async () => {
      await this.sendEveningReminder();
    }, { timezone: config.TIMEZONE });

    // 每周一早上发送上周总结
    cron.schedule(config.REMINDERS.WEEKLY, async () => {
      await this.sendWeeklyReport();
    }, { timezone: config.TIMEZONE });
  }

  async sendMorningReminder() {
    if (!this.targetRoom || !this.isReady) return;
    
    try {
      const today = moment().format('YYYY-MM-DD');
      const yesterdayCount = await this.checkinManager.getTodayCount(
        moment().subtract(1, 'day').format('YYYY-MM-DD')
      );
      
      const messages = [
        '🌅 早上好！新的一天开始了！',
        '🌞 美好的一天，从运动开始！',
        '☀️ 早安！今天也要元气满满哦！'
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      let reminder = `${randomMessage}\n\n`;
      reminder += `💪 记得完成今日运动打卡～\n`;
      reminder += `📊 昨日群体打卡: ${yesterdayCount}人\n`;
      reminder += `🎯 今天我们能超越昨天吗？`;
      
      await this.targetRoom.say(reminder);
      logger.info('发送晨间提醒');
    } catch (error) {
      logger.error('发送晨间提醒失败', error);
    }
  }

  async sendEveningReminder() {
    if (!this.targetRoom || !this.isReady) return;
    
    try {
      const today = moment().format('YYYY-MM-DD');
      const stats = await this.checkinManager.getTodayStats(today);
      const totalMembers = await this.getTotalMembers();
      
      let reminder = `🌆 晚上好！今日打卡统计：\n\n`;
      reminder += `✅ 已打卡: ${stats.count}/${totalMembers}人\n`;
      
      if (stats.checkedUsers.length > 0) {
        reminder += `👏 今日打卡英雄: ${stats.checkedUsers.join('、')}\n`;
      }
      
      if (stats.count < totalMembers) {
        reminder += `\n⏰ 还没运动的朋友们，时间还来得及！`;
      } else {
        reminder += `\n🎉 太棒了！今天全员打卡！`;
      }
      
      await this.targetRoom.say(reminder);
      logger.info('发送晚间提醒', { todayStats: stats });
    } catch (error) {
      logger.error('发送晚间提醒失败', error);
    }
  }

  async sendWeeklyReport() {
    if (!this.targetRoom || !this.isReady) return;
    
    try {
      const weeklyReport = await this.checkinManager.getWeeklyReport();
      await this.targetRoom.say(weeklyReport);
      logger.info('发送周报');
    } catch (error) {
      logger.error('发送周报失败', error);
    }
  }

  async start() {
    try {
      logger.info('正在启动机器人...');
      await this.bot.start();
      console.log('🚀 机器人启动成功！');
    } catch (error) {
      logger.error('机器人启动失败', error);
      console.error('❌ 机器人启动失败:', error);
      throw error;
    }
  }

  async stop() {
    try {
      logger.info('正在关闭机器人...');
      await this.bot.stop();
      console.log('⏹️ 机器人已关闭');
    } catch (error) {
      logger.error('机器人关闭失败', error);
      console.error('❌ 机器人关闭失败:', error);
    }
  }
}

module.exports = SportsCheckinBot;

// 启动机器人
if (require.main === module) {
  const bot = new SportsCheckinBot();
  bot.start();
}
