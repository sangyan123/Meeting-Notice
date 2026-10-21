const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 20,
    meetingOptions: [],
    meetingIndex: -1,
    applicant: '',
    startDate: '',
    endDate: '',
    reason: '',
    canSubmit: false,
    submitting: false
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const app = getApp()
    const user = app.globalData.userInfo || {}
    const applicant = user.delegation
      ? `${user.name || ''} · ${user.delegation}`.trim()
      : user.name || ''
    this.meetingId = null
    this.setData({ statusBarHeight: sys.statusBarHeight || 20, applicant })
    this.loadMeetings()
    this.checkSubmit()
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    // 已有列表时无需重复拉取；未选中时尝试按当前会议补选
    if (this.data.meetingOptions.length && this.data.meetingIndex < 0) {
      this.applyDefaultMeeting()
    }
  },

  /** 拉取本人参加的会议列表（后端仅返回参会人可见、排除创建中的会议） */
  loadMeetings() {
    request(API.appMyMeetingList)
      .then((body) => {
        const rows = (body && body.data) || []
        this.setData({
          meetingOptions: rows.map((m) => ({
            id: m.id,
            meetingName: m.meetingName || '',
            status: m.status
          }))
        })
        this.applyDefaultMeeting()
      })
      .catch((err) => {
        wx.showToast({ title: err.message || '获取会议列表失败', icon: 'none' })
      })
  },

  /** 默认选中当前进行中的会议；不在列表中时回退第一场进行中/第一场 */
  applyDefaultMeeting() {
    const options = this.data.meetingOptions
    if (!options.length) {
      this.setData({ meetingIndex: -1 })
      this.meetingId = null
      this.checkSubmit()
      return
    }
    const currentId = getApp().globalData.meetingId
    let index = options.findIndex((m) => m.id === currentId)
    if (index < 0) {
      const activeIdx = options.findIndex((m) => m.status === 1)
      index = activeIdx > -1 ? activeIdx : 0
    }
    this.setData({ meetingIndex: index })
    this.meetingId = options[index].id
    this.checkSubmit()
  },

  /** 切换会议 */
  onMeetingChange(e) {
    const index = Number(e.detail.value)
    const opt = this.data.meetingOptions[index]
    if (!opt || opt.id === this.meetingId) return
    this.setData({ meetingIndex: index })
    this.meetingId = opt.id
    this.checkSubmit()
  },

  onStartChange(e) {
    this.setData({ startDate: e.detail.value })
    this.checkSubmit()
  },

  onEndChange(e) {
    this.setData({ endDate: e.detail.value })
    this.checkSubmit()
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value })
    this.checkSubmit()
  },

  checkSubmit() {
    const { startDate, endDate, reason } = this.data
    const datesOk = !!(startDate && endDate && endDate >= startDate)
    this.setData({ canSubmit: !!(datesOk && reason.trim()) })
  },

  onSubmit() {
    if (this.data.submitting) {
      return
    }
    const { startDate, endDate, reason } = this.data
    if (!startDate || !endDate || endDate < startDate) {
      wx.showToast({ title: '请选择请假起止日期', icon: 'none' })
      return
    }
    if (!reason.trim()) {
      wx.showToast({ title: '请填写请假原因', icon: 'none' })
      return
    }
    if (!this.meetingId) {
      wx.showToast({ title: '请先选择会议', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    request(API.appLeaveApply, {
      method: 'POST',
      data: {
        meetingId: this.meetingId,
        reason: reason.trim(),
        startDate,
        endDate
      }
    })
      .then(() => {
        wx.redirectTo({ url: '/pages/leave-record/leave-record' })
      })
      .catch((err) => {
        this.setData({ submitting: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '提交失败', icon: 'none' })
        }
      })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
