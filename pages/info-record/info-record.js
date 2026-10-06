const { request } = require('../../utils/request')
const API = require('../../utils/api')

const DIET_LABELS = {
  none: '无特殊需求',
  veg: '素食',
  halal: '清真',
  other: '其他'
}
const TRANSPORT_LABELS = {
  self: '自驾',
  bus: '大巴班车',
  rail: '高铁',
  air: '飞机',
  other: '其他'
}

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    submitTime: '',
    rows: []
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const meetingId = getApp().globalData.meetingId || null
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
    if (!meetingId) {
      this.setData({ loading: false })
      return
    }
    request(API.appMyInfo(meetingId))
      .then((body) => {
        this.setData({ loading: false, ...this.buildRecord((body && body.data) || {}) })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '加载填报记录失败', icon: 'none' })
      })
  },

  /** 将后端填报数据映射为回执明细行 */
  buildRecord(data) {
    if (!data || !data.submitted) {
      return { submitTime: '', rows: [] }
    }
    const user = getApp().globalData.userInfo || {}
    const rows = [
      { label: '姓名', value: user.name || '—' },
      { label: '手机号码', value: data.phone },
      { label: '住宿需求', value: data.hotelNeed === 1 ? '需要住宿' : data.hotelNeed === 0 ? '不需要住宿' : '' },
      { label: '用餐特殊需求', value: DIET_LABELS[data.dietType] || data.dietType || '' },
      { label: '交通方式', value: TRANSPORT_LABELS[data.transport] || data.transport || '' },
      { label: '抵达日期', value: data.arriveDate || '' },
      { label: '离开日期', value: data.leaveDate || '' }
    ]
    if (data.remark) {
      rows.push({ label: '备注', value: data.remark })
    }
    return { submitTime: data.submitTime || '', rows }
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  },

  onGoFill() {
    wx.navigateTo({ url: '/pages/info-form/info-form' })
  }
})
