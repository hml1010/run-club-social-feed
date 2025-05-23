
Page({
  data: {
    rankingData: [
      { rank: 1, name: '李董', score: 2850, change: '+2' },
      { rank: 2, name: '老张', score: 2720, change: '+1' },
      { rank: 3, name: '王总', score: 2650, change: '-1' },
      { rank: 4, name: '赵总', score: 2480, change: '0' },
      { rank: 5, name: '刘总', score: 2350, change: '+3' },
      { rank: 6, name: '孙总', score: 2200, change: '+1' },
      { rank: 7, name: '周总', score: 2100, change: '-2' },
      { rank: 8, name: '吴总', score: 1950, change: '+1' }
    ],
    myRank: {
      rank: 6,
      score: 2200,
      totalDays: 25,
      totalHours: 45,
      avgScore: 88
    },
    scoreRules: [
      { desc: '完成日常运动打卡', score: 10 },
      { desc: '运动时长超过30分钟', score: 5 },
      { desc: '运动时长超过60分钟', score: 10 },
      { desc: '连续打卡3天', score: 20 },
      { desc: '连续打卡7天', score: 50 },
      { desc: '邀请新成员加入', score: 100 },
      { desc: '获得其他成员点赞', score: 2 }
    ]
  },

  onLoad() {
    this.loadRankingData();
  },

  loadRankingData() {
    // 实际项目中调用云函数获取排行榜数据
    console.log('加载排行榜数据');
  }
});
