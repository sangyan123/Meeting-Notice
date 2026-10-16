Page({
  data: {
    statusBarHeight: 20,
    hotline: {
      title: '服务热线（24小时）',
      phone: '0812-6309-0000'
    },
    groups: [
      {
        id: 'coordination',
        name: '综合协调组',
        contact: '李主任',
        tag: '会议整体协调',
        phone: '0812-6309-1001'
      },
      {
        id: 'service',
        name: '会务服务组',
        contact: '王干事',
        tag: '住宿、餐饮、交通',
        phone: '0812-6309-1002'
      },
      {
        id: 'material',
        name: '文件材料组',
        contact: '赵干事',
        tag: '会议材料收发',
        phone: '0812-6309-1003'
      },
      {
        id: 'technical',
        name: '技术保障组',
        contact: '陈干事',
        tag: '音视频、网络',
        phone: '0812-6309-1004'
      }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
  },

  onCall(e) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) return
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {}
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
