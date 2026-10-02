const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')

/** 宽松解析后端时间：兼容 "yyyy-MM-dd HH:mm:ss"、ISO 串与时间戳 */
function parseDate(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }
  if (typeof value === 'number') {
    return new Date(value)
  }
  const str = String(value).replace('T', ' ')
  const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?: (\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (m) {
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0))
  }
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}

function fmtHM(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 会议时间展示：同日 "09:00—12:00"，跨日 "03-05 09:00—03-07 12:00" */
function formatMeetingTime(start, end) {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s && !e) {
    return '时间待定'
  }
  if (s && e) {
    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate()
    if (sameDay) {
      return `${fmtHM(s)}—${fmtHM(e)}`
    }
    return `${pad(s.getMonth() + 1)}-${pad(s.getDate())} ${fmtHM(s)}—${pad(e.getMonth() + 1)}-${pad(e.getDate())} ${fmtHM(e)}`
  }
  const d = s || e
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${fmtHM(d)}`
}

/** 大会日期区间展示："2024年3月5日—3月11日" */
function formatMeetingRange(start, end) {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s) {
    return ''
  }
  const startText = `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日`
  if (!e) {
    return startText
  }
  if (
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth()
  ) {
    return `${startText}—${e.getDate()}日`
  }
  return `${startText}—${e.getFullYear()}年${e.getMonth() + 1}月${e.getDate()}日`
}

Page({
  data: {
    statusBarHeight: 20,
    headerPaddingTop: 20,
    meetingInfo: {},
    unreadCount: 2,
    loading: true,
    quickNav: [
      { id: 'schedule', label: '大会日程', img: '/assets/icons/nav-calendar.png' },
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
      request(API.todayMeetings)
    ])
      .then(([currentRes, todayRes]) => {
        const app = getApp()
        const current = currentRes.data || null
        const meetings = Array.isArray(todayRes.data) ? todayRes.data : []

        if (current && current.id) {
          app.globalData.meetingId = current.id
          app.globalData.meetingInfo = {
            org: app.globalData.meetingInfo.org,
            title: current.meetingName || '',
            dateRange: formatMeetingRange(current.startTime, current.endTime)
          }
        }

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
      wx.navigateTo({ url: '/pages/guide/guide' })
      return
    }
    if (id === 'refs') {
      wx.navigateTo({ url: '/pages/refs/refs' })
    }
  },

  onAllSchedule() {
    wx.navigateTo({ url: '/pages/schedule/schedule' })
  },

  onMeetingDetail(e) {
    const id = Number(e.currentTarget.dataset.id)
    const meeting = this.data.todayMeetings.find((item) => item.id === id)
    // 真实会议暂无关联通知详情，先以 Toast 占位
    if (!meeting || !meeting.noticeId) {
      wx.showToast({ title: '会议详情开发中', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${meeting.noticeId}`
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
