const { getPreview } = require('../../utils/materials')

Page({
  data: {
    statusBarHeight: 20,
    viewerHeight: 500,
    fileId: 'f1',
    doc: {},
    currentPage: 1,
    totalPages: 1,
    pageContent: '',
    pageTexts: []
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    const statusBarHeight = sys.statusBarHeight || 20
    const navBar = 44
    const infoBar = 64
    const viewerHeight = sys.windowHeight - statusBarHeight - navBar - infoBar

    const fileId = options.id || 'f1'
    const doc = getPreview(fileId)
    const pageTexts = doc.pageTexts || ['暂无内容']
    // 用真实页数展示翻页，内容不足时循环复用已有页文案
    const totalPages = doc.pages || pageTexts.length

    this.setData({
      statusBarHeight,
      viewerHeight: Math.max(viewerHeight, 300),
      fileId,
      doc: {
        title: doc.title,
        type: doc.type,
        pages: doc.pages,
        size: doc.size
      },
      pageTexts,
      totalPages,
      currentPage: 1,
      pageContent: pageTexts[0]
    })
  },

  updatePage(page) {
    const { totalPages, pageTexts } = this.data
    if (page < 1 || page > totalPages) return
    const content = pageTexts[(page - 1) % pageTexts.length]
    this.setData({
      currentPage: page,
      pageContent: content
    })
  },

  onPrev() {
    this.updatePage(this.data.currentPage - 1)
  },

  onNext() {
    this.updatePage(this.data.currentPage + 1)
  },

  onDownload() {
    const { doc } = this.data
    wx.showLoading({ title: '准备下载…' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '下载材料',
        content: `「${doc.title}」(${doc.type} · ${doc.size})\n演示环境已模拟下载完成。`,
        showCancel: false,
        confirmText: '知道了'
      })
    }, 600)
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
