const { request, getToken } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')
const { showContactActions } = require('../../utils/contact')

/** 兜底数据：接口拉取失败时保留展示；拉取成功后以接口数据为准 */
const DEFAULT_HOTLINE = {
  title: '服务热线（24小时）',
  phone: '0812-6309-0000'
}

const DEFAULT_GROUPS = [
  {
    id: 'coordination',
    name: '综合协调组',
    contact: '李主任',
    tag: '会议整体协调',
    phone: '0812-6309-1001'
  },
  {
    id: 'service',
    name: '会务服务组',
    contact: '王干事',
    tag: '住宿、餐饮、交通',
    phone: '0812-6309-1002'
  },
  {
    id: 'material',
    name: '文件材料组',
    contact: '赵干事',
    tag: '会议材料收发',
    phone: '0812-6309-1003'
  },
  {
    id: 'technical',
    name: '技术保障组',
    contact: '陈干事',
    tag: '音视频、网络',
    phone: '0812-6309-1004'
  }
]

Page({
  data: {
    statusBarHeight: 20,
    hotline: DEFAULT_HOTLINE,
    groups: DEFAULT_GROUPS
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
  },

  onShow() {
    if (!getToken()) {
      return
    }
    this.fetchPageData()
  },

  /** 拉取页面数据：工作组列表（秘书管理维护）+ 服务热线（会务配置），失败保留兜底 */
  fetchPageData() {
    ensureCurrentMeeting()
      .then((meeting) => {
        this.fetchGroups(meeting.id)
        this.fetchHotline(meeting.id)
      })
      .catch(() => {
        // 会议信息获取失败，保留兜底数据
      })
  },

  /** 工作组列表：后端按 sort_num 升序返回；拉取成功即整体替换（含后台配置为空的情况），失败保留兜底 */
  fetchGroups(meetingId) {
    request(API.appSecretaryList, {
      data: { meetingId: meetingId },
      silent: true
    })
      .then((body) => {
        const rows = body.data || []
        this.setData({
          groups: rows.map((row) => ({
            id: row.id,
            name: row.groupName || '',
            contact: row.contactName || '',
            tag: row.duty || '',
            phone: row.phone || ''
          }))
        })
      })
      .catch(() => {
        // 接口失败保留兜底工作组
      })
  },

  /** 服务热线：取会务配置的 servicePhone；未配置或失败保留兜底 */
  fetchHotline(meetingId) {
    request(API.appServiceConfig, {
      data: { meetingId: meetingId },
      silent: true
    })
      .then((body) => {
        const d = body.data || {}
        if (d.servicePhone) {
          this.setData({
            hotline: {
              title: this.data.hotline.title,
              phone: d.servicePhone
            }
          })
        }
      })
      .catch(() => {
        // 配置拉取失败保留兜底热线
      })
  },

  onCall(e) {
    showContactActions(e.currentTarget.dataset.phone, e.currentTarget.dataset.name)
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})