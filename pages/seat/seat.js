const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')
const { formatMeetingTimeFull } = require('../../utils/date')

/** 电子排座基础版：展示当前会议分配给本人的座位（Web 排座保存时回写参会人 seat_no） */
Page({
  data: {
    statusBarHeight: 20,
    seatInfo: {
      seat: '待分配',
      group: '待分配',
      place: '—'
    },
    tableCard: '',
    meetingName: '—',
    meetingTime: '—',
    hasMap: false,
    mapName: '',
    mapRows: [],
    myMapSeat: ''
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
    this.loadSeat()
  },

  loadSeat() {
    ensureCurrentMeeting()
      .then((meeting) => {
        this.meetingId = meeting.id
        this.setData({
          meetingName: meeting.meetingName || '—',
          meetingTime: formatMeetingTimeFull(meeting.startTime, meeting.endTime) || '—',
          'seatInfo.place': meeting.meetingLocation || '—'
        })
        // 我的座位卡片与座位图分路加载，互不阻塞
        request(API.appMySeat(meeting.id), { silent: true })
          .then((res) => {
            const d = res.data || {}
            const user = getApp().globalData.userInfo || {}
            this.setData({
              'seatInfo.seat': d.seatNo || '待分配',
              'seatInfo.group': d.groupName || user.deptName || user.company || '待分配',
              tableCard: d.tableCard || ''
            })
          })
          .catch((err) => {
            if (err && err.message !== 'unauthorized') {
              wx.showToast({ title: err.message || '座位加载失败', icon: 'none' })
            }
          })
        return request(API.appSeatMap(meeting.id), { silent: true })
      })
      .then((res) => {
        this.applySeatMap(res.data)
      })
      .catch((err) => {
        if (err && err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '座位加载失败', icon: 'none' })
        }
      })
  },

  /** 座位图数据 → 按行分组（行内按列排序），供网格渲染 */
  applySeatMap(data) {
    const seats = (data && data.seats) || []
    if (!seats.length) {
      this.setData({ hasMap: false, mapRows: [], myMapSeat: '' })
      return
    }
    const byRow = {}
    seats.forEach((s) => {
      const r = s.r == null ? 0 : s.r
      ;(byRow[r] = byRow[r] || []).push(s)
    })
    const rows = Object.keys(byRow)
      .map(Number)
      .sort((a, b) => a - b)
      .map((r) => ({
        idx: r,
        cells: byRow[r].sort((a, b) => (a.c || 0) - (b.c || 0))
      }))
    const mine = seats.find((s) => s.mine)
    this.setData({
      hasMap: true,
      mapName: (data && data.layoutName) || '',
      mapRows: rows,
      myMapSeat: mine ? mine.no || mine.name || '' : ''
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
