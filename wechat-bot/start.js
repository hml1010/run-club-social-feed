
const SportsCheckinBot = require('./src/bot');

console.log('🤖 启动老胡私董会运动打卡机器人...');

const bot = new SportsCheckinBot();
bot.start();

// 优雅退出处理
process.on('SIGINT', () => {
  console.log('\n收到退出信号，正在关闭机器人...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n收到终止信号，正在关闭机器人...');
  process.exit(0);
});
