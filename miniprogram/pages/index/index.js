import { User } from '../../manager/api'
import { getBtnAudioCtx } from '../../common/utils'

const transImageList = (list) => {
    return list.map((item, index) => {
        const ratio = item.width / (global.deviceInfo.windowWidth * 0.47)
        return {
            file: item.file, 
            height: item.height / ratio
        }
    })
}

Page({
    data: {
        images: [],

        isLoading: false,
        pageNum: 1,
        end: false,
        navHeight: 66,
        navBgShow: false,
    },

    onLoad: function () {
        this.HeaderScrollThreshold = global.deviceInfo.windowWidth * 0.4

        this.setData({ navHeight: global.deviceInfo.navHeight + 46 })

        this.removeAudio = getBtnAudioCtx('/images/audio/shake.mp3')
        this.toast = this.selectComponent("#toast")
        
        this.loadImages()
    },

    onShow () {
        if (global.needRefresh) {
            global.needRefresh = false
            this.loadImages(1)
        }
    },

    onPageScroll ({ scrollTop }) {
        if (scrollTop > 138) {
            !this.data.navBgShow && this.setData({ navBgShow: true })
        } else {
            this.data.navBgShow && this.setData({ navBgShow: false })
        }
    },

    loadImages: async function (page) {
        const { pageNum, images } = this.data
        const tarPage = page || pageNum
        
        wx.showNavigationBarLoading()
        this.setData({ isLoading: true })

        const { code, msg, data } = await User.fileList({ pageNum: tarPage, type: 'image' })
        
        if (code === 0) {
            const list = data.list || []
            const newData = { pageNum: tarPage + 1 }

            if (list.length < 5) {
                newData.end = true
            }

            if (tarPage === 1) {
                newData.images = transImageList(list)
            } else {
                newData.images = images.concat(transImageList(list))
            }

            this.setData(newData)
        } else {
            this.toast.showFailure('加载照片失败', msg)
        }

        wx.hideNavigationBarLoading()
        this.setData({ isLoading: false })
    },

    async del ({ currentTarget: { dataset: { src } } }) {
        if (global.isMaster('ins')) {
            const that = this

            const { code } = await User.delFileInfo({type: 'image', file: src})
            code === 0 && wx.cloud.deleteFile({ fileList: [src], success () { 
                that.toast.showSuccess('操作成功') 
                that.removeAudio.play()
            } })
        }
    },

    imagePreview ({ currentTarget: { dataset: { src } } }) {
        const { images } = this.data
        
        wx.previewImage({
            current: src,
            urls: images.map(item => item.file)
        })
    },

    onReachBottom () {
        !this.data.end && this.loadImages()
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

    onShareAppMessage () {
        return {
            title: '欢迎使用' + global.baseTitle,
            imageUrl: global.shareImg
        }
    }
}) 

