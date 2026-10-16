const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { formatMeetingTime, parseDate } = require('../../utils/date')

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}

function dateText(value) {
  const d = parseDate(value)
  return d ? `${d.getMonth() + 1}月${d.getDate()}日` : '日期待定'
}

/** 日程 Tab：待开会议为未结束会议，历史会议为已结束（status === 2）会议 */
Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'pending',
    pendingMeetings: [],
    historyMeetings: [],
    currentMeetings: [],
    loading: true
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
        this.buildLists(list)
        this.setData({ loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false, currentMeetings: [] })
        if (err && err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载日程失败', icon: 'none' })
        }
      })
  },

  buildLists(meetingList) {
    const mapItem = (m) => ({
      id: m.id,
      name: m.meetingName || '未命名会议',
      dateText: dateText(m.startTime || m.endTime),
      time: formatMeetingTime(m.startTime, m.endTime) || '时间待定',
      place: m.meetingLocation || '地点待定',
      sortTime: (parseDate(m.startTime) || parseDate(m.endTime) || new Date(0)).getTime()
    })

    // 明确按后端会议状态分类：2 = 已结束
    const pending = meetingList
      .filter((m) => Number(m.status) !== 2)
      .map(mapItem)
      .sort((a, b) => a.sortTime - b.sortTime)
    const history = meetingList
      .filter((m) => Number(m.status) === 2)
      .map(mapItem)
      .sort((a, b) => b.sortTime - a.sortTime)

    this.setData({ pendingMeetings: pending, historyMeetings: history })
    this.refreshCurrent()
  },

  refreshCurrent() {
    const { activeTab, pendingMeetings, historyMeetings } = this.data
    this.setData({
      currentMeetings: activeTab === 'history' ? historyMeetings : pendingMeetings
    })
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (!tab || tab === this.data.activeTab) return
    this.setData({ activeTab: tab }, () => this.refreshCurrent())
  },

  onMeetingTap(e) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) return
    wx.navigateTo({ url: `/pages/meeting-detail/meeting-detail?id=${id}` })
  }
})
