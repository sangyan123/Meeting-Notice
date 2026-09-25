Page({
  data: {
    statusBarHeight: 20,
    userInfo: {},
    infoRows: [],
    recordMenus: [
      { id: 'rsvp', label: '我的回执记录', img: '/assets/icons/menu-rsvp.png' },
      { id: 'leave', label: '我的请假记录', img: '/assets/icons/menu-leave.png' }
    ],
    settingMenus: [
      { id: 'msg', label: '消息设置', img: '/assets/icons/menu-setting.png' },
      { id: 'guide', label: '会议指南', img: '/assets/icons/menu-guide.png' },
      { id: 'contact', label: '联系秘书处', img: '/assets/icons/menu-phone.png' }
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
    const id = e.currentTarget.dataset.id
    if (id === 'rsvp') {
      wx.navigateTo({ url: '/pages/notices/notices' })
      return
    }
    if (id === 'leave') {
      wx.navigateTo({ url: '/pages/leave/leave?tab=records' })
      return
    }
    if (id === 'guide') {
      wx.navigateTo({ url: '/pages/guide/guide' })
      return
    }
    const map = {
      msg: '消息设置',
      guide: '会议指南',
      contact: '联系秘书处'
    }
    wx.showToast({
      title: `${map[id] || ''}开发中`,
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
