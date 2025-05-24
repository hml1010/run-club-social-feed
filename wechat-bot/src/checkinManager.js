const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const logger = require('./logger');

class CheckinManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.dataFile = path.join(this.dataDir, 'checkins.json');
    this.init();
  }

  async init() {
    await this.ensureDataFile();
  }

  async ensureDataFile() {
    try {
      await fs.ensureDir(this.dataDir);
      if (!await fs.pathExists(this.dataFile)) {
        await fs.writeJson(this.dataFile, { 
          checkins: [],
          lastBackup: null,
          version: '1.0'
        });
        logger.info('创建新的数据文件');
      }
    } catch (error) {
      logger.error('初始化数据文件失败', error);
      throw error;
    }
  }

  async loadData() {
    try {
      const data = await fs.readJson(this.dataFile);
      return data;
    } catch (error) {
      logger.error('读取数据文件失败', error);
      return { checkins: [], lastBackup: null, version: '1.0' };
    }
  }

  async saveData(data) {
    try {
      // 添加备份机制
      if (await fs.pathExists(this.dataFile)) {
        const backupFile = this.dataFile.replace('.json', `.backup.${Date.now()}.json`);
        await fs.copy(this.dataFile, backupFile);
        
        // 只保留最近5个备份
        await this.cleanOldBackups();
      }
      
      data.lastSaved = new Date().toISOString();
      await fs.writeJson(this.dataFile, data, { spaces: 2 });
      logger.debug('数据保存成功');
    } catch (error) {
      logger.error('保存数据文件失败', error);
      throw error;
    }
  }

  async cleanOldBackups() {
    try {
      const backupPattern = /\.backup\.\d+\.json$/;
      const files = await fs.readdir(this.dataDir);
      const backupFiles = files
        .filter(file => backupPattern.test(file))
        .map(file => ({
          name: file,
          path: path.join(this.dataDir, file),
          time: parseInt(file.match(/\.backup\.(\d+)\.json$/)[1])
        }))
        .sort((a, b) => b.time - a.time);
      
      // 保留最新的5个备份，删除其余的
      for (let i = 5; i < backupFiles.length; i++) {
        await fs.unlink(backupFiles[i].path);
      }
    } catch (error) {
      logger.error('清理备份文件失败', error);
    }
  }

  async addCheckin(checkinData) {
    try {
      const data = await this.loadData();
      
      // 提取运动时间（支持多种格式）
      const exerciseTime = this.extractExerciseTime(checkinData.message);
      
      data.checkins.push({
        ...checkinData,
        id: this.generateId(),
        exerciseTime: exerciseTime, // 新增运动时间字段（分钟）
        createdAt: new Date().toISOString()
      });
      await this.saveData(data);
      logger.info('记录打卡成功', { 
        userName: checkinData.userName, 
        date: checkinData.date,
        exerciseTime: exerciseTime 
      });
    } catch (error) {
      logger.error('添加打卡记录失败', error);
      throw error;
    }
  }

  extractExerciseTime(message) {
    // 提取运动时间的正则表达式
    const timePatterns = [
      /(\d+(?:\.\d+)?)\s*小时/g,           // X小时
      /(\d+(?:\.\d+)?)\s*h/gi,            // Xh
      /(\d+)\s*分钟/g,                    // X分钟
      /(\d+)\s*min/gi,                    // Xmin
      /(\d+)\s*minutes?/gi,               // X minutes
      /运动\s*(\d+(?:\.\d+)?)\s*小时/g,    // 运动X小时
      /锻炼\s*(\d+)\s*分钟/g,             // 锻炼X分钟
      /练习\s*(\d+)\s*分钟/g,             // 练习X分钟
      /跑步\s*(\d+)\s*分钟/g,             // 跑步X分钟
      /健身\s*(\d+)\s*分钟/g              // 健身X分钟
    ];

    let totalMinutes = 0;
    
    // 匹配小时
    const hourMatches = message.match(/(\d+(?:\.\d+)?)\s*(?:小时|h)/gi);
    if (hourMatches) {
      hourMatches.forEach(match => {
        const hours = parseFloat(match.match(/(\d+(?:\.\d+)?)/)[1]);
        totalMinutes += hours * 60;
      });
    }

    // 匹配分钟
    const minuteMatches = message.match(/(\d+)\s*(?:分钟|min|minutes?)/gi);
    if (minuteMatches) {
      minuteMatches.forEach(match => {
        const minutes = parseInt(match.match(/(\d+)/)[1]);
        totalMinutes += minutes;
      });
    }

    // 如果没有明确时间，根据关键词估算默认时间
    if (totalMinutes === 0) {
      if (message.includes('跑步') || message.includes('慢跑')) {
        totalMinutes = 30; // 默认30分钟
      } else if (message.includes('健身') || message.includes('力量训练')) {
        totalMinutes = 60; // 默认60分钟
      } else if (message.includes('网球') || message.includes('羽毛球')) {
        totalMinutes = 60; // 默认60分钟
      } else if (message.includes('游泳')) {
        totalMinutes = 45; // 默认45分钟
      } else {
        totalMinutes = 30; // 其他运动默认30分钟
      }
    }

    return Math.max(totalMinutes, 0); // 确保不返回负数
  }

  async getUserExerciseStats(userName) {
    try {
      const data = await this.loadData();
      const userCheckins = data.checkins.filter(checkin => checkin.userName === userName);
      
      const totalTime = userCheckins.reduce((sum, checkin) => {
        return sum + (checkin.exerciseTime || 0);
      }, 0);

      const weeklyTime = userCheckins
        .filter(checkin => {
          const oneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
          return checkin.date >= oneWeekAgo;
        })
        .reduce((sum, checkin) => sum + (checkin.exerciseTime || 0), 0);

      const monthlyTime = userCheckins
        .filter(checkin => {
          const oneMonthAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
          return checkin.date >= oneMonthAgo;
        })
        .reduce((sum, checkin) => sum + (checkin.exerciseTime || 0), 0);

      return {
        totalTime: totalTime, // 总运动时间（分钟）
        weeklyTime: weeklyTime, // 本周运动时间
        monthlyTime: monthlyTime, // 本月运动时间
        averageDaily: userCheckins.length > 0 ? Math.round(totalTime / userCheckins.length) : 0,
        totalSessions: userCheckins.length
      };
    } catch (error) {
      logger.error('获取用户运动统计失败', error);
      return {
        totalTime: 0,
        weeklyTime: 0,
        monthlyTime: 0,
        averageDaily: 0,
        totalSessions: 0
      };
    }
  }

  async getExerciseTimeRanking(period = 'weekly') {
    try {
      const data = await this.loadData();
      let cutoffDate;
      
      if (period === 'weekly') {
        cutoffDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      } else if (period === 'monthly') {
        cutoffDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
      } else {
        cutoffDate = '1970-01-01'; // 全部时间
      }
      
      const filteredCheckins = data.checkins.filter(
        checkin => checkin.date >= cutoffDate
      );
      
      const userTimes = {};
      filteredCheckins.forEach(checkin => {
        if (!userTimes[checkin.userName]) {
          userTimes[checkin.userName] = 0;
        }
        userTimes[checkin.userName] += (checkin.exerciseTime || 0);
      });
      
      return Object.entries(userTimes)
        .map(([name, time]) => ({ 
          name, 
          time: time, // 分钟
          hours: Math.round(time / 60 * 10) / 10 // 小时（保留1位小数）
        }))
        .sort((a, b) => b.time - a.time);
    } catch (error) {
      logger.error('获取运动时间排行榜失败', error);
      return [];
    }
  }

  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}小时`;
      } else {
        return `${hours}小时${remainingMinutes}分钟`;
      }
    }
  }

  async hasCheckedToday(userName, date) {
    try {
      const data = await this.loadData();
      return data.checkins.some(
        checkin => checkin.userName === userName && checkin.date === date
      );
    } catch (error) {
      logger.error('检查今日打卡状态失败', error);
      return false;
    }
  }

  async getTodayCount(date) {
    try {
      const data = await this.loadData();
      return data.checkins.filter(checkin => checkin.date === date).length;
    } catch (error) {
      logger.error('获取今日打卡数量失败', error);
      return 0;
    }
  }

  async getTodayStats(date) {
    try {
      const data = await this.loadData();
      const todayCheckins = data.checkins.filter(checkin => checkin.date === date);
      
      return {
        count: todayCheckins.length,
        checkedUsers: todayCheckins.map(checkin => checkin.userName),
        checkins: todayCheckins
      };
    } catch (error) {
      logger.error('获取今日统计失败', error);
      return { count: 0, checkedUsers: [], checkins: [] };
    }
  }

  async getUserStreak(userName) {
    try {
      const data = await this.loadData();
      const userCheckins = data.checkins
        .filter(checkin => checkin.userName === userName)
        .map(checkin => checkin.date)
        .sort((a, b) => new Date(b) - new Date(a));

      if (userCheckins.length === 0) return 0;

      let streak = 0;
      let currentDate = moment();
      
      // 检查今天是否已打卡
      const todayStr = currentDate.format('YYYY-MM-DD');
      if (userCheckins.includes(todayStr)) {
        streak = 1;
      } else {
        // 如果今天没打卡，从昨天开始算
        currentDate = currentDate.subtract(1, 'day');
      }
      
      // 计算连续天数
      for (let i = 0; i < userCheckins.length; i++) {
        const checkinDate = moment(userCheckins[i]);
        const expectedDate = currentDate.format('YYYY-MM-DD');
        
        if (checkinDate.format('YYYY-MM-DD') === expectedDate) {
          if (i === 0 && !userCheckins.includes(todayStr)) {
            streak = 1; // 第一次匹配且今天没打卡
          } else if (i > 0) {
            streak++;
          }
          currentDate = currentDate.subtract(1, 'day');
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      logger.error('计算用户连续打卡失败', error);
      return 0;
    }
  }

  async getUserWeeklyCount(userName) {
    try {
      const data = await this.loadData();
      const oneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
      
      return data.checkins.filter(checkin => 
        checkin.userName === userName && checkin.date >= oneWeekAgo
      ).length;
    } catch (error) {
      logger.error('获取用户周打卡数失败', error);
      return 0;
    }
  }

  async getUserMonthlyCount(userName) {
    try {
      const data = await this.loadData();
      const oneMonthAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
      
      return data.checkins.filter(checkin => 
        checkin.userName === userName && checkin.date >= oneMonthAgo
      ).length;
    } catch (error) {
      logger.error('获取用户月打卡数失败', error);
      return 0;
    }
  }

  async getWeeklyRanking() {
    try {
      const data = await this.loadData();
      const oneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');
      
      const weeklyCheckins = data.checkins.filter(
        checkin => checkin.date >= oneWeekAgo
      );
      
      const userCounts = {};
      weeklyCheckins.forEach(checkin => {
        userCounts[checkin.userName] = (userCounts[checkin.userName] || 0) + 1;
      });
      
      return Object.entries(userCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('获取周排行榜失败', error);
      return [];
    }
  }

  async getMonthlyRanking() {
    try {
      const data = await this.loadData();
      const oneMonthAgo = moment().subtract(30, 'days').format('YYYY-MM-DD');
      
      const monthlyCheckins = data.checkins.filter(
        checkin => checkin.date >= oneMonthAgo
      );
      
      const userCounts = {};
      monthlyCheckins.forEach(checkin => {
        userCounts[checkin.userName] = (userCounts[checkin.userName] || 0) + 1;
      });
      
      return Object.entries(userCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('获取月排行榜失败', error);
      return [];
    }
  }

  async getWeeklyReport() {
    try {
      const lastWeekStart = moment().subtract(1, 'week').startOf('week');
      const lastWeekEnd = moment().subtract(1, 'week').endOf('week');
      
      const data = await this.loadData();
      const weeklyCheckins = data.checkins.filter(checkin => {
        const checkinDate = moment(checkin.date);
        return checkinDate.isBetween(lastWeekStart, lastWeekEnd, 'day', '[]');
      });
      
      const userCounts = {};
      weeklyCheckins.forEach(checkin => {
        userCounts[checkin.userName] = (userCounts[checkin.userName] || 0) + 1;
      });
      
      const ranking = Object.entries(userCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
      // 计算平均打卡数
      const avgCheckins = ranking.length > 0 
        ? (weeklyCheckins.length / ranking.length).toFixed(1)
        : 0;
      
      let report = `📈 上周运动打卡总结\n`;
      report += `📅 ${lastWeekStart.format('MM-DD')} 至 ${lastWeekEnd.format('MM-DD')}\n\n`;
      report += `💪 总打卡次数: ${weeklyCheckins.length}次\n`;
      report += `👥 参与人数: ${ranking.length}人\n`;
      report += `📊 人均打卡: ${avgCheckins}次\n\n`;
      
      if (ranking.length > 0) {
        report += `🏆 上周排行榜:\n`;
        ranking.slice(0, 5).forEach((user, index) => {
          const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
          const medal = medals[index] || '🔸';
          report += `${medal} ${user.name}: ${user.count}次\n`;
        });
        
        // 添加一些鼓励性的评价
        if (ranking[0].count >= 7) {
          report += `\n👑 ${ranking[0].name} 完美一周，真是运动达人！`;
        } else if (weeklyCheckins.length >= ranking.length * 5) {
          report += `\n🎉 群体表现优秀，大家都很积极！`;
        }
      }
      
      report += `\n\n🎯 新的一周，继续加油！💪`;
      
      return report;
    } catch (error) {
      logger.error('生成周报失败', error);
      return '📈 生成上周总结时遇到问题，请稍后再试。';
    }
  }

  async getOverallStats() {
    try {
      const data = await this.loadData();
      const allUsers = [...new Set(data.checkins.map(c => c.userName))];
      const totalCheckins = data.checkins.length;
      const startDate = data.checkins.length > 0 
        ? moment(data.checkins[0].date).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');
      
      return {
        totalUsers: allUsers.length,
        totalCheckins,
        startDate,
        avgDaily: totalCheckins > 0 ? (totalCheckins / moment().diff(startDate, 'days')).toFixed(1) : 0
      };
    } catch (error) {
      logger.error('获取总体统计失败', error);
      return {
        totalUsers: 0,
        totalCheckins: 0,
        startDate: moment().format('YYYY-MM-DD'),
        avgDaily: 0
      };
    }
  }

  async exportData() {
    try {
      const data = await this.loadData();
      const exportFile = path.join(this.dataDir, `export-${moment().format('YYYY-MM-DD-HHmm')}.json`);
      await fs.writeJson(exportFile, data, { spaces: 2 });
      logger.info('数据导出成功', { exportFile });
      return exportFile;
    } catch (error) {
      logger.error('数据导出失败', error);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = CheckinManager;
