import { User } from '../../manager/api'
import { getBtnAudioCtx, delay, copyText, getRelativeTime } from '../../common/utils'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
    docName: '',
    docId: '',
    shareUserId: '',
    avatar: '',
    nick: '',
    date: '-',
    receiving: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({menus: ['shareAppMessage', 'shareTimeline']})
    this.toast = this.selectComponent("#toast")
    this.clickAudio = getBtnAudioCtx('/images/audio/click.mp3')

    const { name, id, uid, avatar, nick, date, code } = options

    if (!name || !id || !uid || !code) {
      this.toast.showWarning('分享异常', '请联系分享者重新分享')

      return this.toHomePage()
    }

    this.setData({ theme: global.deviceInfo.theme, docName: name, shareCode: code, docId: id, shareUserId: uid, avatar, nick, date: getRelativeTime(date) })
  },
  async receiveFile () {
    const { docName, docId, shareUserId, shareCode } = this.data

    this.setData({ receiving: true })

    const { code, msg, data } = await User.receiveFile({ shareUserId, documentid: docId, code: shareCode })

    this.setData({ receiving: false })

    if (code !== 0) {
      return this.toast.showFailure('文件接收失败', msg)
    }

    this.toast.showSuccess('文件接收成功', '请等待数据传输到设备')
    this.toHomePage()
  },
  toHomePage () {
    delay(() => wx.switchTab({ url: '/pages/index/index' }), 3e3)
  }
})
