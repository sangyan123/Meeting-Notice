const { request, serverLogout, getToken } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')

Page({
  data: {
    statusBarHeight: 20,
    headerPaddingTop: 20,
    userInfo: {},
    infoRows: [],
    manageMenus: [
      { id: 'manage', label: '会务管理', img: '/assets/icons/svc-info-blue.png' }
    ],
    recordMenus: [
      { id: 'noticeRsvp', label: '我的回执记录', img: '/assets/icons/menu-rsvp-blue.png' },
      { id: 'leave', label: '我的请假记录', img: '/assets/icons/menu-leave-blue.png' }
    ],
    settingMenus: [
      { id: 'msg', label: '消息设置', img: '/assets/icons/menu-setting-blue.png' },
      { id: 'contact', label: '联系秘书处', img: '/assets/icons/menu-phone-blue.png' }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const app = getApp()
    const user = app.globalData.userInfo || {}
    const statusBarHeight = sys.statusBarHeight || 20
    let headerPaddingTop = statusBarHeight + 24
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect()
      if (rect && rect.bottom) {
        headerPaddingTop = rect.bottom + (rect.top - statusBarHeight)
      }
    }
    this.setData({
      statusBarHeight,
      headerPaddingTop,
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

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      success(res) {
        if (res.confirm) {
          serverLogout()
        }
      }
    })
  }
})
