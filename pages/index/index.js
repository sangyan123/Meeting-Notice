const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { formatMeetingTime, parseDate, formatDateCn } = require('../../utils/date')
const { mapNoticeRow } = require('../../utils/notices')
const { ensureCurrentMeeting } = require('../../utils/meeting')

Page({
  data: {
    statusBarHeight: 20,
    headerPaddingTop: 20,
    userName: '',
    userDelegation: '',
    currentMeetingName: '',
    todayText: '',
    userAvatar: '',
    unreadCount: 0,
    loading: true,
    showInfoForm: true,
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
      userDelegation: user.delegation || user.deptName || user.company || '',
      userAvatar: user.avatar || '',
      todayText: this.buildTodayText()
    })
  },

  /** 顶部时间行：今天日期 + 时间 + 星期 */
  buildTodayText() {
    const now = new Date()
    const week = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()]
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    return `${formatDateCn(now)} ${hh}:${mm} 星期${week}`
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    const app = getApp()
    const user = app.globalData.userInfo || {}
    this.setData({
      userName: user.name || user.account || '',
      userDelegation: user.delegation || user.deptName || user.company || '',
      userAvatar: user.avatar || '',
      todayText: this.buildTodayText()
    })
    this.startTimeTicker()
    this.loadUserAvatar()

    // 首页 onShow 可能早于 onLaunch 中的用户信息请求完成；
    // 这里等待同一个 Promise，回来后立即补显示姓名。
    if (!user.name && !user.account) {
      const ready = app.userInfoPromise || app.fetchUserInfo()
      ready.then((info) => {
        if (info && (info.name || info.account) && !this.data.userName) {
          this.setData({ userName: info.name || info.account })
        }
        if (info && !this.data.userDelegation) {
          const delegation = info.delegation || info.deptName || info.company || ''
          if (delegation) {
            this.setData({ userDelegation: delegation })
          }
        }
        if (info && info.avatar) {
          this.setData({ userAvatar: info.avatar })
        }
      })
    }

    this.fetchHome()
  },

  /** 顶部时间行：今天日期 + 时间 + 星期，每30秒自刷新 */
  startTimeTicker() {
    if (this.timeTimer) {
      return
    }
    this.timeTimer = setInterval(() => {
      this.setData({ todayText: this.buildTodayText() })
    }, 30000)
  },

  onHide() {
    if (this.timeTimer) {
      clearInterval(this.timeTimer)
      this.timeTimer = null
    }
  },

  onUnload() {
    if (this.timeTimer) {
      clearInterval(this.timeTimer)
      this.timeTimer = null
    }
  },

  /** 下拉刷新：重新拉取首页数据（含会务配置开关） */
  onPullDownRefresh() {
    this.fetchHome().finally(() => wx.stopPullDownRefresh())
  },

  /** 头像位已保留；当前接口有头像时显示真实头像，否则继续显示白色占位图 */
  loadUserAvatar() {
    const app = getApp()
    if (app.globalData.userInfo && app.globalData.userInfo.avatar) {
      this.setData({ userAvatar: app.globalData.userInfo.avatar })
    }

    ensureCurrentMeeting()
      .then((meeting) =>
        request(API.appDelegateIdentity, {
          data: { meetingId: meeting.id },
          silent: true
        })
      )
      .then((body) => {
        const avatar = (body.data && (body.data.avatar || body.data.avatarUrl)) || ''
        if (!avatar) return
        app.globalData.userInfo = {
          ...(app.globalData.userInfo || {}),
          avatar
        }
        this.setData({ userAvatar: avatar })
      })
      .catch(() => {})
  },

  /** 真实头像加载失败时回退到占位图 */
  onAvatarError() {
    this.setData({ userAvatar: '' })
  },

  fetchHome() {
    this.setData({ loading: true })
    const latestNotices = request(API.appNoticeLatest, { data: { limit: 5 }, silent: true })
      .then((body) => body)
      .catch(() => null)
    return Promise.all([
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
          this.setData({ currentMeetingName: current.meetingName || '' })

          // 会务配置开关：infoEnabled=0 时隐藏首页「参会信息填报」入口（缺省/1 显示）
          request(API.appServiceConfig, { data: { meetingId: current.id }, silent: true })
            .then((cfg) => {
              const d = (cfg && cfg.data) || {}
              this.setData({ showInfoForm: d.infoEnabled !== 0 })
            })
            .catch(() => {})
        } else {
          this.setData({ currentMeetingName: '' })
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
        throw err
      })
      .catch(() => {})
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
