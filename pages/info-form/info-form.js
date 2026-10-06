const { request } = require('../../utils/request')
const API = require('../../utils/api')

const HOTEL_OPTIONS = [
  { label: '需要住宿', value: 'yes' },
  { label: '不需要住宿', value: 'no' }
]
const DIET_OPTIONS = [
  { label: '无特殊需求', value: 'none' },
  { label: '素食', value: 'veg' },
  { label: '清真', value: 'halal' },
  { label: '其他', value: 'other' }
]
const TRANSPORT_OPTIONS = [
  { label: '自驾', value: 'self' },
  { label: '大巴班车', value: 'bus' },
  { label: '高铁', value: 'rail' },
  { label: '飞机', value: 'air' },
  { label: '其他', value: 'other' }
]

Page({
  data: {
    statusBarHeight: 20,
    meetingId: null,
    hasMeeting: false,
    banner: '',
    loading: false,
    submitting: false,
    submitted: false,
    hotelOptions: HOTEL_OPTIONS,
    dietOptions: DIET_OPTIONS,
    transportOptions: TRANSPORT_OPTIONS,
    transportOpen: false,
    form: {
      name: '',
      phone: '',
      hotelNeed: '',
      diet: '',
      transport: '',
      arriveDate: '',
      leaveDate: '',
      remark: ''
    },
    transportLabel: '',
    canSubmit: false
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const app = getApp()
    const user = app.globalData.userInfo || {}
    const meetingId = app.globalData.meetingId || null
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      meetingId,
      hasMeeting: !!meetingId,
      banner: meetingId ? '' : '当前没有进行中的会议，暂无法填报',
      'form.name': user.name,
      'form.phone': user.phone || ''
    })
    if (meetingId) {
      this.loadMyInfo(meetingId)
    }
  },

  /** 回显本人已提交的填报内容（再次进入即查看/修改） */
  loadMyInfo(meetingId) {
    this.setData({ loading: true })
    request(API.appMyInfo(meetingId))
      .then((body) => {
        const data = (body && body.data) || {}
        const patch = { loading: false }
        if (data.submitted) {
          patch.submitted = true
          patch['form.phone'] = data.phone || this.data.form.phone
          patch['form.hotelNeed'] = data.hotelNeed === 1 ? 'yes' : data.hotelNeed === 0 ? 'no' : ''
          patch['form.diet'] = data.dietType || ''
          patch['form.transport'] = data.transport || ''
          patch['form.arriveDate'] = data.arriveDate || ''
          patch['form.leaveDate'] = data.leaveDate || ''
          patch['form.remark'] = data.remark || ''
          const hit = TRANSPORT_OPTIONS.find((i) => i.value === data.transport)
          patch.transportLabel = hit ? hit.label : ''
        }
        this.setData(patch)
        this.checkSubmit()
      })
      .catch((err) => {
        this.setData({
          loading: false,
          banner: err.message || '加载填报信息失败'
        })
      })
  },

  onPhone(e) {
    this.setData({ 'form.phone': e.detail.value })
    this.checkSubmit()
  },

  onHotelNeed(e) {
    this.setData({ 'form.hotelNeed': e.detail.value })
    this.checkSubmit()
  },

  onDiet(e) {
    this.setData({
      'form.diet': e.detail.value,
      transportOpen: false
    })
    this.checkSubmit()
  },

  onToggleTransport() {
    this.setData({ transportOpen: !this.data.transportOpen })
  },

  onSelectTransport(e) {
    const value = e.currentTarget.dataset.value
    const hit = TRANSPORT_OPTIONS.find((i) => i.value === value)
    this.setData({
      'form.transport': value,
      transportLabel: hit ? hit.label : '',
      transportOpen: false
    })
    this.checkSubmit()
  },

  onArrive(e) {
    this.setData({
      'form.arriveDate': e.detail.value,
      transportOpen: false
    })
    this.checkSubmit()
  },

  onLeaveDate(e) {
    this.setData({
      'form.leaveDate': e.detail.value,
      transportOpen: false
    })
    this.checkSubmit()
  },

  onRemark(e) {
    this.setData({
      'form.remark': e.detail.value,
      transportOpen: false
    })
  },

  checkSubmit() {
    const { form } = this.data
    const datesOk = !(form.arriveDate && form.leaveDate && form.leaveDate < form.arriveDate)
    const canSubmit = !!(
      form.phone &&
      form.phone.length >= 11 &&
      form.hotelNeed &&
      form.diet &&
      form.transport &&
      form.arriveDate &&
      form.leaveDate &&
      datesOk
    )
    this.setData({ canSubmit })
  },

  onSubmit() {
    if (this.data.submitting) return
    if (!this.data.hasMeeting) {
      wx.showToast({ title: '当前没有进行中的会议', icon: 'none' })
      return
    }
    if (!this.data.canSubmit) {
      const { form } = this.data
      if (form.arriveDate && form.leaveDate && form.leaveDate < form.arriveDate) {
        wx.showToast({ title: '离开日期不能早于抵达日期', icon: 'none' })
      } else {
        wx.showToast({ title: '请完善必填项', icon: 'none' })
      }
      return
    }

    const { form, meetingId } = this.data
    this.setData({ submitting: true })
    request(API.appSubmitPersonInfo(meetingId), {
      method: 'POST',
      data: {
        phone: form.phone,
        hotelNeed: form.hotelNeed === 'yes' ? 1 : 0,
        dietType: form.diet,
        transport: form.transport,
        arriveDate: form.arriveDate,
        leaveDate: form.leaveDate,
        remark: form.remark
      }
    })
      .then(() => {
        wx.redirectTo({ url: '/pages/info-record/info-record' })
      })
      .catch((err) => {
        this.setData({ submitting: false })
        wx.showToast({ title: err.message || '提交失败，请稍后重试', icon: 'none' })
      })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
