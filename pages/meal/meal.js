const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')

/** 餐次类型 → 展示文案（与 t_meeting_meal_arrangement.meal_type 取值对应） */
const MEAL_TYPE_NAMES = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐'
}

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    meals: [],
    dietReminder: ''
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
    this.fetchMeals()
  },

  fetchMeals() {
    this.setData({ loading: true })
    ensureCurrentMeeting()
      .then((meeting) =>
        request(API.appMealList, { data: { meetingId: meeting.id } })
      )
      .then((body) => {
        const d = body.data || {}
        const rows = Array.isArray(d.rows) ? d.rows : []
        const meals = rows.map((row) => ({
          id: row.id,
          name: MEAL_TYPE_NAMES[row.mealType] || row.mealType || '餐次',
          time: [row.mealDate, [row.startTime, row.endTime].filter(Boolean).join('—')]
            .filter(Boolean)
            .join(' '),
          place: row.location || '—',
          note: row.description || ''
        }))
        this.setData({
          loading: false,
          meals,
          dietReminder: d.dietReminder || ''
        })
      })
      .catch((err) => {
        this.setData({ loading: false })
        if (err.message !== 'unauthorized') {
          wx.showToast({ title: err.message || '加载失败', icon: 'none' })
        }
      })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
