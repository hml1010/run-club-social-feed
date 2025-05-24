
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDir();
  }

  async ensureLogDir() {
    await fs.ensureDir(this.logDir);
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
    
    // 控制台输出
    console.log(logString);
    if (data) {
      console.log('数据:', data);
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
}

module.exports = new Logger();
