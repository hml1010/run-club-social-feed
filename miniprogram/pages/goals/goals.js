
Page({
  data: {
    monthlyGoal: {
      current: 18,
      target: 20,
      progress: 90 // 百分比
    },
    sportStats: [
      { icon: '🎾', name: '网球', count: 8 },
      { icon: '🏋️‍♂️', name: '健身', count: 6 },
      { icon: '🏃‍♂️', name: '慢跑', count: 4 },
      { icon: '🏔️', name: '登山', count: 2 }
    ],
    weeklyGoals: {
      days: 5,
      duration: 300
    },
    achievements: [
      {
        icon: '🔥',
        title: '连续打卡7天',
        desc: '坚持一周运动打卡',
        completed: true
      },
      {
        icon: '💪',
        title: '运动达人',
        desc: '累计运动50小时',
        completed: true
      },
      {
        icon: '🏆',
        title: '排行榜前三',
        desc: '进入周排行榜前三名',
        completed: false
      },
      {
        icon: '⭐',
        title: '全勤王',
        desc: '一个月无缺勤',
        completed: false
      }
    ]
  },

  onLoad() {
    this.loadGoalData();
  },

  loadGoalData() {
    // 加载目标数据
    console.log('加载目标数据');
  },

  decreaseGoal(e) {
    const type = e.currentTarget.dataset.type;
    const key = `weeklyGoals.${type}`;
    const currentValue = this.data.weeklyGoals[type];
    
    if (type === 'days' && currentValue > 1) {
      this.setData({
        [key]: currentValue - 1
      });
    } else if (type === 'duration' && currentValue > 60) {
      this.setData({
        [key]: currentValue - 30
      });
    }
  },

  increaseGoal(e) {
    const type = e.currentTarget.dataset.type;
    const key = `weeklyGoals.${type}`;
    const currentValue = this.data.weeklyGoals[type];
    
    if (type === 'days' && currentValue < 7) {
      this.setData({
        [key]: currentValue + 1
      });
    } else if (type === 'duration' && currentValue < 600) {
      this.setData({
        [key]: currentValue + 30
      });
    }
  },

  saveGoals() {
    // 保存目标设置到云数据库
    console.log('保存目标：', this.data.weeklyGoals);
    
    wx.showToast({
      title: '目标已保存',
      icon: 'success'
    });
  }
});
