const { openService } = require('../../utils/services')

Page({
  data: {
    statusBarHeight: 20,
    services: [
      { id: 'seat', label: '电子排座', img: '/assets/icons/grid-seat.png', bg: '#FBE9EB' },
      { id: 'hotel', label: '住宿安排', img: '/assets/icons/svc-hotel.png', bg: '#E6ECFC' },
      { id: 'meal', label: '用餐安排', img: '/assets/icons/svc-meal.png', bg: '#E2F6EC' },
      { id: 'bus', label: '班车安排', img: '/assets/icons/svc-bus.png', bg: '#FEEEDF' },
      { id: 'leave', label: '请假申请', img: '/assets/icons/svc-leave.png', bg: '#EFE7FC' },
      { id: 'info', label: '参会信息填报', img: '/assets/icons/svc-info.png', bg: '#DDF3F6' }
    ],
    contacts: [
      { label: '服务热线', value: '010-6309-XXXX' },
      { label: '会务服务台', value: '人民大会堂西侧' },
      { label: '紧急联系', value: '010-6309-XXXX' }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20
    })
  },

  onServiceTap(e) {
    openService(e.currentTarget.dataset.id)
  }
})
