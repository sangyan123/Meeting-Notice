const STORAGE_KEY = 'profileMessageSettingsV2'

const DEFAULT_SETTINGS = {
  meetingReminder: true,
  noticePush: true,
  leaveResult: true,
  receiptReminder: false,
  sound: true
}

Page({
  data: {
    statusBarHeight: 20,
    settings: { ...DEFAULT_SETTINGS },
    options: [
      {
        id: 'meetingReminder',
        name: '会议开始提醒',
        desc: '会议开始前30分钟通知'
      },
      {
        id: 'noticePush',
        name: '通知消息推送',
        desc: '接收新通知时推送提醒'
      },
      {
        id: 'leaveResult',
        name: '请假审批结果',
        desc: '审批通过或拒绝时通知'
      },
      {
        id: 'receiptReminder',
        name: '回执填写提醒',
        desc: '会议前提醒填写回执'
      },
      {
        id: 'sound',
        name: '消息提示音',
        desc: '收到消息时播放提示音'
      }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    let saved = {}
    try {
      saved = wx.getStorageSync(STORAGE_KEY) || {}
    } catch (err) {
      saved = {}
    }
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      settings: { ...DEFAULT_SETTINGS, ...saved }
    })
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    const settings = {
      ...this.data.settings,
      [id]: e.detail.value
    }
    this.setData({ settings })
    try {
      wx.setStorageSync(STORAGE_KEY, settings)
    } catch (err) {}
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
