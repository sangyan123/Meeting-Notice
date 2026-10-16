/** 后端服务地址配置
 *
 * 本地联调：指向本机后端（java -jar 启动的 plos-service，监听 8888）。
 * 真机预览：手机与电脑同一 WiFi 时，改为 http://<电脑局域网IP>:8888（如 http://192.168.10.184:8888）。
 * 远程测试服务器：http://36.139.203.131:8888（注意两环境 personId/meetingId 互不通用）。
 * 开发者工具/真机调试需勾选「不校验合法域名」。
 * 正式上线前必须改为 HTTPS 备案域名（纯 HTTP 的 IP 无法加入小程序 request 合法域名），
 * 并在小程序后台配置 request 合法域名 + downloadFile 合法域名。
 */
module.exports = {
  baseUrl: 'http://117.172.73.111:8888'
  // baseUrl: 'http://36.139.203.131:8888'
}
