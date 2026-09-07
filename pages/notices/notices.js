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
    list: [
      {
        id: 1,
        title: '关于大会开幕式有关事项的通知',
        tag: '会前通知',
        tagType: 'pre',
        datetime: '2024-03-03 16:00',
        unread: true
      },
      {
        id: 2,
        title: '关于分组审议政府工作报告的通知',
        tag: '会中通知',
        tagType: 'mid',
        datetime: '2024-03-05 12:00',
        unread: true
      },
      {
        id: 3,
        title: '3月7日全体会议时间调整通知',
        tag: '会中通知',
        tagType: 'mid',
        datetime: '2024-03-06 09:00',
        unread: false
      },
      {
        id: 4,
        title: '关于大会闭幕安排的通知',
        tag: '会后公告',
        tagType: 'post',
        datetime: '2024-03-11 08:00',
        unread: false
      }
    ],
    filteredList: []
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      filteredList: this.data.list
    })
  },

  onFilter(e) {
    const id = e.currentTarget.dataset.id
    const filteredList =
      id === 'all'
        ? this.data.list
        : this.data.list.filter((item) => item.tagType === id)
    this.setData({ activeFilter: id, filteredList })
  },

  onNoticeTap(e) {
    const { id } = e.currentTarget.dataset
    // 标记已读
    const list = this.data.list.map((item) =>
      item.id === id ? { ...item, unread: false } : item
    )
    const filteredList =
      this.data.activeFilter === 'all'
        ? list
        : list.filter((item) => item.tagType === this.data.activeFilter)
    this.setData({ list, filteredList })

    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
