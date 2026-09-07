Page({
  data: {
    statusBarHeight: 20,
    submitTime: '',
    rows: []
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const record = getApp().globalData.infoRecord || {}
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      submitTime: record.submitTime || '',
      rows: record.rows || []
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
