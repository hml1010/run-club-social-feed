
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class CheckinManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.dataFile = path.join(this.dataDir, 'checkins.json');
    this.ensureDataFile();
  }

  async ensureDataFile() {
    await fs.ensureDir(this.dataDir);
    if (!await fs.pathExists(this.dataFile)) {
      await fs.writeJson(this.dataFile, { checkins: [] });
    }
  }

  async loadData() {
    try {
      return await fs.readJson(this.dataFile);
    } catch (error) {
      console.error('读取数据文件失败:', error);
      return { checkins: [] };
    }
  }

  async saveData(data) {
    try {
      await fs.writeJson(this.dataFile, data, { spaces: 2 });
    } catch (error) {
      console.error('保存数据文件失败:', error);
    }
  }

  async addCheckin(checkinData) {
    const data = await this.loadData();
    data.checkins.push(checkinData);
    await this.saveData(data);
    console.log(`记录打卡: ${checkinData.userName} - ${checkinData.date}`);
  }

  async hasCheckedToday(userName, date) {
    const data = await this.loadData();
    return data.checkins.some(
      checkin => checkin.userName === userName && checkin.date === date
    );
  }

  async getTodayCount(date) {
    const data = await this.loadData();
    return data.checkins.filter(checkin => checkin.date === date).length;
  }

  async getTodayStats(date) {
    const data = await this.loadData();
    const todayCheckins = data.checkins.filter(checkin => checkin.date === date);
    
    return {
      count: todayCheckins.length,
      checkedUsers: todayCheckins.map(checkin => checkin.userName)
    };
  }

  async getUserStreak(userName) {
    const data = await this.loadData();
    const userCheckins = data.checkins
      .filter(checkin => checkin.userName === userName)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (userCheckins.length === 0) return 0;

    let streak = 0;
    let currentDate = moment();
    
    for (const checkin of userCheckins) {
      const checkinDate = moment(checkin.date);
      
      if (checkinDate.isSame(currentDate, 'day')) {
        streak++;
        currentDate = currentDate.subtract(1, 'day');
      } else if (checkinDate.isSame(currentDate.subtract(1, 'day'), 'day')) {
        streak++;
        currentDate = currentDate.subtract(1, 'day');
      } else {
        break;
      }
    }
    
    return streak;
  }

  async getWeeklyRanking() {
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
  }

  async getWeeklyReport() {
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
    
    let report = `📈 上周运动打卡总结\n`;
    report += `📅 ${lastWeekStart.format('MM-DD')} 至 ${lastWeekEnd.format('MM-DD')}\n\n`;
    report += `💪 总打卡次数: ${weeklyCheckins.length}次\n`;
    report += `👥 参与人数: ${Object.keys(userCounts).length}人\n\n`;
    
    if (ranking.length > 0) {
      report += `🏆 上周排行榜:\n`;
      ranking.slice(0, 5).forEach((user, index) => {
        const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index];
        report += `${medal} ${user.name}: ${user.count}次\n`;
      });
    }
    
    report += `\n🎯 新的一周，继续加油！`;
    
    return report;
  }
}

module.exports = CheckinManager;
