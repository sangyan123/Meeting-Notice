const { request, getToken, goLogin, downloadFile } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')
const { resolveType, formatSize } = require('../../utils/file')

const WEEKS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

Page({
  data: {
    statusBarHeight: 20,
    meetingTitle: '',
    totalCount: 0,
    loading: true,
    activeFilter: 'all',
    filters: [{ id: 'all', name: '全部' }],
    groups: [],
    expandMap: {},
    showSchedule: false,
    scheduleDays: []
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
    this.loadMaterials()
  },

  loadMaterials() {
    this.setData({ loading: true })
    ensureCurrentMeeting()
      .then((meeting) => {
        this.meetingId = meeting.id
        this.setData({ meetingTitle: meeting.meetingName || '会议材料' })
        // 日程表失败不阻塞材料加载（旧后端可能没有该接口）
        return Promise.all([
          request(API.meetingCategoryFiles(meeting.id)),
          request(API.meetingDailyList, { data: { meetingId: meeting.id }, silent: true }).catch(
            () => null
          )
        ])
      })
      .then(([filesRes, dailyRes]) => {
        const daily = dailyRes && Array.isArray(dailyRes.data) ? dailyRes.data : []
        this.scheduleDays = this.buildScheduleDays(daily)
        this.buildGroups(Array.isArray(filesRes.data) ? filesRes.data : [])
        this.setData({ loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '加载材料失败', icon: 'none' })
      })
  },

  /** 单场会议的结构化日程（t_meeting_daily）按天分组，供「大会日程」分类展示 */
  buildScheduleDays(dailyList) {
    const byDay = {}
    dailyList.forEach((d) => {
      const key = String(d.dayStr || '').replace(/\D/g, '')
      if (!key) {
        return
      }
      const dayType = Number(d.dayType)
      ;(byDay[key] = byDay[key] || []).push({
        dayType,
        tag: dayType === 0 ? '上午' : dayType === 1 ? '下午' : '全天',
        title: d.title || '',
        contents: (d.contents || []).map((c) => ({
          id: c.id,
          name: c.contentName || c.agendaName || '',
          topics: (c.topicList || []).map((t) => t.topicName).join('、')
        }))
      })
    })
    return Object.keys(byDay)
      .sort()
      .map((key) => {
        const m = key.match(/^(\d{4})(\d{2})(\d{2})$/)
        let label = key
        if (m) {
          const d = new Date(+m[1], +m[2] - 1, +m[3])
          label = `${+m[2]}月${+m[3]}日 ${WEEKS[d.getDay()]}`
        }
        return {
          key,
          label,
          items: byDay[key].sort((a, b) => a.dayType - b.dayType)
        }
      })
  },

  /** 分类树（category → topics → files）转页面分组结构，分类完全跟随服务器配置 */
  buildGroups(categories) {
    const filters = [{ id: 'all', name: '全部' }]
    const allGroups = []
    let seq = 0
    categories.forEach((cat) => {
      const catId = cat.categoryId != null ? String(cat.categoryId) : ''
      if (!catId) {
        return
      }
      filters.push({ id: catId, name: cat.categoryName || `分类${catId}` })
      ;(cat.topics || []).forEach((topic) => {
        const files = (topic.files || [])
          // filePath 为空的是标题/目录占位行，不可下载
          .filter((f) => f.filePath || f.downloadUrl)
          .map((f) => {
            const type = resolveType(f.fileType, f.fileName)
            const size = formatSize(f.fileSize)
            return {
              id: f.fileId,
              title: f.fileName || '未命名文件',
              type,
              meta: size || '大小未知',
              categoryId: f.categoryId != null ? Number(f.categoryId) : Number(catId)
            }
          })
        if (files.length === 0) {
          return
        }
        seq++
        allGroups.push({
          id: `c${catId}_t${topic.topicId != null ? topic.topicId : `x${seq}`}`,
          categoryId: catId,
          index: seq,
          title: topic.topicName || '未命名分组',
          count: files.length,
          expanded: false,
          files
        })
      })
    })

    // 名字带「日程」的分类展示结构化日程表（如 Web 分类管理里的「大会日程」）
    const scheduleFilter = filters.find(
      (f) => f.id !== 'all' && (f.name || '').indexOf('日程') !== -1
    )
    this.scheduleFilterId = scheduleFilter ? scheduleFilter.id : ''
    this.allGroups = allGroups
    this.setData({ filters })
    this.applyFilter('all')
  },

  applyFilter(categoryId) {
    const { expandMap } = this.data
    let totalCount = 0
    const groups = (this.allGroups || [])
      .filter((g) => categoryId === 'all' || g.categoryId === categoryId)
      .map((g) => {
        totalCount += g.count
        return {
          ...g,
          expanded:
            expandMap[g.id] !== undefined ? expandMap[g.id] : g.expanded
        }
      })
    this.setData({
      activeFilter: categoryId,
      groups,
      totalCount,
      showSchedule:
        !!categoryId &&
        categoryId === this.scheduleFilterId &&
        (this.scheduleDays || []).length > 0,
      scheduleDays: this.scheduleDays || []
    })
  },

  onSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' })
  },

  onFilter(e) {
    this.applyFilter(e.currentTarget.dataset.id)
  },

  onToggle(e) {
    const id = e.currentTarget.dataset.id
    const expandMap = { ...this.data.expandMap }
    const groups = this.data.groups.map((item) => {
      if (item.id === id) {
        const expanded = !item.expanded
        expandMap[id] = expanded
        return { ...item, expanded }
      }
      return item
    })
    this.setData({ groups, expandMap })
  },

  findFile(fileId) {
    let found = null
    for (const group of this.allGroups || []) {
      for (const file of group.files) {
        if (file.id === fileId) {
          found = file
          break
        }
      }
      if (found) {
        break
      }
    }
    return found
  },

  /** 下载并打开真实材料文件 */
  onPreview(e) {
    const fileId = Number(e.currentTarget.dataset.id)
    const file = this.findFile(fileId)
    if (!file) {
      wx.showToast({ title: '文件不存在', icon: 'none' })
      return
    }
    if (!this.meetingId) {
      wx.showToast({ title: '未获取到当前会议', icon: 'none' })
      return
    }
    wx.showLoading({ title: '加载文件...', mask: true })
    const ext = (file.type || 'pdf').toLowerCase()
    downloadFile(
      API.meetingFileDownload({
        fileId: file.id,
        categoryId: file.categoryId,
        meetingId: this.meetingId
      }),
      file.title,
      ext
    )
      .then((tempPath) => {
        wx.hideLoading()
        wx.openDocument({
          filePath: tempPath,
          showMenu: true,
          fail: () => {
            wx.showToast({ title: '无法打开该文件格式', icon: 'none' })
          }
        })
      })
      .catch((err) => {
        wx.hideLoading()
        wx.showToast({ title: err.message || '文件加载失败', icon: 'none' })
      })
  }
})
