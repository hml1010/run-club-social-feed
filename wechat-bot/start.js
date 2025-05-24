
const SportsCheckinBot = require('./src/bot');
const logger = require('./src/logger');

logger.info('🤖 启动老胡私董会运动打卡机器人...');

const bot = new SportsCheckinBot();
bot.start();

// 优雅退出处理
process.on('SIGINT', () => {
  logger.info('收到退出信号，正在关闭机器人...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('收到终止信号，正在关闭机器人...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', { reason, promise });
});
