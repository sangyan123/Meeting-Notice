const { request } = require('./request')
const API = require('./api')

/** 获取当前会议（首页已取到时复用全局缓存，否则请求并缓存） */
function ensureCurrentMeeting() {
  const app = getApp()
  if (app.globalData.meetingId) {
    return Promise.resolve({
      id: app.globalData.meetingId,
      meetingName: app.globalData.meetingInfo.title
    })
  }
  return request(API.currentMeeting).then((res) => {
    const meeting = res.data
    if (!meeting || !meeting.id) {
      throw new Error('当前没有您参加的会议')
    }
    app.globalData.meetingId = meeting.id
    return meeting
  })
}

module.exports = { ensureCurrentMeeting }
