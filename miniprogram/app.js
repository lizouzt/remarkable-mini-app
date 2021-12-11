import { User, updateUser, getUser, setToken } from './manager/api'
import config from './config'

const USER_INFO_CACHE_KEY = '__login_user_info__'

Object.assign(global, config)

global.message = (errMsg) => {
  const [ page ] = getCurrentPages()

  page.toast ? 
  page.toast.showWarning(errMsg) :
  wx.showToast({ icon: 'error', title: errMsg })
}

global.getUserId = () => {
  return new Promise(async resolve => {
    if (global.openid) {
      return resolve(true)
    }
    global.getUserId.__calls ||= []

    if (global.getUserId.__loading) {
      global.getUserId.__calls.push(resolve)
    } else {
      global.getUserId.__loading = true

      const { code, data } = await User.getUserId()

      global.getUserId.__loading = false
      
      if (code === 0) {
        global.openid = data.openid
      } else {
        global.message('微信登录失败 请退出重试!')
      }

      global.getUserId.__calls.forEach(reCallResolve => {
        reCallResolve(true)
      })

      global.getUserId.__calls = []

      resolve(true)
    }
  })
}

global.doLogin = ({ user_info, refresh = false } = {}) => {
  return new Promise(async resolve => {
    if (!refresh && global.userInfo) {
      return resolve(global.userInfo)
    }

    if (global.doLogin._isPosting_) {
      global.doLogin._resolveList_.push(resolve)
      return false
    } else {
      global.doLogin._isPosting_ = true
      global.doLogin._resolveList_ = [resolve]
    }

    wx.login({
      success: async ({code, errMsg}) => {
        if (!code) {
          global.message('微信登录失败 请退出重试')
        }

        const { code: loginResCode, data, header } = await User.login({ code, user_info })

        global.doLogin._isPosting_ = false

        if (loginResCode == 0) {
          if (data.code != 1) {
            const userInfo = data.user_info
            
            userInfo.validVip = userInfo.deviceid && +new Date(userInfo.vip_end_date) > Date.now()

            updateUser({ userInfo })
            setToken(data.token || header.token)
          }
        } else if (refresh) {
          global.message('刷新信息失败')
        }

        global.doLogin._resolveList_.forEach(rec => rec(global.userInfo))
        global.doLogin._resolveList_ = []
      }
    })
  })
}

const initAppGlobalData = async () => {
  getUser()
  
  // await global.getAppConfigure()
  await global.getUserId()
  await global.doLogin({ refresh: true })
}

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'photo-1g8ir9j972793b5f',
        traceUser: true,
      })
    }

    initAppGlobalData()
  }
})
