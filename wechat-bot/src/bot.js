
const { WechatyBuilder } = require('wechaty');
const cron = require('node-cron');
const moment = require('moment');
const CheckinManager = require('./checkinManager');
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
    
    this.setupBot();
    this.setupScheduledTasks();
  }

  setupBot() {
    this.bot
      .on('scan', this.onScan)
      .on('login', this.onLogin.bind(this))
      .on('logout', this.onLogout)
      .on('message', this.onMessage.bind(this))
      .on('room-join', this.onRoomJoin.bind(this))
      .on('error', this.onError);
  }

  onScan(qrcode, status) {
    console.log(`扫描二维码登录: https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`);
  }

  async onLogin(user) {
    console.log(`机器人登录成功: ${user}`);
    
    // 查找目标群聊
    const room = await this.bot.Room.find({ topic: config.TARGET_ROOM_NAME });
    if (room) {
      this.targetRoom = room;
      console.log(`找到目标群聊: ${await room.topic()}`);
      
      // 发送启动消息
      await room.say('🤖 打卡机器人已上线！\n发送"打卡"开始记录，发送"统计"查看今日数据');
    } else {
      console.log('未找到目标群聊，请检查群名称配置');
    }
  }

  onLogout(user) {
    console.log(`机器人退出登录: ${user}`);
  }

  async onMessage(msg) {
    // 只处理群消息
    const room = msg.room();
    if (!room || !this.targetRoom || room.id !== this.targetRoom.id) return;
    
    const contact = msg.talker();
    const text = msg.text().trim();
    const userName = contact.name();
    
    console.log(`收到消息: ${userName}: ${text}`);
    
    // 识别打卡关键词
    if (this.isCheckinMessage(text)) {
      await this.handleCheckin(room, contact, text);
    }
    
    // 统计查询
    else if (text === '统计' || text === '排行榜') {
      await this.handleStatsQuery(room);
    }
    
    // 帮助信息
    else if (text === '帮助' || text === 'help') {
      await this.handleHelp(room);
    }
  }

  isCheckinMessage(text) {
    const checkinKeywords = [
      '打卡', '运动', '健身', '跑步', '网球', 
      '游泳', '瑜伽', '登山', '骑行', '篮球'
    ];
    
    return checkinKeywords.some(keyword => text.includes(keyword));
  }

  async handleCheckin(room, contact, message) {
    const userName = contact.name();
    const today = moment().format('YYYY-MM-DD');
    
    // 检查是否已经打卡
    if (this.checkinManager.hasCheckedToday(userName, today)) {
      await room.say(`@${userName} 您今天已经打卡过了哦！💪`);
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
    
    this.checkinManager.addCheckin(checkinData);
    
    // 回复确认
    const todayCount = this.checkinManager.getTodayCount(today);
    const streak = this.checkinManager.getUserStreak(userName);
    
    await room.say(
      `✅ @${userName} 打卡成功！\n` +
      `🔥 连续打卡: ${streak}天\n` +
      `📊 今日群体打卡: ${todayCount}人\n` +
      `💪 继续保持！`
    );
  }

  async handleStatsQuery(room) {
    const today = moment().format('YYYY-MM-DD');
    const stats = this.checkinManager.getTodayStats(today);
    const ranking = this.checkinManager.getWeeklyRanking();
    
    let message = `📊 今日打卡统计 (${today})\n\n`;
    message += `✅ 已打卡: ${stats.checkedUsers.length}人\n`;
    
    if (stats.checkedUsers.length > 0) {
      message += `👥 ${stats.checkedUsers.join('、')}\n\n`;
    }
    
    message += `🏆 本周排行榜:\n`;
    ranking.slice(0, 5).forEach((user, index) => {
      const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
      message += `${medal} ${user.name}: ${user.count}次\n`;
    });
    
    await room.say(message);
  }

  async handleHelp(room) {
    const helpText = `
🤖 打卡机器人使用说明:

📝 打卡方式:
• 发送包含"打卡"、"运动"、"健身"等关键词的消息

📊 查询统计:
• 发送"统计"或"排行榜"查看数据

⏰ 自动功能:
• 每日9点和18点自动提醒
• 每周一发送上周总结
• 实时统计连续打卡天数

💪 加油，坚持运动！
    `;
    
    await room.say(helpText.trim());
  }

  async onRoomJoin(room, inviteeList, inviter) {
    if (this.targetRoom && room.id === this.targetRoom.id) {
      for (const contact of inviteeList) {
        await room.say(`🎉 欢迎 @${contact.name()} 加入私董会运动打卡群！\n发送"帮助"了解打卡方式`);
      }
    }
  }

  onError(error) {
    console.error('机器人错误:', error);
  }

  setupScheduledTasks() {
    // 每日9点提醒
    cron.schedule('0 9 * * *', async () => {
      if (this.targetRoom) {
        await this.targetRoom.say(
          '🌅 早上好！新的一天开始了！\n' +
          '💪 记得完成今日运动打卡哦～\n' +
          '发送运动相关消息即可打卡！'
        );
      }
    }, { timezone: 'Asia/Shanghai' });

    // 每日18点提醒
    cron.schedule('0 18 * * *', async () => {
      if (this.targetRoom) {
        const today = moment().format('YYYY-MM-DD');
        const stats = this.checkinManager.getTodayStats(today);
        
        await this.targetRoom.say(
          `🌆 晚上好！今日打卡统计：\n` +
          `✅ 已打卡: ${stats.checkedUsers.length}人\n` +
          `⏰ 还没运动的朋友抓紧时间哦！`
        );
      }
    }, { timezone: 'Asia/Shanghai' });

    // 每周一早上发送上周总结
    cron.schedule('0 9 * * 1', async () => {
      if (this.targetRoom) {
        const weeklyReport = this.checkinManager.getWeeklyReport();
        await this.targetRoom.say(weeklyReport);
      }
    }, { timezone: 'Asia/Shanghai' });
  }

  start() {
    this.bot.start()
      .then(() => console.log('机器人启动成功'))
      .catch(error => console.error('机器人启动失败:', error));
  }
}

module.exports = SportsCheckinBot;

// 启动机器人
if (require.main === module) {
  const bot = new SportsCheckinBot();
  bot.start();
}
