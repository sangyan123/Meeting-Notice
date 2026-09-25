const { openService } = require('../../utils/services')

Page({
  data: {
    statusBarHeight: 20,
    services: [
      { id: 'seat', label: '座位导览', img: '/assets/icons/grid-seat.png', bg: '#FDECED' },
      { id: 'hotel', label: '住宿安排', img: '/assets/icons/svc-hotel.png', bg: '#E8F3FC' },
      { id: 'meal', label: '用餐安排', img: '/assets/icons/svc-meal.png', bg: '#E8F7EF' },
      { id: 'bus', label: '班车安排', img: '/assets/icons/svc-bus.png', bg: '#FEF0E6' },
      { id: 'leave', label: '请假申请', img: '/assets/icons/svc-leave.png', bg: '#F3EDFA' },
      { id: 'info', label: '参会信息填报', img: '/assets/icons/svc-info.png', bg: '#E6F7F8' }
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
