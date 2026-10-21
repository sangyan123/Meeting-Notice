const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    /** 按会议分组：[{ meetingId, meetingName, buses: [] }]，仅含班次不为空的会议 */
    groups: [],
    /** 预约/取消请求进行中，防止重复提交 */
    booking: false
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
    this.fetchBuses()
  },

  /** 聚合本人所有会议的班次，按会议分组展示（无班次的会议不显示；单会议拉取失败时跳过） */
  fetchBuses() {
    this.setData({ loading: true })
    request(API.appMyMeetingList)
      .then((body) => {
        const meetings = (body && body.data) || []
        if (!meetings.length) return []
        return Promise.all(
          meetings.map((m) =>
            request(API.appBusList, { data: { meetingId: m.id } })
              .then((res) => ({ meeting: m, rows: (res.data && res.data.rows) || [] }))
              .catch(() => null)
          )
        )
      })
      .then((results) => {
        const groups = []
        ;(results || []).forEach((item) => {
          if (!item || !item.rows.length) return
          groups.push({
            meetingId: item.meeting.id,
            meetingName: item.meeting.meetingName || '',
            buses: item.rows.map((row, index) => this.mapBus(row, index))
          })
        })
        this.setData({ loading: false, groups })
      })
      .catch((err) => {
        this.setData({ loading: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  /** 班次行 → 页面展示模型（capacity 0=不限；status 0=停运） */
  mapBus(row, index) {
    const unlimited = !row.capacity
    const capacity = row.capacity || 0
    const occupied = row.occupied || 0
    const stopped = row.status === 0
    const full = !unlimited && occupied >= capacity
    const myBooked = !!row.myBooked
    return {
      id: row.id,
      no: row.shiftName || `班次${index + 1}`,
      date: row.busDate || '',
      time: row.departTime || '—',
      route: `${row.origin || '—'} → ${row.destination || '—'}`,
      current: occupied,
      capacity: unlimited ? '不限' : capacity,
      percent: unlimited ? 0 : Math.min(100, Math.round((occupied / capacity) * 100)),
      stopped,
      full,
      myBooked,
      bookable: !stopped && !full && !myBooked,
      remark: row.remark || ''
    }
  },

  onBookTap(e) {
    const busId = Number(e.currentTarget.dataset.id)
    const bus = this.findBus(busId)
    if (!bus || !bus.bookable || this.data.booking) {
      return
    }
    this.setData({ booking: true })
    request(API.appBusBook(busId), { method: 'POST' })
      .then(() => {
        this.setData({ booking: false })
        wx.showToast({ title: '预约成功', icon: 'success' })
        // 重新拉取以刷新占用人数与本人预约状态
        this.fetchBuses()
      })
      .catch((err) => {
        this.setData({ booking: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '预约失败', icon: 'none' })
        }
      })
  },

  onCancelBookTap(e) {
    const busId = Number(e.currentTarget.dataset.id)
    if (this.data.booking) {
      return
    }
    wx.showModal({
      title: '取消预约',
      content: '确认取消该班次的预约？',
      success: (res) => {
        if (!res.confirm) {
          return
        }
        this.setData({ booking: true })
        request(API.appBusCancelBook(busId), { method: 'DELETE' })
          .then(() => {
            this.setData({ booking: false })
            wx.showToast({ title: '已取消预约', icon: 'success' })
            this.fetchBuses()
          })
          .catch((err) => {
            this.setData({ booking: false })
            if (err.message !== 'unauthorized') {
              wx.showToast({ title: err.message || '取消失败', icon: 'none' })
            }
          })
      }
    })
  },

  /** 跨会议分组查找班次 */
  findBus(busId) {
    for (const group of this.data.groups) {
      const bus = group.buses.find((b) => b.id === busId)
      if (bus) return bus
    }
    return null
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
