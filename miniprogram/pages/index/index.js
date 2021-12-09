import { Device, User } from '../../manager/api'
import { getBtnAudioCtx, sleep, getRelativeTime, copyText } from '../../common/utils'

const formateDocItem = (list) => {
    return list.map((item, index) => ({
        ...item,
        Size: item.Size == 0 ? '大小' : (item.Size / 1024 / 1024 + 'MB'),
        LastModified: /0001/.test(item.LastModified) ? '时间' : getRelativeTime(item.LastModified),
        children: item.children ? formateDocItem(item.children) : undefined,
    }))
}

Page({
    data: {
        search: '',
        docList: [],
        docListStack: [],
        docPathStack: '',

        uploadProgress: -1,

        userInfo: null,

        showShareDrawBox: null,
        shareCodeMap: {},

        isLoading: false,
        refresh: false,
        pageNum: 1,
        end: false,

        theme: 'dark',
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
            fixedContentHeight: windowHeight - Math.ceil((0.30 + 0.09 + 0.04 + 0.02) * windowWidth) - navHeight,
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

    onFileUpload () {
        const that = this
        const { userInfo, uploadProgress } = that.data

        if (!userInfo || !userInfo.deviceid) {
            return that.toast.showWarning('未绑定Rm设备', '绑定设备之后才能上传文件')
        }

        if (uploadProgress > -1) {
            return wx.showModal({
                title: '是否取消？',
                content: '当前文件正在上传',
                success (res) {
                    if (res.confirm) {
                        this.abortUpload()
                    }
                }
            })
        }

        that.uploadAudio.play()

        wx.chooseMessageFile({
            count: 1,
            type: 'file',
            async success (res) {
                const [ tempFilePaths ] = res.tempFiles
                console.log('tempFilePaths', tempFilePaths)
                
                if (tempFilePaths.size / 1e6 > 200) {
                    return that.toast.showWarning('文件大小超限', '微信最大支持同步200MB的文件')
                }

                if (/\.(pdf|epub)$/.test(tempFilePaths.path) == false) {
                    return that.toast.showWarning('文件类型错误', '只支持上传 PDF 或 Epub 文件')
                }

                const ossSignData = await that.getOssSign(tempFilePaths)

                ossSignData && that.doUpload(tempFilePaths, ossSignData)
            },
            fail (error) {
                if (!/cancel/.test(error.errMsg)) {
                    that.toast.showFailure(error.errMsg || error.message)
                }
            }
        })
    },

    getFileCheck ({ path }) {
        wx.getFileInfo({
            filePath: path,
            success (res) {
                console.log(res)
            },
            fail (err) {
                console.log(err)
            }
        })
    },

    async getOssSign (fileInfo) {
        const { code, msg, data } = await User.getOssToken({name: fileInfo.name})
        
        if (code !== 0) {
            this.toast.showWarning('上传失败', msg)

            return false
        } else {
            return data
        }
    },

    async doUpload (file, signData) {
        const that = this

        const typeMatch = file.path.match(/\.(\S{3,10})$/i)
        const fileType = typeMatch ? typeMatch[0] : ''

        const tarFilePath = `rm/upload/${randomName()}${fileType}`

        that.setData({ uploadProgress: 0 })

        that.uploadTask = wx.uploadFile({
            url: global.modeConf.ossHost,
            filePath: file.path,
            name: 'file',
            formData: {
                key: tarFilePath,
                policy: signData.policy,
                OSSAccessKeyId: signData.OSSAccessKeyId,
                success_action_status: signData.success_action_status,
                signature: signData.signature
            },
            success ({errMsg}) {
                console.log('res', arguments[0])

                if ("uploadFile:ok" == errMsg) {
                    that.setData({ uploadProgress: -1 })
                    this.uploadSuccess(file, tarFilePath, signData.taskId)
                } else {
                    that.toast.showFailure(errMsg || '上传失败 请稍后重试!')

                    that.setData({ uploadProgress: -1 })
                }
            },
            fail ({errMsg}) {
                that.toast.showFailure(errMsg || '上传失败 请稍后重试!')

                that.setData({ uploadProgress: -1 })
            }
        })

        that.uploadTask.onProgressUpdate(res => {
            console.log('上传进度', res.progress)

            that.setData({ uploadProgress: res.progress })
        })
    },

    abortUpload () {
        this.uploadTask.abort()
    },

    async uploadSuccess (fileInfo, ossPath, taskId) {
        const { docPathStack } = this.data
        const { code, data, msg } = await User.upload({ 
            parent: docPathStack,
            filename: fileInfo.name,
            fileUrl: ossPath,
            taskId: taskId
        })

        if ( code !== 0 ) {
            return this.toast.showFailure('上传失败', msg)
        } else {
            return this.toast.showSuccess('上传成功 开始同步', '可以到任务管理查看同步任务进度')
        }
    },

    async onRefreshDoding () {
        await this.loadList(1)
        this.onRefreshRestore()    
    },
    onRefreshRestore () {
        this.setData({ refresh: false })
    },

    onEmptyClick () {
        const { userInfo, docListStack } = this.data

        if (docListStack.length) {
            return this.onFolderBack()
        }

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
                if (tapIndex === 0) {
                    that.clickAudio.play()

                    that.downloadDoc(item)
                } else if (tapIndex === 1) {
                    that.clickAudio.play()

                    that.shareDoc(item)
                } else if (tapIndex === 2) {
                    that.removeAudio.play()

                    that.toast.showFailure('无法删除', '出于安全考虑不提供删除功能 请到设备操作')
                }
            }
        })
    },

    showFolder ({ currentTarget: { dataset: { index } } }) {
        this.clickAudio.play()

        const { docList, docListStack, docPathStack } = this.data

        const item = docList[index]

        if (!item.children) return false

        docListStack.push(docList)

        const pathArr = docPathStack.split('/')
        pathArr.push(item.name)

        this.setData({ docList: item.children, docListStack, docPathStack: pathArr.join('/') })
    },

    onFolderBack () {
        this.clickAudio.play()
        
        const { docListStack, docPathStack } = this.data

        const docList = docListStack.pop()
        
        const pathArr = docPathStack.split('/')
        pathArr.pop()

        this.setData({ docList, docListStack, docPathStack: pathArr.join('/'), search: '' })
    },

    async downloadDoc (item) {
        this.toast.showLoading()

        const { code, data, msg } = await Device.download({ documentid: item.id, filename: item.name })

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
                path: `/pages/share/index?code=${showShareDrawBox.code}&name=${showShareDrawBox.item.name}&id=${showShareDrawBox.item.id}&uid=${userInfo.openid}&avatar=${userInfo.avatar}&nick=${userInfo.nick}&date=${Date.now()}`
            }
        } else {
            return {
                title: '欢迎使用' + global.baseTitle,
                imageUrl: global.shareImg,
            }
        }
    }
}) 

