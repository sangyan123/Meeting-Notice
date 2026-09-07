const { openService } = require('../../utils/services')

Page({
  data: {
    statusBarHeight: 20,
    services: [
      { id: 'seat', label: '座位导览', icon: '▦', color: '#C82439', bg: '#FDECED' },
      { id: 'hotel', label: '住宿安排', icon: '🏢', color: '#3A8FD6', bg: '#E8F3FC' },
      { id: 'meal', label: '用餐安排', icon: '🍴', color: '#3DAA6D', bg: '#E8F7EF' },
      { id: 'bus', label: '班车安排', icon: '🚌', color: '#E67E22', bg: '#FEF0E6' },
      { id: 'leave', label: '请假申请', icon: '📋', color: '#8E6BC9', bg: '#F3EDFA' },
      { id: 'info', label: '参会信息填报', icon: '✓', color: '#2AABB3', bg: '#E6F7F8' }
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
