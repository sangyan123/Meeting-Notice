/** 后端接口路径集中维护
 *
 * 环境地址见 utils/config.js。
 * 路径与 nopaper-backend 的 Controller 一一对应，改后端路由时同步这里。
 */
module.exports = {
  /** 登录 POST {username, password} → {token}（SysLoginController） */
  login: '/appLogin',

  /** 当前登录用户信息 GET → {user, personId}（PlosUserController） */
  userInfo: '/meeting/user/getInfo',

  /** 当前进行中的会议 GET → TMeetingMain（TMeetingMainController） */
  currentMeeting: '/meeting/main/appCurrentMeeting',

  /** 今天的会议列表 GET ?meetingTypeId= → [TMeetingMain] */
  todayMeetings: '/meeting/main/appTodayList',

  /** 会议信息列表 GET → [TMeetingMain]（与Web会议信息页同口径：数据范围过滤，排除创建中） */
  appInfoList: '/meeting/main/appInfoList',

  /** 会议详情（基本信息+参会人+资料分类+统计）GET → {meeting, persons, tabs, topicCount, fileCount} */
  meetingInfo: (meetingId) => `/meeting/main/appInfo/${meetingId}`,

  /** 会议日程列表 GET ?meetingId= → [{dayStr, dayType, title, contents[]}]（TMeetingDailyController） */
  meetingDailyList: '/meeting/daily/list',

  /** 会议文件树 GET → [TMeetingTopic]，含 meetingAgenda.agendaAttachments（材料Tab：议程附件） */
  meetingFiles: (meetingId) => `/meeting/main/appFiles/${meetingId}`,

  /** 全部分类文件树 GET → [{categoryId, categoryName, topics:[{topicId, topicName, files:[...]}]}]（参阅材料页：分类资料） */
  meetingCategoryFiles: (meetingId) => `/meeting/main/categories/${meetingId}/files`,

  /** 会议文件下载流 GET（FileDownloadController），categoryId=3 议程附件 */
  meetingFileDownload: ({ fileId, categoryId, meetingId }) =>
    `/downloadServlet/download?fileId=${fileId}&categoryId=${categoryId}&meetingId=${meetingId}`,

  /** 提交请假 POST（简单版：将本人参会状态置为请假，TMeetingPersonController） */
  appLeave: (meetingId) => `/meeting/person/appLeave/${meetingId}`,

  /** 我的参会状态 GET → {status, roleType}（0=请假 1=到会 2=缺席 3=未设置） */
  appMyStatus: (meetingId) => `/meeting/person/appMyStatus/${meetingId}`,

  /** 我的座位 GET → {seatNo, tableCard, groupName}（Web 排座保存时回写参会人） */
  appMySeat: (meetingId) => `/meeting/person/appMySeat/${meetingId}`,

  /** 座位图 GET → {layoutName, rowCount, colCount, mySeatId, seats:[{id,r,c,no,name,mine,disabled,aisle,blank}]} */
  appSeatMap: (meetingId) => `/meeting/person/appSeatMap/${meetingId}`,

  /** 我的参会信息填报 GET → {submitted, phone, hotelNeed(0/1), dietType, transport, arriveDate, leaveDate, remark, submitTime}（TMeetingPersonInfoController） */
  appMyInfo: (meetingId) => `/meeting/personInfo/appMyInfo/${meetingId}`,

  /** 提交参会信息填报 POST {phone, hotelNeed, dietType, transport, arriveDate, leaveDate, remark} → {submitTime}，重复提交覆盖 */
  appSubmitPersonInfo: (meetingId) => `/meeting/personInfo/appSubmit/${meetingId}`,

  // ===== 以下为「代表端会务服务」接口（nopaper-backend doc/代表端会务服务接口文档.md，2026-10-10）=====

  /** 通知列表 GET ?meetingId=&category=&pageNum=&pageSize= → {total, pageNum, pageSize, rows, unreadCount} */
  appNoticeList: '/meeting/appNotice/list',

  /** 最新通知 GET ?meetingId=&limit= → {rows, unreadCount}（limit 默认5，最大50） */
  appNoticeLatest: '/meeting/appNotice/latest',

  /** 通知详情 GET → {noticeId, meetingId, meetingName, category, title, content, publisher, publishTime, requireReceipt, myReceipt}；打开即自动标记已读 */
  appNoticeDetail: (noticeId) => `/meeting/appNotice/${noticeId}`,

  /** 标记已读（幂等）POST → {marked, firstMark, unreadCount} */
  appNoticeRead: (noticeId) => `/meeting/appNotice/${noticeId}/read`,

  /** 未读数 GET ?meetingId= → {unreadCount}（不传=本人全部会议） */
  appNoticeUnreadCount: '/meeting/appNotice/unreadCount',

  /** 提交通知回执 POST {receiptType: 'attend'|'leave', reason: 'leave必填'} → 本人回执，重复提交覆盖 */
  appNoticeReceipt: (noticeId) => `/meeting/appNotice/${noticeId}/receipt`,

  /** 本人当前回执 GET → {receiptId, receiptType, reason, submitTime} 或 null */
  appNoticeMyReceipt: (noticeId) => `/meeting/appNotice/${noticeId}/myReceipt`,

  /** 本人通知回执历史 GET ?meetingId=&pageNum=&pageSize= → {total, rows} */
  appNoticeMyReceipts: '/meeting/appNotice/myReceipts',

  /** 提交请假申请 POST {meetingId, reason} → {id, meetingId, status(0=待处理), submitTime} */
  appLeaveApply: '/meeting/appLeave/apply',

  /** 本人请假历史 GET ?meetingId=&pageNum=&pageSize= → {total, rows: [{id, meetingName, reason, status, approveAccountName, approveTime, approveOpinion, submitTime}]} */
  appLeaveMyList: '/meeting/appLeave/myList',

  /** 本人住宿安排 GET ?meetingId= → {arranged, hotelName, roomNo, checkinTime, checkoutTime, address, phone, remind, remark, latitude, longitude} */
  appHotel: '/meeting/appArrangement/hotel',

  /** 用餐安排 GET ?meetingId= → {rows: [{id, mealDate, mealType, startTime, endTime, location, description, remind, sortNum}], dietReminder} */
  appMealList: '/meeting/appArrangement/meal/list',

  /** 班车安排 GET ?meetingId= → {rows: [{id, busDate, shiftName, departTime, origin, destination, capacity(0=不限), status(1=正常/0=停运), remark, occupied, myBooked}]} */
  appBusList: '/meeting/appArrangement/bus/list',

  /** 预约班车 POST（幂等；满员/停运返回错误） */
  appBusBook: (busId) => `/meeting/appArrangement/bus/${busId}/book`,

  /** 取消班车预约 DELETE（幂等；取消即时释放名额） */
  appBusCancelBook: (busId) => `/meeting/appArrangement/bus/${busId}/book`,

  /** 会务配置 GET ?meetingId= → {orgName, servicePhone, serviceDeskLocation, emergencyPhone, noticeEnabled, leaveEnabled, hotelEnabled, mealEnabled, busEnabled, serviceCallEnabled} */
  appServiceConfig: '/meeting/appService/config',

  /** 消息偏好 GET → {masterEnabled, preEnabled, midEnabled, postEnabled, updateTime}；POST 保存 {masterEnabled...} 取值 0/1 */
  appMessagePref: '/meeting/appMessagePref',

  /** 代表身份 GET ?meetingId= → {accountId, name, account, phone, position, company, avatar, delegateNo, delegation, committee, roleType, seatNo, tableCard, groupName} */
  appDelegateIdentity: '/meeting/appDelegate/identity',

  /** 服务端会话注销 POST（销毁 Redis 登录态，配套 /appLogin 签发的令牌） */
  serverLogout: '/logout'
}
