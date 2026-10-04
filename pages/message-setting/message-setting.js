Page({
  data: {
    statusBarHeight: 20
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
