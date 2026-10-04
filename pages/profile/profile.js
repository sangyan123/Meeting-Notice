const { logout } = require('../../utils/request')

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
    const user = getApp().globalData.userInfo || {}
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      userInfo: user,
      infoRows: [
        { label: '代表编号', value: user.delegateNo || user.account || '—' },
        { label: '代表团', value: user.delegation || user.deptName || user.company || '—' },
        { label: '专委会', value: user.committee || user.position || '—' },
        { label: '座位号', value: user.seat || '—' }
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
    // 会议指南、联系秘书处均与会务服务 Tab 内容一致，直接切 Tab
    if (id === 'guide' || id === 'contact') {
      wx.switchTab({ url: '/pages/services/services' })
      return
    }
    if (id === 'msg') {
      wx.showToast({ title: '消息设置开发中', icon: 'none' })
    }
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      success(res) {
        if (res.confirm) {
          logout()
        }
      }
    })
  }
})
