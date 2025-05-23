
Page({
  data: {
    userInfo: {
      nickName: '私董会成员',
      avatarUrl: '/images/default-avatar.png',
      consecutiveDays: 12
    },
    userStats: {
      totalScore: 2580,
      totalDays: 85,
      totalHours: 126
    },
    menuItems: [
      { icon: '📈', title: '我的数据统计', action: 'stats' },
      { icon: '🎯', title: '目标设置', action: 'goals' },
      { icon: '🏆', title: '我的成就', action: 'achievements' },
      { icon: '👥', title: '邀请好友', action: 'invite' },
      { icon: '⚙️', title: '设置', action: 'settings' },
      { icon: '❓', title: '帮助与反馈', action: 'help' }
    ]
  },

  onLoad() {
    this.getUserInfo();
    this.loadUserStats();
  },

  getUserInfo() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  loadUserStats() {
    // 加载用户统计数据
    console.log('加载用户统计数据');
  },

  onMenuTap(e) {
    const action = e.currentTarget.dataset.action;
    
    switch (action) {
      case 'goals':
        wx.switchTab({
          url: '/pages/goals/goals'
        });
        break;
      case 'invite':
        this.inviteFriends();
        break;
      case 'settings':
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        });
        break;
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        });
    }
  },

  inviteFriends() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          // 可以跳转到登录页面
        }
      }
    });
  }
});
