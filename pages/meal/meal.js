Page({
  data: {
    statusBarHeight: 20,
    meals: [
      {
        id: 1,
        name: '早餐',
        time: '06:30—08:30',
        place: '北京饭店 二楼餐厅',
        note: '自助形式，中西餐均有',
        highlight: false
      },
      {
        id: 2,
        name: '午餐',
        time: '12:00—13:30',
        place: '人民大会堂 宴会厅',
        note: '按代表团安排，凭证就餐',
        highlight: false
      },
      {
        id: 3,
        name: '晚餐',
        time: '18:00—20:00',
        place: '北京饭店 二楼餐厅',
        note: '自助形式，提供素食选项',
        highlight: false
      },
      {
        id: 4,
        name: '开幕晚宴',
        time: '18:30—21:00 (3/5)',
        place: '人民大会堂 北大厅',
        note: '正式宴请，着正装出席',
        highlight: true
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
