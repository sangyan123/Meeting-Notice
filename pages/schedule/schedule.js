const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { formatMeetingTime, parseDate } = require('../../utils/date')

/** "20250602" → Date；格式不符返回 null */
function parseDayStr(dayStr) {
  const m = String(dayStr || '').match(/^(\d{4})(\d{2})(\d{2})$/)
  if (!m) {
    return null
  }
  return new Date(+m[1], +m[2] - 1, +m[3])
}

const WEEKS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}

const STATUS = {
  0: { text: '预备', type: 'pending' },
  1: { text: '发布', type: 'published' },
  2: { text: '结束', type: 'ended' }
}

/** 会议日程：数据范围内所有会议按开始日期分组，点日期看当天会议信息（与Web会议信息页同口径） */
Page({
  data: {
    statusBarHeight: 20,
    activeDate: '',
    dates: [],
    loading: true,
    scheduleMap: {},
    currentMeetings: [],
    currentSummary: ''
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    this.loadSchedule()
  },

  loadSchedule() {
    this.setData({ loading: true })
    request(API.appInfoList)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        this.buildDays(list)
        this.setData({ loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false })
        if (err && err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载日程失败', icon: 'none' })
        }
      })
  },

  /** 会议按开始日期分组生成日期 Tab；今天在列时默认选中今天 */
  buildDays(meetingList) {
    const byDay = {}
    meetingList.forEach((m) => {
      const d = parseDate(m.startTime) || parseDate(m.endTime)
      if (!d) {
        return
      }
      const key = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
      ;(byDay[key] = byDay[key] || []).push({
        id: m.id,
        name: m.meetingName || '未命名会议',
        typeName: m.meetingTypeName || '',
        time: formatMeetingTime(m.startTime, m.endTime) || '时间待定',
        place: m.meetingLocation || '地点待定',
        statusText: (STATUS[m.status] || {}).text || '未知',
        statusType: (STATUS[m.status] || {}).type || 'ended',
        sortTime: (parseDate(m.startTime) || parseDate(m.endTime)).getTime()
      })
    })

    const days = Object.keys(byDay).sort()
    const dates = days.map((day) => {
      const d = parseDayStr(day)
      if (!d) {
        return { id: day, md: day, week: '', full: day }
      }
      return {
        id: day,
        md: `${d.getMonth() + 1}月${d.getDate()}日`,
        week: WEEKS[d.getDay()],
        full: `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日`
      }
    })

    const scheduleMap = {}
    days.forEach((day) => {
      scheduleMap[day] = byDay[day].sort((a, b) => a.sortTime - b.sortTime)
    })

    const todayStr = (() => {
      const d = new Date()
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    })()

    this.setData({ dates, scheduleMap })
    // 默认选中：今天 → 最近的未来日期 → 最后一场（避免打开就停在过去一年的旧会上）
    const activeDate = dates.some((d) => d.id === todayStr)
      ? todayStr
      : (dates.find((d) => d.id >= todayStr) || dates[dates.length - 1] || { id: '' }).id
    if (activeDate) {
      this.refreshList(activeDate)
    } else {
      this.setData({ currentMeetings: [], currentSummary: '暂无会议安排' })
    }
  },

  refreshList(dateId) {
    const date = this.data.dates.find((d) => d.id === dateId)
    const list = (this.data.scheduleMap[dateId] || []).map((item) => ({ ...item }))
    this.setData({
      activeDate: dateId,
      currentMeetings: list,
      currentSummary: date ? `${date.full} 共 ${list.length} 场会议` : ''
    })
  },

  onSelectDate(e) {
    this.refreshList(e.currentTarget.dataset.id)
  },

  onMeetingTap(e) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) {
      return
    }
    wx.navigateTo({ url: `/pages/meeting-detail/meeting-detail?id=${id}` })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
