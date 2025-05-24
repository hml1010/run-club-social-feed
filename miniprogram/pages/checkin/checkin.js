
Page({
  data: {
    sportTypes: ['网球', '健身', '慢跑', '登山', '游泳', '瑜伽'],
    checkinForm: {
      sportIndex: 0,
      duration: '',
      description: '',
      location: ''
    },
    imageList: []
  },

  onLoad() {
    // 获取位置信息
    this.getCurrentLocation();
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        // 根据经纬度获取地址
        this.getLocationName(res.latitude, res.longitude);
      },
      fail: () => {
        this.setData({
          'checkinForm.location': '未知位置'
        });
      }
    });
  },

  // 根据经纬度获取地址名称
  getLocationName(latitude, longitude) {
    // 这里可以调用地图API获取地址名称
    this.setData({
      'checkinForm.location': `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    });
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

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          imageList: [...this.data.imageList, ...res.tempFilePaths]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const imageList = this.data.imageList;
    imageList.splice(index, 1);
    this.setData({ imageList });
  },

  // 提交打卡
  submitCheckin() {
    const { sportIndex, duration, description, location } = this.data.checkinForm;
    const { sportTypes, imageList } = this.data;

    if (!duration) {
      wx.showToast({
        title: '请输入运动时长',
        icon: 'none'
      });
      return;
    }

    // 上传图片到云存储
    this.uploadImages().then((imageUrls) => {
      // 提交打卡数据到云数据库
      const checkinData = {
        sport: sportTypes[sportIndex],
        duration: parseInt(duration),
        description: description,
        location: location,
        images: imageUrls,
        createTime: new Date(),
        userId: getApp().globalData.openId
      };

      console.log('提交打卡：', checkinData);
      
      wx.showToast({
        title: '打卡成功！',
        icon: 'success'
      });

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    });
  },

  // 上传图片
  uploadImages() {
    const { imageList } = this.data;
    if (imageList.length === 0) return Promise.resolve([]);

    const uploadPromises = imageList.map((imagePath, index) => {
      return wx.cloud.uploadFile({
        cloudPath: `checkin/${Date.now()}_${index}.jpg`,
        filePath: imagePath
      });
    });

    return Promise.all(uploadPromises).then((results) => {
      return results.map(res => res.fileID);
    });
  }
});
