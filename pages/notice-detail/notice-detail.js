const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { categoryTag, isRichText } = require('../../utils/notices')
const { formatDateTime, formatDateCn } = require('../../utils/date')

Page({
  data: {
    statusBarHeight: 20,
    safeBottom: 0,
    scrollHeight: 500,
    loading: true,
    notice: null,
    replyStatus: '',
    myReceipt: null,
    reason: '',
    reasonOpen: false,
    submitting: false
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    const statusBarHeight = sys.statusBarHeight || 20
    const navBar = 44
    const safeBottom = sys.safeAreaInsets ? sys.safeAreaInsets.bottom : 0
    // 基准滚动高度：窗口高度 - 导航 - 预留回执栏；回执区展开时由 layoutFooter 再扣减
    this.baseScrollHeight = Math.max(
      sys.windowHeight - statusBarHeight - navBar - 120 - safeBottom,
      300
    )
    this.noticeId = Number(options.id)
    this.setData({
      statusBarHeight,
      safeBottom,
      scrollHeight: this.baseScrollHeight
    })
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    if (!this.data.notice) {
      this.fetchDetail()
    }
  },

  fetchDetail() {
    this.setData({ loading: true })
    request(API.appNoticeDetail(this.noticeId))
      .then((body) => {
        const d = body.data || {}
        const content = d.content || ''
        const myReceipt = d.myReceipt || null
        const tagType = d.category || ''
        this.setData({
          loading: false,
          notice: {
            tagType,
            tag: categoryTag(tagType),
            datetime: formatDateTime(d.publishTime),
            title: d.title || '',
            issuer: d.publisher || '',
            signDate: formatDateCn(d.publishTime),
            content,
            isHtml: isRichText(content),
            requireReceipt: d.requireReceipt === 1,
            meetingName: d.meetingName || ''
          },
          replyStatus: (myReceipt && myReceipt.receiptType) || '',
          myReceipt,
          reason:
            myReceipt && myReceipt.receiptType === 'leave' ? myReceipt.reason || '' : ''
        })
        this.layoutFooter()
      })
      .catch((err) => {
        this.setData({ loading: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  /** 回执栏展开收起会改变高度，同步调整正文滚动区，避免底部内容被遮住；
   *  baseScrollHeight 已预留收起态回执栏高度，无回执栏时回收、原因框展开时再加增量 */
  layoutFooter() {
    const showFooter = !!(this.data.notice && this.data.notice.requireReceipt)
    const extra = showFooter ? (this.data.reasonOpen ? 160 : 0) : -120
    this.setData({ scrollHeight: Math.max(this.baseScrollHeight - extra, 300) })
  },

  submitReceipt(payload, done) {
    if (this.data.submitting) {
      return
    }
    this.setData({ submitting: true })
    request(API.appNoticeReceipt(this.noticeId), { method: 'POST', data: payload })
      .then((body) => {
        const receipt = body.data || null
        this.setData({
          submitting: false,
          myReceipt: receipt,
          replyStatus: payload.receiptType
        })
        done(receipt)
      })
      .catch((err) => {
        this.setData({ submitting: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '提交失败', icon: 'none' })
        }
      })
  },

  onAttend() {
    if (this.data.replyStatus === 'attend') {
      return
    }
    this.submitReceipt({ receiptType: 'attend' }, () => {
      this.setData({ reasonOpen: false, reason: '' })
      this.layoutFooter()
      wx.showToast({ title: '已确认出席', icon: 'success' })
    })
  },

  onLeave() {
    if (this.data.replyStatus === 'leave') {
      return
    }
    this.setData({ reasonOpen: true })
    this.layoutFooter()
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value })
  },

  onCancelLeave() {
    this.setData({ reasonOpen: false, reason: '' })
    this.layoutFooter()
  },

  onConfirmLeave() {
    const reason = this.data.reason.trim()
    if (!reason) {
      wx.showToast({ title: '请填写请假原因', icon: 'none' })
      return
    }
    this.submitReceipt({ receiptType: 'leave', reason }, () => {
      this.setData({ reasonOpen: false })
      this.layoutFooter()
      wx.showToast({ title: '已提交请假回执', icon: 'success' })
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
