const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { parseDate, formatMeetingTime } = require('../../utils/date')

/** 会议状态：与后端 t_meeting_main.status 保持一致（1=发布后未开始，对外展示"待开"） */
const STATUS = {
  0: { text: '预备', type: 'pending' },
  1: { text: '待开', type: 'pending' },
  2: { text: '已结束', type: 'ended' }
}

/** 短日期："10月20日"；跨日 "10月20日—21日" */
function shortDate(d) {
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDateText(start, end) {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s && !e) {
    return '日期待定'
  }
  if (s && e) {
    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate()
    if (!sameDay) {
      return `${shortDate(s)}—${shortDate(e)}`
    }
  }
  return shortDate(s || e)
}

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    meeting: null,
    topics: []
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
    this.meetingId = Number(options.id)
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    this.loadDetail()
  },

  loadDetail() {
    if (!this.meetingId) {
      wx.showToast({ title: '缺少会议参数', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    // 议题列表失败不阻塞详情展示（旧后端可能没有该接口）
    Promise.all([
      request(API.meetingInfo(this.meetingId)),
      request(API.meetingFiles(this.meetingId), { silent: true }).catch(() => null)
    ])
      .then(([infoRes, filesRes]) => {
        this.applyData(infoRes.data || {}, filesRes && Array.isArray(filesRes.data) ? filesRes.data : [])
        this.setData({ loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '加载会议详情失败', icon: 'none' })
      })
  },

  applyData(data, topicList) {
    const m = data.meeting || {}
    const status = STATUS[Number(m.status)] || {}

    this.setData({
      meeting: {
        title: m.meetingName || '未命名会议',
        statusText: status.text || '',
        statusType: status.type || '',
        dateText: formatDateText(m.startTime, m.endTime),
        timeText: formatMeetingTime(m.startTime, m.endTime),
        location: m.meetingLocation || '地点待定'
      },
      topics: topicList
        .filter((t) => t.topicName)
        .map((t, i) => ({
          id: t.topicId != null ? t.topicId : i,
          name: t.topicName
        }))
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
