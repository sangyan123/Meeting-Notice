const { request, getToken, goLogin } = require('../../utils/request')
const API = require('../../utils/api')
const { formatMeetingRange } = require('../../utils/date')

Page({
  data: {
    statusBarHeight: 20,
    loading: true,
    meeting: null,
    stats: [],
    tabs: [],
    persons: []
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
    this.meetingId = Number(options.id)
  },

  onShow() {
    if (!getToken()) {
      goLogin()
      return
    }
    this.loadDetail()
  },

  loadDetail() {
    if (!this.meetingId) {
      wx.showToast({ title: '缺少会议参数', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    request(API.meetingInfo(this.meetingId))
      .then((res) => {
        this.applyData(res.data || {})
        this.setData({ loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '加载会议详情失败', icon: 'none' })
      })
  },

  applyData(data) {
    const m = data.meeting || {}
    const persons = (data.persons || [])
      .map((p, i) => {
        const mp = p.meetingPerson || {}
        const u = p.userDetail || {}
        const name = u.name || mp.accountName || mp.account || '未知人员'
        return {
          id: mp.id != null ? mp.id : i,
          name,
          avatarText: name.charAt(0) || '人',
          unit: u.company || u.deptName || '',
          position: u.position || '',
          seat: mp.seatNo || '',
          group: mp.groupName || ''
        }
      })

    const meta = []
    if (m.meetingLocation) {
      meta.push({ icon: '/assets/icons/meta-location.png', label: '会议地点', value: m.meetingLocation })
    }
    if (m.mainPerson) {
      meta.push({ icon: '/assets/icons/people.png', label: '主持人', value: m.mainPerson })
    }

    this.setData({
      meeting: {
        title: m.meetingName || '未命名会议',
        type: m.meetingTypeName || '',
        time: formatMeetingRange(m.startTime, m.endTime) || '时间待定',
        location: m.meetingLocation || '地点待定'
      },
      stats: [
        { id: 'topic', label: '议题', value: data.topicCount != null ? data.topicCount : 0 },
        { id: 'file', label: '材料', value: data.fileCount != null ? data.fileCount : 0 },
        { id: 'person', label: '参会人', value: persons.length }
      ],
      tabs: (data.tabs || []).map((t) => ({
        id: t.categoryId != null ? t.categoryId : t.id,
        name: t.categoryName || '未命名分类'
      })),
      persons
    })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
