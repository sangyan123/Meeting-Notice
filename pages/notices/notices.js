const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { mapNoticeRow } = require('../../utils/notices')

const PAGE_SIZE = 10

Page({
  data: {
    statusBarHeight: 20,
    activeFilter: 'all',
    filters: [
      { id: 'all', name: '全部' },
      { id: 'pre', name: '会前通知' },
      { id: 'mid', name: '会中通知' },
      { id: 'post', name: '会后公告' }
    ],
    filteredList: [],
    unreadCount: 0,
    loading: true,
    loadingMore: false,
    finished: false
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    // meetingId 可选：不传则展示本人全部会议的通知（与首页角标同口径）
    this.meetingId = options.meetingId ? Number(options.meetingId) : null
    this.pageNum = 1
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    // 从详情页返回后已读/回执状态可能变化，每次显示都刷新
    this.reload()
  },

  /** 当前筛选对应的查询参数（wx.request GET 会把 data 拼成 query，空值不传） */
  buildQuery(extra) {
    const query = {}
    if (this.meetingId) {
      query.meetingId = this.meetingId
    }
    if (this.data.activeFilter !== 'all') {
      query.category = this.data.activeFilter
    }
    return Object.assign(query, extra)
  },

  reload() {
    this.pageNum = 1
    this.setData({ loading: true, finished: false })
    return request(
      API.appNoticeList,
      { data: this.buildQuery({ pageNum: 1, pageSize: PAGE_SIZE }) }
    )
      .then((body) => {
        const data = body.data || {}
        const rows = Array.isArray(data.rows) ? data.rows : []
        this.setData({
          loading: false,
          filteredList: rows.map(mapNoticeRow).filter(Boolean),
          unreadCount: data.unreadCount || 0,
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
    request(
      API.appNoticeList,
      { data: this.buildQuery({ pageNum: nextPage, pageSize: PAGE_SIZE }) }
    )
      .then((body) => {
        const data = body.data || {}
        const rows = Array.isArray(data.rows) ? data.rows : []
        this.pageNum = nextPage
        this.setData({
          loadingMore: false,
          filteredList: this.data.filteredList.concat(rows.map(mapNoticeRow).filter(Boolean)),
          finished: rows.length < PAGE_SIZE
        })
      })
      .catch((err) => {
        this.setData({ loadingMore: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  onReachBottom() {
    this.loadMore()
  },

  onFilter(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeFilter) {
      return
    }
    this.setData({ activeFilter: id }, () => this.reload())
  },

  /** 详情页打开即自动标记已读，返回时由 onShow 刷新列表与未读数 */
  onNoticeTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
