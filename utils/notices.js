/** 通知模块共用映射（index / notices / notice-detail / receipt-record） */
const { formatDateTime } = require('./date')

/** 通知分类 → 展示文案（与后端 t_meeting_notice.category 取值对应） */
const CATEGORY_TAGS = {
  pre: '会前通知',
  mid: '会中通知',
  post: '会后公告'
}

function categoryTag(category) {
  return CATEGORY_TAGS[category] || '通知'
}

/** 列表行（t_meeting_notice + isRead/myReceiptType 查询列）→ 页面展示模型 */
function mapNoticeRow(row) {
  if (!row) {
    return null
  }
  return {
    id: row.id,
    meetingId: row.meetingId,
    meetingName: row.meetingName || '',
    tagType: row.category || '',
    tag: categoryTag(row.category),
    title: row.title || '',
    datetime: formatDateTime(row.publishTime),
    unread: !row.isRead,
    requireReceipt: row.requireReceipt === 1,
    myReceiptType: row.myReceiptType || ''
  }
}

/** 正文渲染方式：富文本 HTML 用 rich-text，纯文本保留换行直接展示 */
function isRichText(content) {
  return /<\s*(p|div|span|br|section|img|b|strong|em|u|ul|ol|li|table|tbody|tr|td|h[1-6])\b/i.test(
    String(content || '')
  )
}

module.exports = {
  CATEGORY_TAGS,
  categoryTag,
  mapNoticeRow,
  isRichText
}
