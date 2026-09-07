Page({
  data: {
    statusBarHeight: 20,
    meetingInfo: {},
    unreadCount: 2,
    quickNav: [
      { id: 'schedule', icon: '📅', label: '大会日程' },
      { id: 'guide', icon: '❗', label: '会议指南' },
      { id: 'refs', icon: '📄', label: '参阅材料' }
    ],
    todayMeetings: [
      {
        id: 1,
        noticeId: 1,
        title: '大会开幕式 (全体会议)',
        time: '09:00—12:00',
        place: '大礼堂'
      },
      {
        id: 2,
        noticeId: 2,
        title: '代表团全体会议',
        time: '14:30—17:00',
        place: '代表团会议室'
      }
    ],
    notices: [
      {
        id: 1,
        title: '关于大会开幕式有关事项的通知',
        tag: '会前通知',
        tagType: 'pre',
        time: '16:00'
      },
      {
        id: 2,
        title: '关于分组审议政府工作报告的通知',
        tag: '会中通知',
        tagType: 'mid',
        time: '12:00'
      }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const app = getApp()
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      meetingInfo: app.globalData.meetingInfo
    })
  },

  onBellTap() {
    wx.navigateTo({ url: '/pages/notices/notices' })
  },

  onQuickNav(e) {
    const { id } = e.currentTarget.dataset
    if (id === 'schedule') {
      wx.navigateTo({ url: '/pages/schedule/schedule' })
      return
    }
    if (id === 'guide') {
      wx.navigateTo({ url: '/pages/guide/guide' })
      return
    }
    if (id === 'refs') {
      wx.navigateTo({ url: '/pages/refs/refs' })
    }
  },

  onAllSchedule() {
    wx.navigateTo({ url: '/pages/schedule/schedule' })
  },

  onMeetingDetail(e) {
    const id = Number(e.currentTarget.dataset.id)
    const meeting = this.data.todayMeetings.find((item) => item.id === id)
    const noticeId = (meeting && meeting.noticeId) || id
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${noticeId}`
    })
  },

  onAllNotices() {
    wx.navigateTo({ url: '/pages/notices/notices' })
  },

  onNoticeTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/notice-detail/notice-detail?id=${id}`
    })
  }
})
