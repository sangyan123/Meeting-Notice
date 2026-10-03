# 会务通知微信小程序

基于会议通知场景的微信小程序（原生开发），对接 nopaper-backend 业务后端，包含四个 Tab 页面与若干子页面：

- **首页** — 大会信息、快捷入口、今日会议、最新通知
- **会议材料** — 分类筛选、按议程展开的材料列表，支持在线预览（PDF）与下载
- **会务服务** — 服务入口网格（座位/住宿/用餐/用车等）、秘书处联系方式
- **个人中心** — 代表信息、回执/请假记录、信息填报、设置与退出

子页面：登录、会议日程、会议详情、通知列表/详情、PDF 预览、请假申请、信息填报/记录等。

## 目录结构

```
app.js / app.json / app.wxss   小程序入口与全局配置（token 静默恢复、globalData）
pages/                        页面（tab 页 + 子页面）
utils/
  config.js                   后端服务地址配置
  api.js                      后端接口路径集中维护
  request.js                  请求封装（token、登录态）
  file.js / date.js           文件下载/预览、日期工具
assets/icons/                 tabBar 与页面内图标
styles/                       公共样式
```

## 后端对接

- 服务地址在 `utils/config.js` 配置（当前指向已部署的测试服务器）。
- 接口路径在 `utils/api.js` 集中维护，与 nopaper-backend 的 Controller 一一对应：登录、用户信息、当前会议、今日会议、会议详情、日程、文件树、分类材料、文件下载。
- 登录后 token 本地缓存，`app.js` 启动时静默恢复会话并刷新用户信息。

## 使用方式

1. 安装并打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 选择「导入项目」，目录指向本仓库根目录
3. AppID 可先使用测试号 / 游客模式（`touristappid`）
4. 开发调试需在「详情 → 本地设置」勾选**不校验合法域名**（当前后端为 HTTP + IP 端口）
5. 编译预览即可查看全部页面

## 上线前待办

- [ ] 后端切换为 HTTPS 备案域名，并同步更新 `utils/config.js` 的 `baseUrl`（纯 HTTP 的 IP 无法加入小程序 request 合法域名）
- [ ] 在小程序后台配置 request / downloadFile 合法域名
- [ ] 配置正式 AppID 与相关权限
