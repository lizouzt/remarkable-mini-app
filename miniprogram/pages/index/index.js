import { Device } from '../../manager/api'
import { getBtnAudioCtx, sleep, getRelativeTime, copyText } from '../../common/utils'

const formateDocItem = (list) => {
    return list.map((item, index) => ({
        ...item,
        Size: item.Size == 0 ? '大小' : (item.Size / 1024 / 1024 + 'MB'),
        LastModified: item.LastModified == '0001-01-01T00:00:00Z' ? '时间' : getRelativeTime(item.LastModified)
    }))
}

Page({
    data: {
        search: '',
        docList: [],

        userInfo: null,

        showShareDrawBox: null,
        shareCodeMap: {},

        isLoading: false,
        refresh: false,
        pageNum: 1,
        end: false,

        theme: 'light',
        navHeight: 66,
        navBgShow: false,
        fixedContentHeight: 360,
    },
    copyText: copyText,
    async onLoad () {
        this.toast = this.selectComponent("#toast")

        const { navHeight, windowHeight, windowWidth, theme } = global.deviceInfo

        this.setData({ 
            navHeight: navHeight, 
            fixedContentHeight: windowHeight - Math.ceil((0.29 + 0.09 + 0.04 + 0.02) * windowWidth) - navHeight,
            theme: theme
        })

        this.removeAudio = getBtnAudioCtx('/images/audio/shake.mp3')
        this.uploadAudio = getBtnAudioCtx('/images/audio/result.mp3')
        this.clickAudio = getBtnAudioCtx('/images/audio/click.mp3')

        await global.doLogin()

        this.loadList()
    },

    async onShow () {
        const curUserInfo = this.data.userInfo

        this.setData({ userInfo: global.userInfo })

        if ((!curUserInfo && global.userInfo) || this.hideTime + 10 * 60 * 1e3 < Date.now()) {
            this.hideTime = Date.now()
            this.loadList(1)
        }
    },

    onHide () {
        this.hideTime = Date.now()
    },

    onScrollBottom () {
        !this.data.end && this.loadList()
    },

    onPageScroll ({ scrollTop }) {
        if (scrollTop > 138) {
            !this.data.navBgShow && this.setData({ navBgShow: true })
        } else {
            this.data.navBgShow && this.setData({ navBgShow: false })
        }
    },

    onRefreshPulling () {
        this.setData({ refresh: true })
    },
    
    onSearch ({ detail }) {
        const { docList, orgDocList } = this.data

        const list = orgDocList || docList

        const filterList = list.filter(item => item.name.indexOf(detail) > -1)

        this.setData({ 
            search: detail,
            orgDocList: [...list],
            docList: filterList
        })
    },
    onClear () {
        this.setData({ search: '', docList: this.data.orgDocList, orgDocList: null })
    },

    async onRefreshDoding () {
        await this.loadList(1)
        this.onRefreshRestore()    
    },
    onRefreshRestore () {
        this.setData({ refresh: false })
    },

    onEmptyClick () {
        const { userInfo } = this.data

        if (!userInfo || !userInfo.deviceid) {
            wx.switchTab({ url: '/pages/mine/index' })
        } else {
            this.toast.showSuccess('设备同步中', '设备数据同步需要时间 请等等')
        }
    },

    async loadList (page) {
        const { pageNum, docList, userInfo, search } = this.data

        if (search) {
            return this.toast.showWarning('请先清除搜索', '目前搜索功能只针对已加载数据')
        }

        if (!userInfo || !userInfo.deviceid) {
            console.log('未登录 或 未绑定设备')
            return false
        }

        const tarPage = page || pageNum
        
        wx.showNavigationBarLoading()
        this.setData({ isLoading: true })

        const { code, msg, data } = await Device.queryList({ page_num: tarPage, query: '' })
        await sleep(1.5e3)

        if (code === 0) {
            const list = data.doclist || []
            const newData = { pageNum: tarPage + 1 }

            if (list.length < 5) {
                newData.end = true
            }
            
            if (tarPage === 1) {
                newData.docList = formateDocItem(list)
            } else {
                newData.docList = docList.concat(formateDocItem(list))
            }

            console.log('newData.docList', newData.docList)
            this.setData(newData)
        } else {
            this.toast.showFailure('加载文件列表失败', msg)
        }

        wx.hideNavigationBarLoading()
        this.setData({ isLoading: false })
    },

    showFileOperatePicker ({ currentTarget: { dataset: { index } } }) {
        this.clickAudio.play()

        const item = this.data.docList[index]

        const that = this

        item && wx.showActionSheet({
            alertText: `文件《${item.name}》`,
            itemList: ['下载', '分享', '删除'],
            success ({ tapIndex }) {
                that.clickAudio.play()

                if (tapIndex === 0) {
                    that.downloadDoc(item)
                } else if (tapIndex === 1) {
                    that.shareDoc(item)
                } else if (tapIndex === 2) {
                    that.toast.showFailure('无法删除', '出于安全考虑不提供删除功能 请到设备操作')
                }
            }
        })
    },

    async downloadDoc (item) {
        this.toast.showLoading()

        const { code, data, msg } = await Device.download({ documentid: item.id })

        if (code == 0) {
            this.toast.showSuccess('成功创建任务', '请到任务列表查看下载进度')
        } else {
            return this.toast.showFailure(msg)
        }
    },

    async shareDoc (item) {
        const { shareCodeMap } = this.data

        if (shareCodeMap[item.id]) {
            return this.setData({ showShareDrawBox: { code: shareCodeMap[item.id], item } })
        }


        this.toast.showLoading()
        const { code, data, msg } = await Device.getShareCode({ documentid: item.id })

        if (code == 0) {
            this.toast.hideLoading()

            shareCodeMap[item.id] = code

            this.setData({ showShareDrawBox: { code: data.code, item }, shareCodeMap })
        } else {
            return this.toast.showFailure(msg)
        }
    },

    hideShareBox () {
        this.clickAudio.play()

        this.setData({ showShareDrawBox: null })
    },

    async del ({ currentTarget: { dataset: { src } } }) {
        const that = this

        const { code, msg } = await Device.delFile({fileId: src})
        
        if (code !== 0) {
            return this.toast.showFailure(msg)
        }

        that.toast.showSuccess('操作成功') 
        that.removeAudio.play()
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

    onShareAppMessage ({ from, target = {} }) {
        const { userInfo, showShareDrawBox } = this.data

        if (from === 'button' && showShareDrawBox.item) {
            this.clickAudio.play()

            return {
                title: `${userInfo.nick}给你分享了《${showShareDrawBox.item.name}》`,
                path: `/pages/share/index?name=${showShareDrawBox.item.name}&id=${showShareDrawBox.item.id}&uid=${userInfo.openid}`
            }
        } else {
            return {
                title: '欢迎使用' + global.baseTitle,
                imageUrl: global.shareImg,
            }
        }
    }
}) 

