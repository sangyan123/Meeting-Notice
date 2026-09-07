Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'apply',
    meetings: [
      '大会开幕式（全体会议）',
      '分组审议（政府工作报告）',
      '全体会议（计划、预算报告）',
      '分组审议（两高工作报告）',
      '大会新闻发布会',
      '大会全体会议（表决各项议案）',
      '大会闭幕式'
    ],
    meetingIndex: -1,
    meetingOpen: false,
    reason: '',
    reasonLength: 0,
    canSubmit: false,
    records: [
      {
        id: 1,
        title: '分组审议（政府工作报告）',
        status: 'approved',
        statusText: '已批准',
        date: '2024-03-06',
        reason: '家属突发疾病住院，需紧急处理。',
        approver: '组长 李建国'
      },
      {
        id: 2,
        title: '大会新闻发布会',
        status: 'pending',
        statusText: '待审批',
        date: '2024-03-08',
        reason: '参加本省教育系统紧急协调会。',
        approver: '—'
      }
    ]
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      activeTab: options.tab === 'records' ? 'records' : 'apply'
    })
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
    const meeting = this.data.meetings[this.data.meetingIndex]
    const records = [
      {
        id: Date.now(),
        title: meeting,
        status: 'pending',
        statusText: '待审批',
        date: '2024-03-05',
        reason: this.data.reason,
        approver: '—'
      },
      ...this.data.records
    ]
    this.setData({
      records,
      meetingIndex: -1,
      meetingOpen: false,
      reason: '',
      reasonLength: 0,
      canSubmit: false,
      activeTab: 'records'
    })
    wx.showToast({ title: '已提交', icon: 'success' })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
