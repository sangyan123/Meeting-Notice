const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')
const { formatDateTime } = require('../../utils/date')

/** 请假申请状态（t_meeting_leave.status）→ 页面徽标 */
const STATUS_MAP = {
  0: { cls: 'pending', text: '待处理' },
  1: { cls: 'approved', text: '已同意' },
  2: { cls: 'rejected', text: '已驳回' }
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

  /** 请假针对当前会议：展示会议名，并拉取本人申请历史（含审批人/意见） */
  loadContext() {
    ensureCurrentMeeting()
      .then((meeting) => {
        this.meetingId = meeting.id
        const name = meeting.meetingName || meeting.title || '当前会议'
        this.setData({ meetings: [name], meetingIndex: 0 })
        this.checkSubmit()
        return request(API.appLeaveMyList, {
          data: { meetingId: meeting.id },
          silent: true
        })
      })
      .then((body) => {
        const rows = (body.data && body.data.rows) || []
        this.setData({ records: rows.map((row) => this.mapLeaveRow(row)) })
      })
      .catch((err) => {
        if (err && err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  mapLeaveRow(row) {
    const status = STATUS_MAP[row.status] || STATUS_MAP[0]
    return {
      id: row.id,
      title: row.meetingName || this.data.meetings[0] || '当前会议',
      status: status.cls,
      statusText: status.text,
      date: formatDateTime(row.submitTime),
      reason: row.reason || '—',
      approver: row.approveAccountName || '—',
      opinion: row.approveOpinion || ''
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
    this.setData({ submitting: true })
    request(API.appLeaveApply, {
      method: 'POST',
      data: { meetingId: this.meetingId, reason: this.data.reason.trim() }
    })
      .then((body) => {
        const saved = body.data || {}
        const record = this.mapLeaveRow({
          id: saved.id,
          meetingName: this.data.meetings[this.data.meetingIndex],
          status: saved.status,
          reason: this.data.reason,
          submitTime: saved.submitTime
        })
        this.setData({
          records: [record, ...this.data.records],
          reason: '',
          reasonLength: 0,
          canSubmit: false,
          submitting: false,
          activeTab: 'records'
        })
        wx.showToast({ title: '已提交，等待审批', icon: 'success' })
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
