const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')

Page({
  data: {
    statusBarHeight: 20,
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
    this.checkSubmit()
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    // 请假针对当前进行中的会议，页面不展示会议选择
    ensureCurrentMeeting()
      .then((meeting) => {
        this.meetingId = meeting.id
        this.checkSubmit()
      })
      .catch(() => {})
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
      wx.showToast({ title: '当前没有进行中的会议', icon: 'none' })
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
