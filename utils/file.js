/** 文件展示辅助：类型识别与大小格式化（材料页/参阅材料页共用） */

/** 从 fileType 或文件名推断展示用类型（PDF/DOCX/...） */
function resolveType(fileType, fileName) {
  let t = (fileType || '').toString().replace(/^application\//, '')
  if (!t && fileName) {
    t = fileName.split('.').pop() || ''
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
