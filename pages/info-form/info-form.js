const { request } = require('../../utils/request')
const API = require('../../utils/api')

// 交通方式选项（与设计稿一致）
const TRANSPORT_OPTIONS = [
  { label: '飞机', value: 'air' },
  { label: '高铁', value: 'rail' },
  { label: '自驾', value: 'self' },
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
    transportOptions: TRANSPORT_OPTIONS,
    form: {
      name: '',
      delegation: '',
      hotelNeed: 'no',
      transport: '',
      arriveDate: '',
      leaveDate: ''
    },
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
      'form.name': user.name || '',
      'form.delegation': user.delegation || user.deptName || user.company || '',
      userPhone: user.phone || ''
    })
    if (meetingId) {
      this.loadMyInfo(meetingId)
    }
    this.checkSubmit()
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
          patch['form.hotelNeed'] = data.hotelNeed === 1 ? 'yes' : 'no'
          patch['form.transport'] = data.transport || ''
          patch['form.arriveDate'] = data.arriveDate || ''
          patch['form.leaveDate'] = data.leaveDate || ''
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

  onHotelToggle(e) {
    this.setData({ 'form.hotelNeed': e.detail.value ? 'yes' : 'no' })
    this.checkSubmit()
  },

  onSelectTransport(e) {
    const value = e.currentTarget.dataset.value
    // 再次点击同一项取消选择
    const next = this.data.form.transport === value ? '' : value
    this.setData({ 'form.transport': next })
    this.checkSubmit()
  },

  onArrive(e) {
    this.setData({ 'form.arriveDate': e.detail.value })
    this.checkSubmit()
  },

  onLeaveDate(e) {
    this.setData({ 'form.leaveDate': e.detail.value })
    this.checkSubmit()
  },

  checkSubmit() {
    const { form } = this.data
    const datesOk = !(form.arriveDate && form.leaveDate && form.leaveDate < form.arriveDate)
    const canSubmit = !!(
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
        wx.showToast({ title: '请选择交通方式和抵离日期', icon: 'none' })
      }
      return
    }

    const { form, meetingId } = this.data
    this.setData({ submitting: true })
    request(API.appSubmitPersonInfo(meetingId), {
      method: 'POST',
      data: {
        // 手机号自动取登录用户资料；饮食需求默认"无特殊需求"
        phone: this.data.userPhone || '',
        hotelNeed: form.hotelNeed === 'yes' ? 1 : 0,
        dietType: 'none',
        transport: form.transport,
        arriveDate: form.arriveDate,
        leaveDate: form.leaveDate,
        remark: ''
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
