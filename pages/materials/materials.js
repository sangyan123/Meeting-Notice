const { request, getToken, goLogin, downloadFile } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')
const { resolveType, formatSize } = require('../../utils/file')

Page({
  data: {
    statusBarHeight: 20,
    meetingTitle: '',
    totalCount: 0,
    loading: true,
    activeFilter: 'all',
    filters: [{ id: 'all', name: '全部' }],
    groups: [],
    expandMap: {}
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
        return request(API.meetingCategoryFiles(meeting.id))
      })
      .then((res) => {
        this.buildGroups(Array.isArray(res.data) ? res.data : [])
        this.setData({ loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '加载材料失败', icon: 'none' })
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
      totalCount
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
