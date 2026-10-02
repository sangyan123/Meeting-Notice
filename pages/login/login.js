const { login, getToken } = require('../../utils/request')

Page({
  data: {
    statusBarHeight: 20,
    account: '',
    password: '',
    submitting: false
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
    // 已有会话则等用户信息拉取完成后再进入首页
    if (getToken()) {
      getApp()
        .fetchUserInfo()
        .then(() => {
          wx.switchTab({ url: '/pages/index/index' })
        })
    }
  },

  onAccount(e) {
    this.setData({ account: e.detail.value.trim() })
  },

  onPassword(e) {
    this.setData({ password: e.detail.value })
  },

  onSubmit() {
    const { account, password, submitting } = this.data
    if (submitting) {
      return
    }
    if (!account || !password) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    wx.showLoading({ title: '登录中...', mask: true })
    login(account, password)
      .then(() => getApp().fetchUserInfo())
      .then(() => {
        wx.hideLoading()
        wx.switchTab({ url: '/pages/index/index' })
      })
      .catch((err) => {
        wx.hideLoading()
        wx.showToast({ title: err.message || '登录失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ submitting: false })
      })
  }
})
