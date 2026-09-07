const { filterAgendas } = require('../../utils/materials')

Page({
  data: {
    statusBarHeight: 20,
    meetingTitle: '',
    totalCount: 0,
    activeFilter: 'all',
    filters: [
      { id: 'all', name: '全部' },
      { id: 'main', name: '主要报告' },
      { id: 'work', name: '工作报告' },
      { id: 'draft', name: '决议草案' }
    ],
    agendas: [],
    // 记录各议程展开状态，切换分类时尽量保留
    expandMap: {}
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const app = getApp()
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      meetingTitle: app.globalData.meetingInfo.title
    })
    this.applyFilter('all')
  },

  applyFilter(category) {
    const { agendas, totalCount } = filterAgendas(category)
    const expandMap = this.data.expandMap
    const list = agendas.map((item) => ({
      ...item,
      expanded:
        expandMap[item.id] !== undefined ? expandMap[item.id] : item.expanded
    }))
    this.setData({
      activeFilter: category,
      agendas: list,
      totalCount
    })
  },

  onSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' })
  },

  onFilter(e) {
    this.applyFilter(e.currentTarget.dataset.id)
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id
    const expandMap = { ...this.data.expandMap }
    const agendas = this.data.agendas.map((item) => {
      if (item.id === id) {
        const expanded = !item.expanded
        expandMap[id] = expanded
        return { ...item, expanded }
      }
      return item
    })
    this.setData({ agendas, expandMap })
  },

  onPreview(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/preview/preview?id=${id}`
    })
  }
})
