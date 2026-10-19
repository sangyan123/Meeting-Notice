const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')
const { formatDateTime } = require('../../utils/date')

/** 请假申请状态（t_meeting_leave.status）→ 页面徽标 */
const STATUS_MAP = {
  0: { cls: 'pending', text: '待审批' },
  1: { cls: 'approved', text: '已批准' },
  2: { cls: 'rejected', text: '已驳回' }
}

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    records: [],
    selectedRecord: null
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
    this.loadRecords()
  },

  loadRecords() {
    this.setData({ loading: true })
    ensureCurrentMeeting()
      .then((meeting) =>
        request(API.appLeaveMyList, {
          data: { meetingId: meeting.id },
          silent: true
        })
      )
      .then((body) => {
        const rows = (body.data && body.data.rows) || []
        this.setData({
          loading: false,
          records: rows.map((row) => this.mapLeaveRow(row))
        })
      })
      .catch(() => {
        this.setData({ loading: false, records: [] })
      })
  },

  mapLeaveRow(row) {
    const status = STATUS_MAP[row.status] || STATUS_MAP[0]
    return {
      id: row.id,
      title: row.meetingName || '当前会议',
      status: status.cls,
      statusText: status.text,
      date: this.formatDate(row.meetingDate || row.meetingStartTime || row.submitTime),
      approver: row.approveAccountName || '—',
      reason: row.reason || '—'
    }
  },

  formatDate(value) {
    return (formatDateTime(value) || '').slice(0, 10)
  },

  /** 点击记录：展示详情弹窗 */
  onRecordTap(e) {
    const id = e.currentTarget.dataset.id
    const record = this.data.records.find((item) => item.id === id)
    if (record) {
      this.setData({ selectedRecord: record })
    }
  },

  onCloseDetail() {
    this.setData({ selectedRecord: null })
  },

  /** 阻止弹窗内部点击冒泡到遮罩 */
  stopPropagation() {},

  /** 顶部「+ 新申请」跳转请假申请页 */
  onNew() {
    wx.navigateTo({ url: '/pages/leave/leave' })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
