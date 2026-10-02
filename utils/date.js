/** 会议时间展示格式化（首页/会议详情页共用） */

/** 宽松解析后端时间：兼容 "yyyy-MM-dd HH:mm:ss"、ISO 串与时间戳 */
function parseDate(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }
  if (typeof value === 'number') {
    return new Date(value)
  }
  const str = String(value).replace('T', ' ')
  const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?: (\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (m) {
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0))
  }
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`
}

function fmtHM(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 会议时间展示：同日 "09:00—12:00"，跨日 "03-05 09:00—03-07 12:00" */
function formatMeetingTime(start, end) {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s && !e) {
    return '时间待定'
  }
  if (s && e) {
    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate()
    if (sameDay) {
      return `${fmtHM(s)}—${fmtHM(e)}`
    }
    return `${pad(s.getMonth() + 1)}-${pad(s.getDate())} ${fmtHM(s)}—${pad(e.getMonth() + 1)}-${pad(e.getDate())} ${fmtHM(e)}`
  }
  const d = s || e
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${fmtHM(d)}`
}

/** 大会日期区间展示："2024年3月5日—3月11日" */
function formatMeetingRange(start, end) {
  const s = parseDate(start)
  const e = parseDate(end)
  if (!s) {
    return ''
  }
  const startText = `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日`
  if (!e) {
    return startText
  }
  if (
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth()
  ) {
    return `${startText}—${e.getDate()}日`
  }
  return `${startText}—${e.getFullYear()}年${e.getMonth() + 1}月${e.getDate()}日`
}

module.exports = {
  parseDate,
  formatMeetingTime,
  formatMeetingRange
}
