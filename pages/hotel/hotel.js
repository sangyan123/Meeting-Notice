const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')
const { formatDateTime } = require('../../utils/date')

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    arranged: false,
    hotelName: '',
    address: '',
    distance: '',
    hotelRows: [],
    tips: []
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    this.fetchHotel()
  },

  fetchHotel() {
    this.setData({ loading: true })
    ensureCurrentMeeting()
      .then((meeting) =>
        request(API.appHotel, { data: { meetingId: meeting.id } })
      )
      .then((body) => {
        const d = body.data || {}
        const arranged = !!d.arranged
        const hotelRows = arranged
          ? [
              { label: '住宿酒店', value: d.hotelName || '—' },
              { label: '房间类型', value: d.roomType || '—' },
              { label: '房间号', value: d.roomNo || '—' },
              { label: '入住时间', value: d.checkinTime ? formatDateTime(d.checkinTime) : '—' },
              { label: '退房时间', value: d.checkoutTime ? formatDateTime(d.checkoutTime) : '—' },
              { label: '客服电话', value: d.phone || '—', phone: d.phone || '' }
            ]
          : []
        this.setData({
          loading: false,
          arranged,
          hotelName: d.hotelName || '',
          address: d.address || '',
          // 后端无距离字段，地图卡副标题用备注替代
          distance: d.remark || '位置信息以秘书处安排为准',
          hotelRows,
          tips: arranged ? [d.remind, d.remark].filter(Boolean) : []
        })
      })
      .catch((err) => {
        this.setData({ loading: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  onCallPhone(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone, fail: () => {} })
    }
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})



