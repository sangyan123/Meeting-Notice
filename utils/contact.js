/** 电话号码点击动作弹窗（呼叫 / 复制号码 / 添加到手机通讯录）
 *
 * 微信小程序没有系统级「号码三选项弹窗」，这里用 wx.showActionSheet 自行实现：
 * - 呼叫：wx.makePhoneCall
 * - 复制号码：wx.setClipboardData（成功后微信自带「内容已复制」提示）
 * - 添加到手机通讯录：wx.addPhoneContact（拉起微信联系人界面，可选新建或加入已有联系人）
 */

/** 打开号码操作弹窗；phone 为空时不响应（如会务服务台的地点行） */
function showContactActions(phone, name) {
  const number = String(phone || '').trim()
  if (!number) {
    return
  }
  wx.showActionSheet({
    itemList: ['呼叫', '复制号码', '添加到手机通讯录'],
    success(res) {
      if (res.tapIndex === 0) {
        wx.makePhoneCall({ phoneNumber: number, fail: () => {} })
      } else if (res.tapIndex === 1) {
        wx.setClipboardData({ data: number, fail: () => {} })
      } else if (res.tapIndex === 2) {
        wx.addPhoneContact({
          // 通讯录联系人名：优先用联系人/条目名称，缺失时兜底「秘书处」
          firstName: String(name || '').trim() || '秘书处',
          mobilePhoneNumber: number,
          fail(err) {
            const msg = (err && err.errMsg) || ''
            // 用户主动取消不提示；仅权限被拒时提示
            if (msg.indexOf('cancel') === -1 && msg.indexOf('auth') !== -1) {
              wx.showToast({ title: '未获得通讯录权限', icon: 'none' })
            }
          }
        })
      }
    },
    fail: () => {}
  })
}

module.exports = { showContactActions }