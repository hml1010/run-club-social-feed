
App({
  globalData: {
    userInfo: null,
    openId: null
  },

  onLaunch() {
    console.log('小程序启动');
    
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        traceUser: true
      });
    }

    // 检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    wx.checkSession({
      success: () => {
        console.log('登录状态有效');
        // 获取用户信息
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
          this.globalData.userInfo = userInfo;
        }
      },
      fail: () => {
        console.log('登录状态已过期，需要重新登录');
        this.login();
      }
    });
  },

  // 用户登录
  login() {
    wx.login({
      success: (res) => {
        console.log('登录成功，code:', res.code);
        // 这里可以调用云函数获取openId和session_key
        this.getOpenId(res.code);
      },
      fail: (err) => {
        console.error('登录失败：', err);
      }
    });
  },

  // 获取openId
  getOpenId(code) {
    // 实际项目中调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: { code },
      success: (res) => {
        console.log('获取openId成功：', res.result);
        this.globalData.openId = res.result.openId;
        wx.setStorageSync('openId', res.result.openId);
      },
      fail: (err) => {
        console.error('获取openId失败：', err);
      }
    });
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.globalData.userInfo = res.userInfo;
          wx.setStorageSync('userInfo', res.userInfo);
          resolve(res.userInfo);
        },
        fail: reject
      });
    });
  }
});
