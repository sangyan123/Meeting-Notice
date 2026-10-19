const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { categoryTag } = require('../../utils/notices')
const { formatDateTime, formatMonthDayTime } = require('../../utils/date')

const PAGE_SIZE = 10

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    loadingMore: false,
    finished: false,
    list: [],
    detailVisible: false,
    detail: {}
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.pageNum = 1
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    this.reload()
  },

  reload() {
    this.pageNum = 1
    this.setData({ loading: true, finished: false })
    request(API.appNoticeMyReceipts, { data: { pageNum: 1, pageSize: PAGE_SIZE } })
      .then((body) => {
        const data = body.data || {}
        const rows = Array.isArray(data.rows) ? data.rows : []
        this.setData({
          loading: false,
          list: rows.map((row) => this.mapRow(row)),
          finished: rows.length < PAGE_SIZE
        })
      })
      .catch((err) => {
        this.setData({ loading: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  loadMore() {
    if (this.data.loading || this.data.loadingMore || this.data.finished) {
      return
    }
    this.setData({ loadingMore: true })
    const nextPage = this.pageNum + 1
    request(API.appNoticeMyReceipts, { data: { pageNum: nextPage, pageSize: PAGE_SIZE } })
      .then((body) => {
        const data = body.data || {}
        const rows = Array.isArray(data.rows) ? data.rows : []
        this.pageNum = nextPage
        this.setData({
          loadingMore: false,
          list: this.data.list.concat(rows.map((row) => this.mapRow(row))),
          finished: rows.length < PAGE_SIZE
        })
      })
      .catch(() => {
        this.setData({ loadingMore: false })
      })
  },

  onReachBottom() {
    this.loadMore()
  },

  mapRow(row) {
    const isLeave = row.receiptType === 'leave'
    return {
      id: row.id,
      noticeId: row.noticeId,
      title: row.noticeTitle || '（通知已删除）',
      tag: categoryTag(row.noticeCategory),
      tagType: row.noticeCategory || '',
      meetingName: row.meetingName || '',
      receiptText: isLeave ? '请假' : '出席',
      isLeave,
      reason: row.reason || '',
      submitTime: formatDateTime(row.submitTime),
      statusText: isLeave ? '已请假' : '已出席',
      timeText: formatMonthDayTime(row.submitTime)
    }
  },

  onItemTap(e) {
    const { index } = e.currentTarget.dataset
    const item = this.data.list[index]
    if (!item) {
      return
    }
    this.setData({
      detailVisible: true,
      detail: {
        meetingName: item.meetingName,
        isLeave: item.isLeave,
        statusText: item.statusText,
        timeText: item.timeText
      }
    })
  },

  onCloseDetail() {
    this.setData({ detailVisible: false })
  },

  noop() {},

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})

