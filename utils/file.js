/** 文件展示辅助：类型识别与大小格式化（材料页/参阅材料页共用） */

/** 常见 MIME 类型 → 简短展示类型（后端 fileType 常为完整 MIME，如 application/vnd.openxml...） */
const MIME_MAP = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.ms-word': 'doc',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'dotx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'xltx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.presentationml.template': 'potx',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'ppsx',
  'text/plain': 'txt',
  'text/html': 'html'
}

/** 从文件名取扩展名（忽略路径与隐藏文件点号），无扩展名返回空串 */
function extFromName(fileName) {
  const name = String(fileName || '')
  const idx = name.lastIndexOf('.')
  if (idx > 0 && idx < name.length - 1) {
    return name.slice(idx + 1)
  }
  return ''
}

/** 从 fileType 或文件名推断展示用类型（PDF/DOCX/...） */
function resolveType(fileType, fileName) {
  const ft = String(fileType || '').trim().toLowerCase()
  if (MIME_MAP[ft]) {
    return MIME_MAP[ft].toUpperCase()
  }
  let t = extFromName(fileName)
  if (!t && ft) {
    t = ft.replace(/^application\//, '')
  }
  return t ? t.toUpperCase() : 'FILE'
}

/** 字节数 → "2.3 MB" 等可读大小；无效值返回空串 */
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

module.exports = {
  resolveType,
  formatSize
}
