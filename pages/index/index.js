const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { formatMeetingTime, formatMeetingRange, parseDate } = require('../../utils/date')

Page({
  data: {
    statusBarHeight: 20,
    headerPaddingTop: 20,
    meetingInfo: {},
    unreadCount: 2,
    loading: true,
    quickNav: [
      { id: 'schedule', label: '会议日程', img: '/assets/icons/nav-calendar.png' },
      { id: 'guide', label: '会议指南', img: '/assets/icons/nav-guide.png' },
      { id: 'refs', label: '参阅材料', img: '/assets/icons/nav-docs.png' }
    ],
    todayMeetings: [],
    // 后端暂无面向代表的通知接口，最新通知暂保留静态演示数据
    notices: [
      {
        id: 1,
        title: '关于大会开幕式有关事项的通知',
        tag: '会前通知',
        tagType: 'pre',
        time: '16:00'
      },
      {
        id: 2,
        title: '关于分组审议政府工作报告的通知',
        tag: '会中通知',
        tagType: 'mid',
        time: '12:00'
      }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const app = getApp()
    const statusBarHeight = sys.statusBarHeight || 20
    // 自定义导航下，头部内容需下移到微信胶囊按钮下方：
    // 胶囊底边 + 胶囊与状态栏之间的间距（上下间距对称）
    let headerPaddingTop = statusBarHeight
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect()
      if (rect && rect.bottom) {
        headerPaddingTop = rect.bottom + (rect.top - statusBarHeight)
      }
    }
    this.setData({
      statusBarHeight,
      headerPaddingTop,
      meetingInfo: app.globalData.meetingInfo
    })
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    this.fetchHome()
  },

  fetchHome() {
    this.setData({ loading: true })
    Promise.all([
      request(API.currentMeeting),
      request(API.appInfoList)
    ])
      .then(([currentRes, listRes]) => {
        const app = getApp()
        const current = currentRes.data || null
        const all = Array.isArray(listRes.data) ? listRes.data : []

        if (current && current.id) {
          app.globalData.meetingId = current.id
          app.globalData.meetingInfo = {
            org: app.globalData.meetingInfo.org,
            title: current.meetingName || '',
            dateRange: formatMeetingRange(current.startTime, current.endTime)
          }
        }

        // 今日会议与Web会议信息页同口径：数据范围内、会期覆盖今天的会议
        const today0 = new Date()
        today0.setHours(0, 0, 0, 0)
        const tomorrow0 = today0.getTime() + 86400000
        const meetings = all
          .filter((m) => {
            const s = parseDate(m.startTime)
            const e = parseDate(m.endTime)
            if (!s && !e) {
              return false
            }
            return (s || e).getTime() < tomorrow0 && (e || s).getTime() >= today0.getTime()
          })
          .sort(
            (a, b) =>
              (parseDate(a.startTime) || parseDate(a.endTime)).getTime() -
              (parseDate(b.startTime) || parseDate(b.endTime)).getTime()
          )

        this.setData({
          loading: false,
          meetingInfo: app.globalData.meetingInfo,
          todayMeetings: meetings.map((m) => ({
            id: m.id,
            noticeId: null,
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

  onQuickNav(e) {
    const { id } = e.currentTarget.dataset
    if (id === 'schedule') {
      wx.navigateTo({ url: '/pages/schedule/schedule' })
      return
    }
    if (id === 'guide') {
      // 会议指南与会务服务 Tab 内容一致，直接切 Tab
      wx.switchTab({ url: '/pages/services/services' })
      return
    }
    if (id === 'refs') {
      // 参阅材料与会议材料 Tab 内容一致，直接切 Tab
      wx.switchTab({ url: '/pages/materials/materials' })
    }
  },

  onAllSchedule() {
    wx.navigateTo({ url: '/pages/schedule/schedule' })
  },

  onMeetingDetail(e) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) {
      return
    }
    wx.navigateTo({
      url: `/pages/meeting-detail/meeting-detail?id=${id}`
    })
  },

  onAllNotices() {
    wx.navigateTo({ url: '/pages/notices/notices' })
  },

  onNoticeTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  }
})
