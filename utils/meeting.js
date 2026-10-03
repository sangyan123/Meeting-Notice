const { request } = require('./request')
const API = require('./api')

/** 获取当前会议（以完整会议对象为缓存；首页可能只写了 meetingId，缺对象时补拉一次，含地点/时间） */
function ensureCurrentMeeting() {
  const app = getApp()
  if (app.globalData.currentMeeting) {
    return Promise.resolve(app.globalData.currentMeeting)
  }
  return request(API.currentMeeting).then((res) => {
    const meeting = res.data
    if (!meeting || !meeting.id) {
      throw new Error('当前没有您参加的会议')
    }
    app.globalData.meetingId = meeting.id
    app.globalData.currentMeeting = meeting
    return meeting
  })
}

module.exports = { ensureCurrentMeeting }
