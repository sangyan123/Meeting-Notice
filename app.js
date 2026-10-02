const { getToken, getUserInfo } = require('./utils/request')

App({
  onLaunch() {
    // 有历史 token 时静默恢复会话并刷新用户信息
    if (getToken()) {
      this.fetchUserInfo()
    }
  },

  /** 拉取当前登录用户信息，映射后写入 globalData.userInfo */
  fetchUserInfo() {
    return getUserInfo()
      .then((body) => {
        this.globalData.userInfo = this.mapUserInfo(body.user || body)
        return this.globalData.userInfo
      })
      .catch(() => null)
  },

  /** 将后端 SysAccount/PlosUser 映射为页面使用的用户信息 */
  mapUserInfo(user) {
    if (!user) {
      return null
    }
    const name = user.realName || user.name || user.nickName || user.account || ''
    return {
      name,
      avatarText: name ? name.charAt(0) : '客',
      account: user.account || '',
      phone: user.phone || '',
      position: user.position || '',
      company: user.company || '',
      deptName: user.deptName || '',
      // 后端暂无代表编号/代表团/专委会/座位数据，留空由页面兜底
      delegateNo: user.delegateNo || '',
      delegation: user.delegation || '',
      committee: user.committee || '',
      seat: user.seat || ''
    }
  },

  globalData: {
    userInfo: null,
    meetingInfo: {
      org: '会务通知',
      title: '',
      dateRange: ''
    },
    meetingId: null,
    infoRecord: null
  }
})
