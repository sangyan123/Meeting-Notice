Page({
  data: {
    statusBarHeight: 20,
    hotelName: '北京饭店',
    address: '北京市东城区长安街1号',
    distance: '距人民大会堂约 1.2 公里',
    hotelRows: [
      { label: '住宿酒店', value: '北京饭店' },
      { label: '房间号', value: '1208室' },
      { label: '入住时间', value: '3月4日 14:00起' },
      { label: '退房时间', value: '3月12日 12:00前' },
      { label: '客服电话', value: '010-6513-7766' }
    ],
    tips: [
      '请凭工作证、代表证办理入住手续',
      '会议期间如有特殊需求，请联系秘书处',
      '酒店提供24小时叫早服务，请提前预约',
      '房间内配备打印、复印等办公设备'
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
