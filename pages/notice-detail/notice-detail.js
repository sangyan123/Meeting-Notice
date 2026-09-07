const NOTICE_MAP = {
  1: {
    id: 1,
    tag: '会前通知',
    tagType: 'pre',
    datetime: '2024-03-03 16:00',
    title: '关于大会开幕式有关事项的通知',
    issuer: '全国人大常委会办公厅',
    signDate: '2024年3月3日',
    content:
      '各位代表：\n\n　　十四届全国人大三次会议将于2024年3月5日上午9时在北京人民大会堂开幕。请各位代表于当日上午8时30分前到达人民大会堂南门，凭代表证进入会场。请着正装出席。\n\n　　开幕式相关事项安排如下：\n　　一、报到时间：2024年3月5日上午8:30\n　　二、报到地点：人民大会堂南门\n　　三、进入会场请出示代表证，服从现场引导\n　　四、请提前做好座位确认，按时入座\n\n　　特此通知。'
  },
  2: {
    id: 2,
    tag: '会中通知',
    tagType: 'mid',
    datetime: '2024-03-05 12:00',
    title: '关于分组审议政府工作报告的通知',
    issuer: '全国人大常委会办公厅',
    signDate: '2024年3月5日',
    content:
      '各位代表：\n\n　　现将分组审议政府工作报告安排通知如下：\n\n　　一、审议时间：2024年3月5日下午15:00—18:00\n　　二、审议地点：各代表团驻地会议室\n　　三、审议内容：听取并审议政府工作报告\n\n　　请各位代表按时参加，如有特殊情况请及时向代表团秘书组请假。\n\n　　特此通知。'
  },
  3: {
    id: 3,
    tag: '会中通知',
    tagType: 'mid',
    datetime: '2024-03-06 09:00',
    title: '3月7日全体会议时间调整通知',
    issuer: '全国人大常委会办公厅',
    signDate: '2024年3月6日',
    content:
      '各位代表：\n\n　　因会务安排调整，原定于2024年3月7日上午9:00开始的全体会议，调整为上午9:30开始。请各位代表注意时间变化，按时到会。\n\n　　特此通知。'
  },
  4: {
    id: 4,
    tag: '会后公告',
    tagType: 'post',
    datetime: '2024-03-11 08:00',
    title: '关于大会闭幕安排的通知',
    issuer: '全国人大常委会办公厅',
    signDate: '2024年3月11日',
    content:
      '各位代表：\n\n　　十四届全国人大三次会议闭幕式定于2024年3月11日下午举行。请各位代表按代表团统一安排前往人民大会堂参加闭幕式。\n\n　　特此通知。'
  }
}

Page({
  data: {
    statusBarHeight: 20,
    safeBottom: 0,
    scrollHeight: 500,
    replyStatus: '',
    notice: NOTICE_MAP[1]
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    const statusBarHeight = sys.statusBarHeight || 20
    const navBar = 44
    const footerApprox = 120
    const safeBottom = sys.safeAreaInsets ? sys.safeAreaInsets.bottom : 0
    const scrollHeight =
      sys.windowHeight - statusBarHeight - navBar - footerApprox - safeBottom

    const id = Number(options.id) || 1
    this.setData({
      statusBarHeight,
      safeBottom,
      scrollHeight: Math.max(scrollHeight, 300),
      notice: NOTICE_MAP[id] || NOTICE_MAP[1]
    })
  },

  onAttend() {
    this.setData({ replyStatus: 'attend' })
    wx.showToast({ title: '已确认出席', icon: 'success' })
  },

  onLeave() {
    this.setData({ replyStatus: 'leave' })
    wx.showToast({ title: '已提交请假', icon: 'none' })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
