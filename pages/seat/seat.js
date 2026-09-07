Page({
  data: {
    statusBarHeight: 20,
    myZone: 3,
    seatInfo: {
      seat: '3区14排22座',
      delegation: '北京代表团',
      area: '大礼堂 3区',
      entrance: '南门 C 通道'
    },
    topZones: [
      { id: 1, name: '1区' },
      { id: 2, name: '2区' },
      { id: 3, name: '3区' }
    ],
    bottomZones: [
      { id: 4, name: '4区' },
      { id: 5, name: '5区' }
    ],
    facilities: [
      { label: '安全出口', value: '南门、北门各2处' },
      { label: '卫生间', value: '西侧走廊' },
      { label: '医疗点', value: '大会堂西厅' }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const user = getApp().globalData.userInfo
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      'seatInfo.seat': user.seat,
      'seatInfo.delegation': user.delegation
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
