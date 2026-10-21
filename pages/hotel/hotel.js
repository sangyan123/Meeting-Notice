const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { formatDateTime } = require('../../utils/date')

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    /** 按会议分组：[{ meetingId, meetingName, hotelName, address, distance, hotelRows, tips }] */
    groups: []
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

  /** 聚合本人所有会议的住宿安排，按会议分组展示（未安排住宿的会议不显示；单会议拉取失败时跳过） */
  fetchHotel() {
    this.setData({ loading: true })
    request(API.appMyMeetingList)
      .then((body) => {
        const meetings = (body && body.data) || []
        if (!meetings.length) return []
        return Promise.all(
          meetings.map((m) =>
            request(API.appHotel, { data: { meetingId: m.id } })
              .then((res) => ({ meeting: m, data: res.data || {} }))
              .catch(() => null)
          )
        )
      })
      .then((results) => {
        const groups = []
        ;(results || []).forEach((item) => {
          if (!item) return
          const d = item.data
          if (!d.arranged) return
          groups.push({
            meetingId: item.meeting.id,
            meetingName: item.meeting.meetingName || '',
            hotelName: d.hotelName || '',
            address: d.address || '',
            // 后端无距离字段，地图卡副标题用备注替代
            distance: d.remark || '位置信息以秘书处安排为准',
            hotelRows: [
              { label: '住宿酒店', value: d.hotelName || '—' },
              { label: '房间类型', value: d.roomType || '—' },
              { label: '房间号', value: d.roomNo || '—' },
              { label: '入住时间', value: d.checkinTime ? formatDateTime(d.checkinTime) : '—' },
              { label: '退房时间', value: d.checkoutTime ? formatDateTime(d.checkoutTime) : '—' },
              { label: '客服电话', value: d.phone || '—', phone: d.phone || '' }
            ],
            tips: [d.remind, d.remark].filter(Boolean)
          })
        })
        this.setData({ loading: false, groups })
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



