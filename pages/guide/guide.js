Page({
  data: {
    statusBarHeight: 20,
    sections: [
      {
        id: 'attend',
        title: '参会须知',
        items: [
          '请携带代表证及有效身份证件参会',
          '会议期间请将手机调至静音模式',
          '按座位表对号入座，不得擅自调换座位',
          '会议材料请妥善保管，不得外传'
        ]
      },
      {
        id: 'venue',
        title: '会场位置',
        items: [
          '主会场：市政府综合楼三楼会议室',
          '停车场：综合楼地下一层（代表车辆免费停放）',
          '签到处：三楼电梯口左侧'
        ]
      },
      {
        id: 'service',
        title: '服务信息',
        items: [
          '会议期间备有饮用水，茶歇安排在休息室',
          '如需打印材料请联系会务人员',
          '医疗点设在一楼大厅东侧'
        ]
      },
      {
        id: 'notice',
        title: '注意事项',
        items: [
          '请提前15分钟入场完成签到',
          '发言请举手示意，经主持人允许后发言',
          '会议录音录像须经主持人许可'
        ]
      }
    ]
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
  },

  onBack() {
    wx.navigateBack({ delta: 1 })
  }
})
