const baseImgUrl = global.ossHost

const genders = ['男士', '女士']

const nativeErrorMessageTranslate = (errMsg, statusCode) => {
  let ret = errMsg

  if (/request\:fail/i.test(errMsg)) {
    ret = '网络异常 请稍后重试'
  } else if (statusCode == 404) {
    ret = '未知请求'
  }

  return ret
}

/**
 * 数据接口返回结构 兼容优化格式
 */
const transformResObj = (obj) => {
  const { status, data } = obj

  obj.code = status.state
  obj.data = data || {}
  obj.msg  = status.msg

  return obj
}

export default class BaseService {
  constructor() {
    
  }
  async request(opts = {}, isAsync = true) {
    /**
     * 封装API走Promose 统一数据格式
     */
    if (opts.constructor == String) {
      opts = { url: opts }
    }

    if (opts.url[0] == '/') {
      opts.url = global.host + opts.url
    }

    opts.showLoader && wx.showNavigationBarLoading()

    return new Promise((resolve, reject) => {
      wx.request(Object.assign(opts, {
        header: {
          "x-u-token": getToken()
        },
        complete: opts.complete || function(res) {
          let { data = {}, errMsg, statusCode, header } = res

          opts.showLoader && wx.hideNavigationBarLoading()

          if (statusCode == 200 &&
            data.status && data.status.state == 0) {

            data = transformResObj(data)

            resolve({ ...data, header })
          } else {
            if (data.status && data.status.state == 5) {
              clearUser()
              wx.hideNavigationBarLoading()

              setTimeout(() => wx.reLaunch({ url: '/pages/mine/index' }), 2e3)
            } else {
              if (!data.status) {
                if (data.constructor == String) {
                  data = { data }
                }

                errMsg = nativeErrorMessageTranslate(errMsg, statusCode)

                data.status = {
                  state: 1,
                  msg: data.error || errMsg
                }
              }
            }

            data = transformResObj(data)
            isAsync ? resolve({ ...data, header }) : reject({ ...data, header })
          }
        }
      }))
    })
  }
  async callFunction(controller, action, data) {
    return await wx.cloud.callFunction({
      name: 'cloudApi',
      data: {
        controller,
        action,
        data
      }
    }).then(({ errMsg, result, requestID }) => {
      const { code, msg, ...data } = result

      return transformResObj({
        status: {
          state: errMsg === 'cloud.callFunction:ok' ? ( code !== undefined ? code : 0 ) : -1,
          msg: msg || errMsg,
          requestID
        },
        data
      })
    }).catch(err => {
      let msg = ''

      try {
        const msgReg = err.errMsg.match(/error message (\S+)(;|.)/)
        msg = msgReg[1]
      } catch(e) {
        msg = `云API请求失败${controller}::${action}`
      }

      return transformResObj({ 
        status: { 
          state: err.errCode,
          msg: msg,
          requestID: err.requestID
        }
      })
    })
  }
}

/**
 * 存在信息
 * { userInfo, token, company, client }
 */
const _token_data_cache_key_ = '__mini_token__'
const getToken = () => {
  if (global.token) {
    return global.token
  } else {
    const token = wx.getStorageSync(_token_data_cache_key_)
    global.token = token
  
    return token
  }
}

export const setToken = (token) => {
  global.token = token
  return wx.setStorageSync(_token_data_cache_key_, token)
}

const _user_data_cache_key_ = '__mini_user__'

export const getUser = () => {
  const data = wx.getStorageSync(_user_data_cache_key_)

  if (data && data.userInfo) {
    const { userInfo } = data

    userInfo.validVip = userInfo.deviceid && +new Date(userInfo.vip_end_date) > Date.now()

    global.userInfo = userInfo

    return userInfo
  } else {
    return ""
  }
}

export const clearUser = () => {
  global.userInfo = undefined
  global.token = undefined
  global.company = undefined
  global.client = undefined
  
  wx.setStorageSync(_user_data_cache_key_, '')
  wx.setStorageSync(_token_data_cache_key_, '')
}

export const updateUser = (state = {}) => {
  const cur = getUser()
  const curUser = Object.assign(cur || {}, state)

  if (state.userInfo) {
    global.userInfo = curUser.userInfo
  }

  if (state.company) {
    global.company = curUser.company
  }

  // C端客户信息
  if (state.client) {
    global.client = curUser.client
  }

  wx.setStorageSync(_user_data_cache_key_, curUser)
}

export const parseGender = (gender) => {
  return genders[gender]
}

export const getTempFileURL = async (fileID) => {
  return await wx.cloud.getTempFileURL({
    fileList: [{
      fileID,
      maxAge: 60 * 60, // one hour
    }]
  }).then(res => {
    return res.fileList && res.fileList[0].tempFileURL || null
  }).catch(error => {
    console.log(error);
    return null
  })
}