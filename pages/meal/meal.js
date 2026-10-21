const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')

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
    /** 按会议分组：[{ meetingId, meetingName, dietReminder, meals: [] }] */
    groups: [],
    totalMeals: 0
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

  /** 聚合本人所有会议的用餐安排，按会议分组展示（单个会议拉取失败时跳过该会议） */
  fetchMeals() {
    this.setData({ loading: true })
    request(API.appMyMeetingList)
      .then((body) => {
        const meetings = (body && body.data) || []
        if (!meetings.length) return []
        return Promise.all(
          meetings.map((m) =>
            request(API.appMealList, { data: { meetingId: m.id } })
              .then((res) => ({ meeting: m, data: res.data || {} }))
              .catch(() => null)
          )
        )
      })
      .then((results) => {
        const groups = []
        let totalMeals = 0
        ;(results || []).forEach((item) => {
          if (!item) return
          const { meeting, data } = item
          const meals = (Array.isArray(data.rows) ? data.rows : []).map((row) => ({
            id: row.id,
            name: MEAL_TYPE_NAMES[row.mealType] || row.mealType || '餐次',
            time: [row.mealDate, [row.startTime, row.endTime].filter(Boolean).join('—')]
              .filter(Boolean)
              .join(' '),
            place: row.location || '—',
            note: row.description || ''
          }))
          // 没有用餐安排的会议不显示分组（饮食提醒随组展示，无餐卡时一并跳过）
          if (!meals.length) return
          totalMeals += meals.length
          groups.push({
            meetingId: meeting.id,
            meetingName: meeting.meetingName || '',
            dietReminder: data.dietReminder || '',
            meals
          })
        })
        this.setData({ loading: false, groups, totalMeals })
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
