const { request, serverLogout, getToken } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')

Page({
  data: {
    statusBarHeight: 20,
    userInfo: {},
    infoRows: [],
    recordMenus: [
      { id: 'noticeRsvp', label: '通知回执记录', img: '/assets/icons/nav-bell.png' },
      { id: 'rsvp', label: '参会填报记录', img: '/assets/icons/menu-rsvp.png' },
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
      infoRows: this.buildInfoRows(user)
    })
    this.fetchIdentity()
  },

  buildInfoRows(u) {
    return [
      { label: '代表编号', value: u.delegateNo || u.account || '—' },
      { label: '代表团', value: u.delegation || u.deptName || u.company || '—' },
      { label: '专委会', value: u.committee || u.position || '—' },
      { label: '座位号', value: u.seat || '—' }
    ]
  },

  /** 会议维度代表身份（代表证号/代表团/专委会/座位），无进行中会议时保留账号信息兜底 */
  fetchIdentity() {
    if (!getToken()) {
      return
    }
    ensureCurrentMeeting()
      .then((meeting) =>
        request(API.appDelegateIdentity, {
          data: { meetingId: meeting.id },
          silent: true
        })
      )
      .then((body) => {
        const d = body.data || {}
        if (!d.accountId) {
          return
        }
        const app = getApp()
        const merged = {
          ...this.data.userInfo,
          name: d.name || this.data.userInfo.name,
          phone: d.phone || this.data.userInfo.phone,
          position: d.position || this.data.userInfo.position,
          company: d.company || this.data.userInfo.company,
          delegateNo: d.delegateNo || '',
          delegation: d.delegation || '',
          committee: d.committee || '',
          seat: d.seatNo || ''
        }
        merged.avatarText = merged.name ? merged.name.charAt(0) : '客'
        app.globalData.userInfo = merged
        this.setData({ userInfo: merged, infoRows: this.buildInfoRows(merged) })
      })
      .catch(() => {})
  },

  onMenuTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === 'noticeRsvp') {
      wx.navigateTo({ url: '/pages/receipt-record/receipt-record' })
      return
    }
    if (id === 'rsvp') {
      wx.navigateTo({ url: '/pages/info-record/info-record' })
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
      wx.navigateTo({ url: '/pages/message-setting/message-setting' })
    }
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      success(res) {
        if (res.confirm) {
          // 同时通知服务端销毁会话，避免旧 token 继续有效
          serverLogout()
        }
      }
    })
  }
})
