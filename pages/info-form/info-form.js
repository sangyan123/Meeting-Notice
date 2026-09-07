Page({
  data: {
    statusBarHeight: 20,
    hotelOptions: [
      { label: '需要住宿', value: 'yes' },
      { label: '不需要住宿', value: 'no' }
    ],
    dietOptions: [
      { label: '无特殊需求', value: 'none' },
      { label: '素食', value: 'veg' },
      { label: '清真', value: 'halal' },
      { label: '其他', value: 'other' }
    ],
    transportOptions: ['请选择交通方式', '自驾', '大巴班车', '高铁', '飞机', '其他'],
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
    canSubmit: false
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const user = getApp().globalData.userInfo
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20,
      'form.name': user.name
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
    this.setData({
      'form.transport': value === '请选择交通方式' ? '' : value,
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
    const canSubmit = !!(
      form.phone &&
      form.phone.length >= 11 &&
      form.hotelNeed &&
      form.diet &&
      form.transport &&
      form.arriveDate &&
      form.leaveDate
    )
    this.setData({ canSubmit })
  },

  formatNow() {
    const d = new Date()
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`)
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  },

  onSubmit() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请完善必填项', icon: 'none' })
      return
    }

    const { form, hotelOptions, dietOptions } = this.data
    const hotelLabel = (hotelOptions.find((i) => i.value === form.hotelNeed) || {})
      .label
    const dietLabel = (dietOptions.find((i) => i.value === form.diet) || {}).label

    const record = {
      submitTime: this.formatNow(),
      rows: [
        { label: '姓名', value: form.name },
        { label: '手机号码', value: form.phone },
        { label: '住宿需求', value: hotelLabel || '' },
        { label: '用餐特殊需求', value: dietLabel || '' },
        { label: '交通方式', value: form.transport },
        { label: '抵达日期', value: form.arriveDate },
        { label: '离开日期', value: form.leaveDate }
      ]
    }

    getApp().globalData.infoRecord = record
    wx.redirectTo({
      url: '/pages/info-record/info-record'
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
