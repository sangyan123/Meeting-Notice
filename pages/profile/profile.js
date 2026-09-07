Page({
  data: {
    statusBarHeight: 20,
    userInfo: {},
    infoRows: [],
    recordMenus: [
      { id: 'rsvp', icon: '☑', label: '我的回执记录' },
      { id: 'leave', icon: '📋', label: '我的请假记录' }
    ],
    settingMenus: [
      { id: 'msg', icon: '⚙', label: '消息设置' },
      { id: 'guide', icon: 'ℹ', label: '会议指南' },
      { id: 'contact', icon: '☎', label: '联系秘书处' }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const user = getApp().globalData.userInfo
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      userInfo: user,
      infoRows: [
        { label: '代表编号', value: user.delegateNo },
        { label: '代表团', value: user.delegation },
        { label: '专委会', value: user.committee },
        { label: '座位号', value: user.seat }
      ]
    })
  },

  onMenuTap(e) {
    const map = {
      rsvp: '我的回执记录',
      leave: '我的请假记录',
      msg: '消息设置',
      guide: '会议指南',
      contact: '联系秘书处'
    }
    wx.showToast({
      title: `${map[e.currentTarget.dataset.id] || ''}开发中`,
      icon: 'none'
    })
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      success(res) {
        if (res.confirm) {
          wx.showToast({ title: '已退出', icon: 'none' })
        }
      }
    })
  }
})
