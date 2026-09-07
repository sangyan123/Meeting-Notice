Page({
  data: {
    statusBarHeight: 20,
    buses: [
      {
        id: 1,
        no: '01',
        time: '07:30',
        route: '北京饭店 南门 → 人民大会堂 南广场',
        current: 32,
        capacity: 45,
        percent: 71,
        full: false
      },
      {
        id: 2,
        no: '02',
        time: '08:00',
        route: '北京饭店 南门 → 人民大会堂 南广场',
        current: 45,
        capacity: 45,
        percent: 100,
        full: true
      },
      {
        id: 3,
        no: '03',
        time: '11:30',
        route: '人民大会堂 南广场 → 北京饭店 南门',
        current: 28,
        capacity: 45,
        percent: 62,
        full: false
      },
      {
        id: 4,
        no: '04',
        time: '14:00',
        route: '北京饭店 南门 → 人民大会堂 南广场',
        current: 19,
        capacity: 45,
        percent: 42,
        full: false
      },
      {
        id: 5,
        no: '05',
        time: '18:30',
        route: '人民大会堂 南广场 → 北京饭店 南门',
        current: 38,
        capacity: 45,
        percent: 84,
        full: false
      }
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
