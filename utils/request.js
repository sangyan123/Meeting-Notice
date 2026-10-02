const { baseUrl } = require('./config')
const API = require('./api')

const TOKEN_KEY = 'token'

let redirectingToLogin = false

function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || ''
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token)
}

function goLogin() {
  if (redirectingToLogin) {
    return
  }
  redirectingToLogin = true
  wx.reLaunch({
    url: '/pages/login/login',
    complete: () => {
      redirectingToLogin = false
    }
  })
}

/** 登出：清空本地会话；此前已登录时回到登录页 */
function logout() {
  const hadToken = !!getToken()
  wx.removeStorageSync(TOKEN_KEY)
  const app = getApp()
  if (app) {
    app.globalData.userInfo = null
  }
  if (hadToken) {
    goLogin()
  }
}

/**
 * 基础请求封装（Promise）
 * - 自动携带 Authorization: Bearer <token>
 * - 命中若依返回体 code===200 视为成功，resolve 完整 body
 * - 401（未登录/token 失效/被其他设备踢下线）自动跳登录页
 */
function request(path, { method = 'GET', data, silent = false } = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${path}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: getToken() ? `Bearer ${getToken()}` : ''
      },
      success: (res) => {
        if (res.statusCode === 401) {
          if (!silent) {
            wx.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
          }
          logout()
          reject(new Error('unauthorized'))
          return
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error((res.data && res.data.msg) || `请求失败（${res.statusCode}）`))
          return
        }
        const body = res.data
        if (body && typeof body === 'object' && 'code' in body) {
          if (body.code === 200) {
            resolve(body)
          } else {
            if (body.code === 401) {
              logout()
            }
            reject(new Error(body.msg || '请求失败'))
          }
          return
        }
        resolve(body)
      },
      fail: (err) => {
        reject(new Error('网络异常，请检查后端服务是否可达'))
      }
    })
  })
}

/** 账号密码登录（POST /appLogin），成功后保存 token */
function login(username, password) {
  return request(API.login, {
    method: 'POST',
    data: { username, password },
    silent: true
  }).then((body) => {
    if (!body.token) {
      throw new Error('登录失败：未获取到凭证')
    }
    setToken(body.token)
    return body
  })
}

/** 获取当前登录用户信息（GET /meeting/user/getInfo） */
function getUserInfo() {
  return request(API.userInfo, { silent: true }).then((body) => body)
}

/** 将 ArrayBuffer 解码为 UTF-8 字符串（用于识别后端返回的 JSON 错误体） */
function ab2str(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  try {
    return decodeURIComponent(escape(binary))
  } catch (e) {
    return binary
  }
}

/**
 * 带鉴权的文件下载，resolve 本地文件路径（用于 wx.openDocument 预览）。
 * 后端出错时返回 HTTP 200 + JSON（code 401/403/500），与文件流同为 200，
 * 因此必须用 arraybuffer + Content-Type 区分，不能用 wx.downloadFile。
 * ext：文件扩展名（pdf/docx/...），用于落盘命名以便 openDocument 识别。
 */
function downloadFile(path, ext) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${path}`,
      responseType: 'arraybuffer',
      header: {
        Authorization: getToken() ? `Bearer ${getToken()}` : ''
      },
      success: (res) => {
        const header = res.header || {}
        const contentType = String(
          header['Content-Type'] || header['content-type'] || ''
        ).toLowerCase()
        if (contentType.indexOf('application/json') !== -1) {
          let msg = '文件加载失败'
          let code = 500
          try {
            const body = JSON.parse(ab2str(res.data))
            msg = (body && body.msg) || msg
            code = (body && body.code) || code
          } catch (e) {
            /* 非 JSON 错误体，忽略 */
          }
          if (code === 401) {
            logout()
          }
          reject(new Error(msg))
          return
        }
        if (res.statusCode !== 200 && res.statusCode !== 206) {
          reject(new Error(`文件下载失败（${res.statusCode}）`))
          return
        }
        try {
          const fs = wx.getFileSystemManager()
          const filePath = `${wx.env.USER_DATA_PATH}/material_${Date.now()}.${ext || 'pdf'}`
          fs.writeFileSync(filePath, res.data, 'binary')
          resolve(filePath)
        } catch (e) {
          reject(new Error('文件保存失败'))
        }
      },
      fail: () => {
        reject(new Error('网络异常，文件下载失败'))
      }
    })
  })
}

module.exports = {
  baseUrl,
  getToken,
  setToken,
  goLogin,
  logout,
  request,
  login,
  getUserInfo,
  downloadFile
}
