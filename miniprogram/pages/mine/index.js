import { User, Device, updateUser } from '../../manager/api'
import { getBtnAudioCtx, sleep, copyText } from '../../common/utils'

Page({
  data: {
    photos: [],
    canUseGetUserProfile: !!wx.getUserProfile,
    skRegion: {
      userInfo: false,
    },

    navBgShow: false,
    loginPosting: false,
    doingGetCode: false,
    doingRidOfCode: false,
    doingStateRefresh: false,

    userInfo: null,

    navHeight: global.deviceInfo.navHeight,
  },
  copyText: copyText,
  onLoad (options) {
    // wx.hideShareMenu({menus: ['shareAppMessage', 'shareTimeline']})
    this.toast = this.selectComponent("#toast")

    this.clickAudio = getBtnAudioCtx('/images/audio/click.mp3')

    this.getUserInfo()
  },

  onPageScroll ({ scrollTop }) {
    if (scrollTop > 88) {
      !this.data.navBgShow && this.setData({ navBgShow: true })
    } else {
      this.data.navBgShow && this.setData({ navBgShow: false })
    }
  },

  async getUserInfo (options) {
    await global.doLogin(options)
    this.setData({ userInfo: global.userInfo })
  },

  bingGetUserInfo ({ detail: { userInfo, errMsg } }) {
    if (this.data.loginPosting) {
      return false
    }

    const that = this

    if (wx.getUserProfile) {
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success (res) {
          console.log('res.userInfo', res.userInfo)
          that.doLogin(res.userInfo)
        },
        fail (err) {
          global.message('登陆失败 ' + err.errMsg)
        }
      })
    } else {
      console.log('res.userInfo', userInfo)
      that.doLogin(userInfo)
    }
  },

  async doLogin (userInfo) {
    this.setData({ loginPosting: true })

    await sleep()

    const userInfoData = await global.doLogin({ user_info: userInfo })
    console.log('userInfoData', userInfoData)
    
    this.setData({
      loginPosting: false,
      userInfo: userInfoData
    })
  },

  onSyncSwitch () {
    this.toast.showWarning('默认不可关闭', '可以联系客服获得支持')
  },

   /** 弹窗选择续费标准 */

  async getCode () {
    this.clickAudio.play()
    this.setData({ doingGetCode: true })

    const { code, msg, data } = await Device.getCode()

    this.setData({ doingGetCode: false })

    if (code !== 0) {
      return this.toast.showFailure('获取失败', msg)
    }

    this.setData({ 'userInfo.code': data.code })
    updateUser({ userInfo: this.data.userInfo })
  },

  async doingStateRefresh () {
    this.clickAudio.play()

    this.setData({ doingStateRefresh: true })

    if (this.__lastRefreshTime && this.__lastRefreshTime + 1e3 * 60 * 1 > Date.now()) {
      // 分钟前刷新过
      
      await sleep(1e3)
    } else {
      this.__lastRefreshTime = Date.now()

      await this.getUserInfo({ refresh: true })
    }

    this.setData({ doingStateRefresh: false })
  },

  async ridOfCode () {
    this.clickAudio.play()
    this.setData({ doingRidOfCode: true })

    const { userInfo } = this.data

    const { code, msg, data } = await Device.ridOfCode({ deviceid: userInfo.deviceid })

    this.setData({ doingRidOfCode: false })

    if (code !== 0) {
      return this.toast.showFailure('解绑失败', msg)
    }

    userInfo.deviceid = ''
    userInfo.code = ''

    this.setData({ userInfo })
    updateUser({ userInfo })
  },

  openCustomService () {
    wx.openCustomerServiceChat({
      extInfo: {url: 'https://work.weixin.qq.com/kfid/kfc5e449bb8d7535a84'},
      corpId: 'ww517a954e4c100706',
      success (res) {
        console.log(res)
      },
      fail (err) {
        console.error(err)
      }
    })
  },

  uploadError ({ detail: { err: { errMsg } } }) {
    this.toast.showFailure(errMsg)
  },

  async uploadedImage ({ detail: { file, width, height } }) {
    if (!file) return false

    const photos = this.data.photos
    const { code } = await User.postFileInfo({type: 'image', file, width, height})

    if (code === 0) {
      this.uploadAudio.play()
      this.setData({ photos: photos.concat(file) })
    } else {
      this.toast.showFailure('上传失败 请重试')
    }

    global.needRefresh = true
  },

  async uploadRemoveImage ({ detail: { index } }) {
    const { photos } = this.data
    const head = photos.slice(0, index)
    const tail = photos.slice(index + 1)

    const { code } = await User.delFileInfo({type: 'image', file: photos[index]})
    if (code === 0) {
      this.removeAudio.play()
      this.setData({ photos: head.concat(tail) })
    } else {
      this.toast.showFailure('删除失败 请重试')
    }
  },

  /** 续费成功通知消息 */
  makeSubscribe () {
    wx.requestSubscribeMessage({
      tmplIds: ['kRLRF0v97t3jQjuwcylidr-mcluhVw7gXICMUq9dOzQ'],
      success (res) {console.log(res)},
      fail (err) { console.log(err) }
    })
  }
})


