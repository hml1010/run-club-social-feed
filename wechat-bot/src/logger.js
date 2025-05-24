
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDir();
  }

  async ensureLogDir() {
    try {
      await fs.ensureDir(this.logDir);
    } catch (error) {
      console.error('创建日志目录失败:', error);
    }
  }

  getLogFileName() {
    return path.join(this.logDir, `bot-${moment().format('YYYY-MM-DD')}.log`);
  }

  async log(level, message, data = null) {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logString = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    // 控制台输出（根据日志级别使用不同颜色）
    const colors = {
      error: '\x1b[31m',   // 红色
      warn: '\x1b[33m',    // 黄色
      info: '\x1b[32m',    // 绿色
      debug: '\x1b[36m',   // 青色
      reset: '\x1b[0m'     // 重置
    };

    console.log(`${colors[level] || colors.reset}${logString}${colors.reset}`);
    if (data) {
      console.log('数据:', JSON.stringify(data, null, 2));
    }

    // 文件输出
    try {
      const fileName = this.getLogFileName();
      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(fileName, logLine);
    } catch (error) {
      console.error('写入日志失败:', error);
    }
  }

  info(message, data) {
    return this.log('info', message, data);
  }

  error(message, data) {
    return this.log('error', message, data);
  }

  warn(message, data) {
    return this.log('warn', message, data);
  }

  debug(message, data) {
    return this.log('debug', message, data);
  }

  // 清理旧日志文件（保留最近30天）
  async cleanOldLogs() {
    try {
      const files = await fs.readdir(this.logDir);
      const logFiles = files.filter(file => file.endsWith('.log'));
      const cutoffDate = moment().subtract(30, 'days');

      for (const file of logFiles) {
        const fileDate = moment(file.match(/\d{4}-\d{2}-\d{2}/)?.[0]);
        if (fileDate.isValid() && fileDate.isBefore(cutoffDate)) {
          await fs.unlink(path.join(this.logDir, file));
          this.info('清理旧日志文件', { file });
        }
      }
    } catch (error) {
      this.error('清理日志文件失败', error);
    }
  }
}

module.exports = new Logger();
