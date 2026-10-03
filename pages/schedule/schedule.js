const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')

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

/** 日程行（dayType 上午/下午）转页面卡片结构 */
function buildItem(daily) {
  const dayType = Number(daily.dayType)
  const contents = (daily.contents || []).map((c) => {
    const topics = (c.topicList || []).map((t) => t.topicName).join('、')
    return {
      id: c.id,
      name: c.contentName || c.agendaName || '议程内容',
      // 内容名与议题名相同时不重复展示
      topics: topics && topics !== c.contentName ? topics : ''
    }
  })
  return {
    id: `${daily.dayStr}_${daily.dayType}`,
    dayType,
    title: daily.title || (contents[0] && contents[0].name) || '会议安排',
    tag: dayType === 0 ? '上午' : dayType === 1 ? '下午' : '全天',
    tagType: dayType === 0 ? 'plenary' : 'delegation',
    time: dayType === 0 ? '上午' : dayType === 1 ? '下午' : '全天',
    place: (contents[0] && contents[0].name) || '议程待定',
    type: daily.isSystem === 1 ? '系统日程' : '会议日程',
    expanded: false,
    contents
  }
}

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
    ensureCurrentMeeting()
      .then((meeting) => request(API.meetingDailyList, { data: { meetingId: meeting.id } }))
      .then((res) => {
        // 新版后端在 data，旧版分页结构在 rows，两者都兼容
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.rows) ? res.rows : []
        this.buildDays(list)
        this.setData({ loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '加载日程失败', icon: 'none' })
      })
  },

  /** 按天分组并生成日期 Tab；今天在会期内时默认选中今天 */
  buildDays(dailyList) {
    const byDay = {}
    dailyList.forEach((daily) => {
      // 库里 day_str 为 "2026-09-10"，归一化为 "20260910"，日期解析与"今天"匹配统一走 8 位数字
      const day = String(daily.dayStr || '').replace(/\D/g, '')
      if (!byDay[day]) {
        byDay[day] = []
      }
      byDay[day].push(buildItem(daily))
    })

    const todayStr = (() => {
      const d = new Date()
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    })()

    const days = Object.keys(byDay).sort()
    const dates = days.map((day) => {
      const d = parseDayStr(day)
      if (!d) {
        return { id: day, md: day, week: '', full: day }
      }
      return {
        id: day,
        md: `${d.getMonth() + 1}月${d.getDate()}`,
        week: WEEKS[d.getDay()],
        full: `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日`
      }
    })

    const scheduleMap = {}
    days.forEach((day) => {
      // 上午(0)在前，其余排后
      scheduleMap[day] = byDay[day].sort((a, b) => a.dayType - b.dayType)
    })

    const activeDate = dates.some((d) => d.id === todayStr) ? todayStr : dates[0] ? dates[0].id : ''
    this.setData({ dates, scheduleMap })
    if (activeDate) {
      this.refreshList(activeDate)
    } else {
      this.setData({ currentMeetings: [], currentSummary: '暂无日程安排' })
    }
  },

  refreshList(dateId) {
    const date = this.data.dates.find((d) => d.id === dateId)
    const list = (this.data.scheduleMap[dateId] || []).map((item) => ({ ...item }))
    this.setData({
      activeDate: dateId,
      currentMeetings: list,
      currentSummary: date ? `${date.full} 共 ${list.length} 项安排` : ''
    })
  },

  onSelectDate(e) {
    this.refreshList(e.currentTarget.dataset.id)
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id
    const currentMeetings = this.data.currentMeetings.map((item) => {
      if (item.id === id) {
        return { ...item, expanded: !item.expanded }
      }
      return item
    })
    this.setData({ currentMeetings })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
