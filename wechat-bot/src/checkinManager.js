
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
      data.checkins.push({
        ...checkinData,
        id: this.generateId(),
        createdAt: new Date().toISOString()
      });
      await this.saveData(data);
      logger.info('记录打卡成功', { 
        userName: checkinData.userName, 
        date: checkinData.date 
      });
    } catch (error) {
      logger.error('添加打卡记录失败', error);
      throw error;
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
}

module.exports = CheckinManager;
