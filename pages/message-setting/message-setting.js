const { request, getToken } = require('../../utils/request')
const API = require('../../utils/api')

/** 页面开关 → 服务端偏好字段（t_meeting_message_pref） */
const PREF_FIELDS = {
  master: 'masterEnabled',
  pre: 'preEnabled',
  mid: 'midEnabled',
  post: 'postEnabled'
}

const DEFAULT_SETTINGS = {
  master: true,
  pre: true,
  mid: true,
  post: true
}

// 本机缓存仅作为打开页面时的展示兜底，设置以服务端为准
const STORAGE_KEY = 'messageSettings'

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
    this.fetchPref()
  },

  /** 服务端偏好覆盖本机缓存（后端无记录时返回默认全开） */
  fetchPref() {
    if (!getToken()) {
      return
    }
    request(API.appMessagePref, { silent: true })
      .then((body) => {
        const d = body.data || {}
        const settings = {}
        Object.keys(PREF_FIELDS).forEach((key) => {
          settings[key] = d[PREF_FIELDS[key]] !== 0
        })
        this.setData({ settings })
        wx.setStorageSync(STORAGE_KEY, settings)
      })
      .catch(() => {})
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
    this.savePref(settings)
  },

  /** 保存到服务端（稍作防抖，连续切换只发一次） */
  savePref(settings) {
    if (!getToken()) {
      return
    }
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null
      this.postPref(settings)
    }, 300)
  },

  postPref(settings) {
    const body = {}
    Object.keys(PREF_FIELDS).forEach((key) => {
      body[PREF_FIELDS[key]] = settings[key] ? 1 : 0
    })
    request(API.appMessagePref, { method: 'POST', data: body, silent: true })
      .then(() => {
        wx.showToast({ title: '已保存', icon: 'none', duration: 800 })
      })
      .catch(() => {
        wx.showToast({ title: '保存失败，请稍后重试', icon: 'none' })
      })
  },

  /** 防抖等待期内退出页面时补发保存，避免最后一次修改丢失 */
  onUnload() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
      this.postPref(this.data.settings)
    }
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
