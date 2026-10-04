// 后端暂无通知设置接口，设置暂存本机，后续接入后改为云端同步
const STORAGE_KEY = 'messageSettings'

const DEFAULT_SETTINGS = {
  master: true,
  pre: true,
  mid: true,
  post: true
}

Page({
  data: {
    statusBarHeight: 20,
    settings: { ...DEFAULT_SETTINGS },
    categories: [
      { id: 'pre', name: '会前通知', desc: '会议日程、报到安排等会前信息' },
      { id: 'mid', name: '会中通知', desc: '日程调整、临时安排等会中信息' },
      { id: 'post', name: '会后公告', desc: '会议纪要、闭幕安排等会后信息' }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const saved = wx.getStorageSync(STORAGE_KEY) || {}
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      settings: { ...DEFAULT_SETTINGS, ...saved }
    })
  },

  onMasterChange(e) {
    this.updateSettings({ master: e.detail.value })
  },

  onCategoryChange(e) {
    const id = e.currentTarget.dataset.id
    this.updateSettings({ [id]: e.detail.value })
  },

  updateSettings(patch) {
    const settings = { ...this.data.settings, ...patch }
    this.setData({ settings })
    wx.setStorageSync(STORAGE_KEY, settings)
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
