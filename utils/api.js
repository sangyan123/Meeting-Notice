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
  appSubmitPersonInfo: (meetingId) => `/meeting/personInfo/appSubmit/${meetingId}`
}
