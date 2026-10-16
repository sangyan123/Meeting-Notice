const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { formatMeetingTime, formatMeetingRange, parseDate } = require('../../utils/date')
const { mapNoticeRow } = require('../../utils/notices')

Page({
  data: {
    statusBarHeight: 20,
    headerPaddingTop: 20,
    userName: '',
    meetingInfo: {},
    unreadCount: 0,
    loading: true,
    todayMeetings: [],
    notices: []
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const app = getApp()
    const statusBarHeight = sys.statusBarHeight || 20
    let headerPaddingTop = statusBarHeight
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect()
      if (rect && rect.bottom) {
        headerPaddingTop = rect.bottom + (rect.top - statusBarHeight)
      }
    }
    const user = app.globalData.userInfo || {}
    this.setData({
      statusBarHeight,
      headerPaddingTop,
      userName: user.name || user.account || '',
      meetingInfo: app.globalData.meetingInfo
    })
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    const app = getApp()
    const user = app.globalData.userInfo || {}
    this.setData({ userName: user.name || user.account || '' })

    // 首页 onShow 可能早于 onLaunch 中的用户信息请求完成；
    // 这里等待同一个 Promise，回来后立即补显示姓名。
    if (!user.name && !user.account) {
      const ready = app.userInfoPromise || app.fetchUserInfo()
      ready.then((info) => {
        if (info && (info.name || info.account) && !this.data.userName) {
          this.setData({ userName: info.name || info.account })
        }
      })
    }

    this.fetchHome()
  },

  fetchHome() {
    this.setData({ loading: true })
    const latestNotices = request(API.appNoticeLatest, { data: { limit: 5 }, silent: true })
      .then((body) => body)
      .catch(() => null)
    Promise.all([
      request(API.currentMeeting),
      request(API.appInfoList),
      latestNotices
    ])
      .then(([currentRes, listRes, noticeRes]) => {
        const app = getApp()
        const current = currentRes.data || null
        const all = Array.isArray(listRes.data) ? listRes.data : []

        if (current && current.id) {
          app.globalData.meetingId = current.id
          app.globalData.meetingInfo = {
            ...app.globalData.meetingInfo,
            title: current.meetingName || '',
            dateRange: formatMeetingRange(current.startTime, current.endTime)
          }
        }

        const today0 = new Date()
        today0.setHours(0, 0, 0, 0)
        const tomorrow0 = today0.getTime() + 86400000
        const meetings = all
          .filter((m) => {
            const s = parseDate(m.startTime)
            const e = parseDate(m.endTime)
            if (!s && !e) return false
            return (s || e).getTime() < tomorrow0 && (e || s).getTime() >= today0.getTime()
          })
          .sort(
            (a, b) =>
              (parseDate(a.startTime) || parseDate(a.endTime)).getTime() -
              (parseDate(b.startTime) || parseDate(b.endTime)).getTime()
          )

        const noticeData = (noticeRes && noticeRes.data) || {}
        const noticeRows = Array.isArray(noticeData.rows) ? noticeData.rows : []
        const notices = noticeRows
          .map(mapNoticeRow)
          .filter(Boolean)
          .map((n) => ({ ...n, time: (n.datetime || '').slice(5, 16) }))

        this.setData({
          loading: false,
          meetingInfo: app.globalData.meetingInfo,
          unreadCount: noticeData.unreadCount || 0,
          notices,
          todayMeetings: meetings.map((m) => ({
            id: m.id,
            title: m.meetingName || '未命名会议',
            time: formatMeetingTime(m.startTime, m.endTime),
            place: m.meetingLocation || '地点待定'
          }))
        })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '加载失败', icon: 'none' })
      })
  },

  onBellTap() {
    wx.navigateTo({ url: '/pages/notices/notices' })
  },

  onInfoForm() {
    wx.navigateTo({ url: '/pages/info-form/info-form' })
  },

  onAllSchedule() {
    wx.switchTab({ url: '/pages/schedule/schedule' })
  },

  onMeetingDetail(e) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) return
    wx.navigateTo({ url: `/pages/meeting-detail/meeting-detail?id=${id}` })
  },

  onAllNotices() {
    wx.navigateTo({ url: '/pages/notices/notices' })
  },

  onNoticeTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/notice-detail/notice-detail?id=${id}` })
  }
})
