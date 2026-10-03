const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')

const STATUS_TEXT = { 0: '已请假', 1: '到会', 2: '缺席', 3: '未设置' }

function today() {
  const d = new Date()
  const p = (n) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'apply',
    meetings: [],
    meetingIndex: -1,
    meetingOpen: false,
    reason: '',
    reasonLength: 0,
    canSubmit: false,
    submitting: false,
    myStatus: null,
    statusText: '',
    records: []
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    this.meetingId = null
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      activeTab: options.tab === 'records' ? 'records' : 'apply'
    })
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    this.loadContext()
  },

  /** 请假针对当前会议（简单版无独立审批流）：拉会议名 + 我的参会状态 */
  loadContext() {
    ensureCurrentMeeting()
      .then((meeting) => {
        this.meetingId = meeting.id
        const name = meeting.meetingName || meeting.title || '当前会议'
        this.setData({ meetings: [name], meetingIndex: 0 })
        this.checkSubmit()
        return request(API.appMyStatus(meeting.id), { silent: true })
      })
      .then((res) => {
        const status = res.data ? res.data.status : null
        this.setData({
          myStatus: status,
          statusText: STATUS_TEXT[status] || '未知',
          records: status === 0 ? [this.buildStatusRecord()] : []
        })
      })
      .catch((err) => {
        if (err && err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  buildStatusRecord() {
    return {
      id: 'status',
      title: this.data.meetings[0] || '当前会议',
      status: 'approved',
      statusText: '已请假',
      date: today(),
      reason: '—',
      approver: '—'
    }
  },

  onTab(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.tab,
      meetingOpen: false
    })
  },

  onToggleMeeting() {
    this.setData({ meetingOpen: !this.data.meetingOpen })
  },

  onSelectMeeting(e) {
    this.setData({
      meetingIndex: Number(e.currentTarget.dataset.index),
      meetingOpen: false
    })
    this.checkSubmit()
  },

  onReasonInput(e) {
    const reason = e.detail.value
    this.setData({
      reason,
      reasonLength: reason.length,
      meetingOpen: false
    })
    this.checkSubmit()
  },

  checkSubmit() {
    const canSubmit =
      this.data.meetingIndex >= 0 && this.data.reasonLength >= 10
    this.setData({ canSubmit })
  },

  onSubmit() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请完善必填项', icon: 'none' })
      return
    }
    if (this.data.submitting) {
      return
    }
    if (this.data.myStatus === 0) {
      wx.showToast({ title: '您已提交过请假', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    request(API.appLeave(this.meetingId), { method: 'POST' })
      .then(() => {
        const records = [
          {
            id: Date.now(),
            title: this.data.meetings[this.data.meetingIndex],
            status: 'approved',
            statusText: '已请假',
            date: today(),
            reason: this.data.reason,
            approver: '—'
          },
          ...this.data.records.filter((r) => r.id !== 'status')
        ]
        this.setData({
          records,
          reason: '',
          reasonLength: 0,
          canSubmit: false,
          submitting: false,
          myStatus: 0,
          statusText: '已请假',
          activeTab: 'records'
        })
        wx.showToast({ title: '已提交请假', icon: 'success' })
      })
      .catch((err) => {
        this.setData({ submitting: false })
        wx.showToast({ title: err.message || '提交失败', icon: 'none' })
      })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
