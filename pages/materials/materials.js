const { request, getToken, goLogin, downloadFile } = require('../../utils/request')
const API = require('../../utils/api')
const { ensureCurrentMeeting } = require('../../utils/meeting')

/** 从 fileType 或文件名推断展示用类型（PDF/DOCX/...） */
function resolveType(fileType, fileName) {
  let t = (fileType || '').toString().replace(/^application\//, '')
  if (!t && fileName) {
    t = fileName.split('.').pop() || ''
  }
  return t ? t.toUpperCase() : 'FILE'
}

function formatSize(size) {
  const n = Number(size)
  if (!n || n <= 0) {
    return ''
  }
  if (n < 1024) {
    return `${n} B`
  }
  if (n < 1024 * 1024) {
    return `${(n / 1024).toFixed(1)} KB`
  }
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

Page({
  data: {
    statusBarHeight: 20,
    meetingTitle: '',
    totalCount: 0,
    loading: true,
    activeFilter: 'all',
    filters: [{ id: 'all', name: '全部' }],
    agendas: [],
    meetingId: null,
    // 记录各议程展开状态，切换分类时尽量保留
    expandMap: {}
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: sys.statusBarHeight || 20
    })
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
        this.setData({ meetingTitle: meeting.meetingName || '会议材料' })
        return request(API.meetingFiles(meeting.id))
      })
      .then((res) => {
        this.buildAgendas(Array.isArray(res.data) ? res.data : [])
        this.setData({ loading: false })
      })
      .catch((err) => {
        this.setData({ loading: false })
        wx.showToast({ title: err.message || '加载材料失败', icon: 'none' })
      })
  },

  /** 议题树（topic → meetingAgenda → agendaAttachments）转页面议程结构 */
  buildAgendas(topics) {
    const agendas = []
    const typeSet = {}
    topics.forEach((topic, i) => {
      const agenda = topic.meetingAgenda
      const attachments = (agenda && agenda.agendaAttachments) || []
      if (!agenda || attachments.length === 0) {
        return
      }
      const files = attachments.map((a) => {
        const type = resolveType(a.fileType, a.fileName)
        typeSet[type] = true
        const size = formatSize(a.fileSize)
        return {
          id: a.id,
          title: a.fileName || '未命名文件',
          type,
          size,
          // 后端不返回页数，仅展示大小
          meta: size || '大小未知',
          categoryId: 3
        }
      })
      agendas.push({
        id: topic.id,
        index: i + 1,
        title: agenda.agendaTitle || topic.topicName || '未命名议程',
        count: files.length,
        expanded: false,
        files
      })
    })

    const filters = [{ id: 'all', name: '全部' }].concat(
      Object.keys(typeSet).map((t) => ({ id: t, name: t }))
    )
    this.allAgendas = agendas
    this.setData({ filters })
    this.applyFilter('all')
  },

  applyFilter(category) {
    const { expandMap } = this.data
    let totalCount = 0
    const agendas = (this.allAgendas || [])
      .map((item) => {
        const files =
          category === 'all'
            ? item.files
            : item.files.filter((f) => f.type === category)
        totalCount += files.length
        return {
          ...item,
          files,
          count: files.length,
          expanded:
            expandMap[item.id] !== undefined ? expandMap[item.id] : item.expanded
        }
      })
      .filter((item) => item.files.length > 0)
    this.setData({
      activeFilter: category,
      agendas,
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
    const agendas = this.data.agendas.map((item) => {
      if (item.id === id) {
        const expanded = !item.expanded
        expandMap[id] = expanded
        return { ...item, expanded }
      }
      return item
    })
    this.setData({ agendas, expandMap })
  },

  findFile(fileId) {
    let found = null
    for (const agenda of this.allAgendas || []) {
      for (const file of agenda.files) {
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
    if (!this.data.meetingId) {
      wx.showToast({ title: '未获取到当前会议', icon: 'none' })
      return
    }
    wx.showLoading({ title: '加载文件...', mask: true })
    const ext = (file.type || 'pdf').toLowerCase()
    downloadFile(
      API.meetingFileDownload({
        fileId: file.id,
        categoryId: file.categoryId,
        meetingId: this.data.meetingId
      }),
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
