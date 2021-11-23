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
    },

    onLoad: function () {
        global.deviceInfo.windowWidth * 0.47

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

    loadImages: async function (page) {
        const { pageNum, images } = this.data
        const tarPage = page || pageNum
        
        wx.showNavigationBarLoading()
        this.setData({ isLoading: true })

        const { code, msg, data } = await User.fileList({ pageNum: tarPage, type: 'image' })
        
        if (code === 0) {
            const list = data.list || []
            const newData = { pageNum: tarPage + 1 }

            if (list.length < 10) {
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
        if (global.isMaster('tiger')) {
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
        console.log('end', this.data.end)
        !this.data.end && this.loadImages()
    },

    onShareAppMessage () {
        return {
            title: '欢迎使用' + global.baseTitle,
            imageUrl: global.shareImg
        }
    }
}) 

