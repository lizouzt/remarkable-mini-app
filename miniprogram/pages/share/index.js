import { getBtnAudioCtx, sleep, copyText } from '../../common/utils'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({menus: ['shareAppMessage', 'shareTimeline']})
    this.toast = this.selectComponent("#toast")

    this.setData({ theme: global.deviceInfo.theme })
    this.clickAudio = getBtnAudioCtx('/images/audio/click.mp3')
  },
})