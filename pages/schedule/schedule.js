Page({
  data: {
    statusBarHeight: 20,
    activeDate: '0305',
    dates: [
      { id: '0304', md: '3月4', week: '周一', full: '2024年03月04日' },
      { id: '0305', md: '3月5', week: '周二', full: '2024年03月05日' },
      { id: '0306', md: '3月6', week: '周三', full: '2024年03月06日' },
      { id: '0307', md: '3月7', week: '周四', full: '2024年03月07日' },
      { id: '0308', md: '3月8', week: '周五', full: '2024年03月08日' },
      { id: '0311', md: '3月11', week: '周一', full: '2024年03月11日' }
    ],
    scheduleMap: {
      '0305': [
        {
          id: 1,
          title: '大会开幕式 (全体会议)',
          tag: '全体会议',
          tagType: 'plenary',
          time: '09:00—12:00',
          place: '人民大会堂 大礼堂',
          type: '全体会议',
          expanded: true
        },
        {
          id: 2,
          title: '各代表团全体会议 (听取报告)',
          tag: '代表团会议',
          tagType: 'delegation',
          time: '15:00—18:00',
          place: '各代表团驻地',
          type: '代表团会议',
          expanded: false
        }
      ],
      '0304': [
        {
          id: 3,
          title: '代表报到及报到手续办理',
          tag: '会务安排',
          tagType: 'delegation',
          time: '09:00—17:00',
          place: '代表驻地',
          type: '会务安排',
          expanded: false
        }
      ],
      '0306': [
        {
          id: 4,
          title: '代表团分组审议',
          tag: '代表团会议',
          tagType: 'delegation',
          time: '09:00—12:00',
          place: '各代表团驻地',
          type: '代表团会议',
          expanded: false
        }
      ]
    },
    currentMeetings: [],
    currentSummary: ''
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
    this.refreshList(this.data.activeDate)
  },

  refreshList(dateId) {
    const date = this.data.dates.find((d) => d.id === dateId)
    const list = (this.data.scheduleMap[dateId] || []).map((item) => ({ ...item }))
    this.setData({
      activeDate: dateId,
      currentMeetings: list,
      currentSummary: `${date.full} 共 ${list.length} 场会议`
    })
  },

  onSelectDate(e) {
    this.refreshList(e.currentTarget.dataset.id)
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id
    const currentMeetings = this.data.currentMeetings.map((item) => {
      if (item.id === id) {
        return { ...item, expanded: !item.expanded }
      }
      return item
    })
    this.setData({ currentMeetings })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
