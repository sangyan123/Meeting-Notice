/** 会务服务子页路由 */
const SERVICE_ROUTES = {
  seat: '/pages/seat/seat',
  hotel: '/pages/hotel/hotel',
  meal: '/pages/meal/meal',
  bus: '/pages/bus/bus',
  leave: '/pages/leave/leave',
  info: '/pages/info-form/info-form'
}

function openService(id) {
  const url = SERVICE_ROUTES[id]
  if (!url) {
    wx.showToast({ title: '功能开发中', icon: 'none' })
    return
  }
  wx.navigateTo({ url })
}

module.exports = {
  SERVICE_ROUTES,
  openService
}
