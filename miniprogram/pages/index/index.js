
// 模拟数据
const mockFeedData = [
  {
    id: 1,
    user: { name: '老张', avatar: '/images/avatar1.png', level: '网球达人' },
    activity: '网球',
    duration: '90分钟',
    calories: 520,
    time: '2小时前',
    location: '国际网球中心',
    likes: 15,
    comments: 6,
    description: '今天和李总切磋了几局，正手击球感觉越来越好了！🎾 明天继续约战'
  },
  {
    id: 2,
    user: { name: '王总', avatar: '/images/avatar2.png', level: '健身专家' },
    activity: '力量训练',
    duration: '75分钟',
    calories: 380,
    time: '4小时前',
    location: '私人健身房',
    likes: 12,
    comments: 4,
    description: '今日训练计划完成！卧推又突破了新的重量 💪 坚持就是胜利'
  }
];

const mockRankingData = [
  { rank: 1, name: '李董', score: 2850, change: '+2' },
  { rank: 2, name: '老张', score: 2720, change: '+1' },
  { rank: 3, name: '王总', score: 2650, change: '-1' }
];

Page({
  data: {
    feedData: mockFeedData,
    topRanking: mockRankingData,
    weeklyStats: {
      days: 4,
      daysProgress: 80,
      duration: 280,
      durationProgress: 93
    },
    showCheckin: false,
    sportTypes: ['网球', '健身', '慢跑', '登山', '游泳', '瑜伽'],
    checkinForm: {
      sportIndex: 0,
      duration: '',
      description: ''
    }
  },

  onLoad() {
    this.getUserInfo();
    this.loadFeedData();
  },

  // 获取用户信息
  getUserInfo() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('用户信息：', res.userInfo);
        // 这里可以将用户信息保存到全局状态或本地存储
      },
      fail: (err) => {
        console.log('获取用户信息失败：', err);
      }
    });
  },

  // 加载动态数据
  loadFeedData() {
    // 实际项目中这里会调用云函数或API
    console.log('加载动态数据');
  },

  // 显示打卡模态框
  showCheckinModal() {
    this.setData({
      showCheckin: true
    });
  },

  // 隐藏打卡模态框
  hideCheckinModal() {
    this.setData({
      showCheckin: false,
      checkinForm: {
        sportIndex: 0,
        duration: '',
        description: ''
      }
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止点击模态框内容时关闭模态框
  },

  // 运动类型选择
  onSportChange(e) {
    this.setData({
      'checkinForm.sportIndex': e.detail.value
    });
  },

  // 时长输入
  onDurationInput(e) {
    this.setData({
      'checkinForm.duration': e.detail.value
    });
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({
      'checkinForm.description': e.detail.value
    });
  },

  // 提交打卡
  submitCheckin() {
    const { sportIndex, duration, description } = this.data.checkinForm;
    const { sportTypes } = this.data;

    if (!duration) {
      wx.showToast({
        title: '请输入运动时长',
        icon: 'none'
      });
      return;
    }

    // 这里调用云函数提交打卡数据
    console.log('提交打卡：', {
      sport: sportTypes[sportIndex],
      duration: duration,
      description: description
    });

    wx.showToast({
      title: '打卡成功！',
      icon: 'success'
    });

    this.hideCheckinModal();
    this.loadFeedData(); // 重新加载数据
  },

  // 点赞
  toggleLike(e) {
    const id = e.currentTarget.dataset.id;
    console.log('切换点赞状态：', id);
    
    // 这里实现点赞逻辑
    wx.showToast({
      title: '已点赞',
      icon: 'success'
    });
  },

  // 跳转到排行榜
  goToRanking() {
    wx.switchTab({
      url: '/pages/ranking/ranking'
    });
  }
});
