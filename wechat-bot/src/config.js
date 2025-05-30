
module.exports = {
  // 目标群聊名称（根据日志中的实际群名更新）
  TARGET_ROOM_NAME: '【老胡】私董会4.0日课]',
  
  // 打卡关键词
  CHECKIN_KEYWORDS: [
    '打卡', '运动', '健身', '跑步', '网球',
    '游泳', '瑜伽', '登山', '骑行', '篮球',
    '羽毛球', '乒乓球', '足球', '徒步'
  ],
  
  // 时区设置
  TIMEZONE: 'Asia/Shanghai',
  
  // 提醒时间设置
  REMINDERS: {
    MORNING: '0 9 * * *',     // 每日9点
    EVENING: '0 18 * * *',    // 每日18点
    WEEKLY: '0 9 * * 1'       // 每周一9点
  }
};
