const { getToken, getUserInfo } = require('./utils/request')

App({
  onLaunch() {
    // 有历史 token 时静默恢复会话并刷新用户信息；
    // 缓存 Promise，让首页等页面能等待同一个请求完成。
    if (getToken()) {
      this.userInfoPromise = this.fetchUserInfo()
    }
  },

  /** 拉取当前登录用户信息，映射后写入 globalData.userInfo */
  fetchUserInfo(force = false) {
    if (!force && this.userInfoPromise) {
      return this.userInfoPromise
    }
    const request = getUserInfo()
      .then((body) => {
        const user = this.mapUserInfo(body.user || body)
        this.globalData.userInfo = user
        return user
      })
      .catch(() => {
        if (this.userInfoPromise === request) {
          this.userInfoPromise = null
        }
        return null
      })
    if (!force) {
      this.userInfoPromise = request
    }
    return request
  },

  /** 将后端 SysAccount/PlosUser 映射为页面使用的用户信息 */
  mapUserInfo(user) {
    if (!user) {
      return null
    }
    const name = user.realName || user.name || user.nickName || user.account || ''
    return {
      name,
      avatar: user.avatar || user.avatarUrl || user.headImage || user.photo || '',
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
      org: '攀枝花市人民政府',
      title: '',
      dateRange: ''
    },
    meetingId: null,
    currentMeeting: null,
    infoRecord: null
  }
})
