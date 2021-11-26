import { User } from '../../manager/api'
import { getBtnAudioCtx, sleep, copyText } from '../../common/utils'

Page({
  data: {
    photos: [],
    canUseGetUserProfile: !!wx.getUserProfile,
    skRegion: {
      userInfo: false,
    },

    loginPosting: false,
    userInfo: null,//{ deviceid: "123123123ashdask", vip_end_date: "2021/11/23 下午7:42:43" },
  },
  copyText: copyText,
  async onLoad (options) {
    // wx.hideShareMenu({menus: ['shareAppMessage', 'shareTimeline']})
    this.toast = this.selectComponent("#toast")

    await global.doLogin()
    this.setData({ userInfo: global.userInfo })

    this.uploadAudio = getBtnAudioCtx('/images/audio/result.mp3')
    this.removeAudio = getBtnAudioCtx('/images/audio/shake.mp3')
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

  onSyncSwitch() {
    this.toast.showWarning('默认不可关闭', '可以联系客服获得支持')
  },

   /** 弹窗选择续费标准 */
  /** 跳转结算支付页 */
  reNewVip() {
    console.log('reNewVip')
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


