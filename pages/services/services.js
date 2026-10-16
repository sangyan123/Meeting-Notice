const { request, getToken } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')
const { openService } = require('../../utils/services')

/** 服务入口 → 会务配置开关字段（后端未提供开关的入口不受控制，恒展示） */
const SWITCH_OF = {
  hotel: 'hotelEnabled',
  meal: 'mealEnabled',
  bus: 'busEnabled',
  leave: 'leaveEnabled'
}

const DEFAULT_SERVICES = [
  { id: 'info', label: '参会信息填报', img: '/assets/icons/svc-info-blue.png', bg: '#DFF5F0' },
  { id: 'guide', label: '会议指南', img: '/assets/icons/svc-guide-blue.png', bg: '#E6F0FF' },
  { id: 'leave', label: '请假申请', img: '/assets/icons/svc-leave.png', bg: '#F0E9FF' },
  { id: 'meal', label: '用餐安排', img: '/assets/icons/svc-meal.png', bg: '#E7F8EF' },
  { id: 'hotel', label: '住宿安排', img: '/assets/icons/svc-hotel.png', bg: '#E8F0FF' },
  { id: 'bus', label: '班车安排', img: '/assets/icons/svc-bus.png', bg: '#FFF0E2' }
]

Page({
  data: {
    statusBarHeight: 20,
    services: DEFAULT_SERVICES,
    contacts: [
      { label: '服务热线', value: '—' },
      { label: '会务服务台', value: '—' },
      { label: '紧急联系', value: '—' }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20
    })
  },

  onShow() {
    if (!getToken()) {
      return
    }
    this.fetchConfig()
  },

  fetchConfig() {
    ensureCurrentMeeting()
      .then((meeting) =>
        request(API.appServiceConfig, {
          data: { meetingId: meeting.id },
          silent: true
        })
      )
      .then((body) => {
        const d = body.data || {}
        const enabled = (key) => d[key] !== 0
        this.setData({
          services: DEFAULT_SERVICES.filter(
            (s) => !SWITCH_OF[s.id] || enabled(SWITCH_OF[s.id])
          ),
          contacts: this.buildContacts(d, enabled('serviceCallEnabled'))
        })
      })
      .catch(() => {
        // 配置拉取失败保留占位联系人，不打断页面使用
      })
  },

  /** 会务配置 → 联系方式行；serviceCallEnabled=0 时不展示电话类联系方式 */
  buildContacts(d, callEnabled) {
    const rows = []
    if (callEnabled) {
      rows.push({ label: '服务热线', value: d.servicePhone || '—', phone: d.servicePhone || '' })
    }
    rows.push({ label: '会务服务台', value: d.serviceDeskLocation || '—' })
    if (callEnabled) {
      rows.push({ label: '紧急联系', value: d.emergencyPhone || '—', phone: d.emergencyPhone || '' })
    }
    return rows
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  },

  onContactTap(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone, fail: () => {} })
    }
  },

  onServiceTap(e) {
    openService(e.currentTarget.dataset.id)
  }
})
