import { 
    moneyFormat, 
    getRelativeTime,
    copyText, 
} from "../../common/utils"
import { User } from "../../manager/api"

const TEMP_FILE_MAP_CACHE_KEY = '_oss_temp_file_map_'

Page({
    /**
     * TODO::
     * 根据订单时间筛选待收获订单已[发货4天内]
     */
    data: {
        page_num: 1,
        last: '',       // $lt
        end: false,     // 已加载完列表
        
        taskList: [],
        taskFileTempPathMap: {},
        
        // 静态数据
        TaskStateMap: ['排队中', '进行中', '已完成', '已失败'],
        TaskTypeMap: ['上传', '下载'],
    },
    async onLoad () {
        this.toast = this.selectComponent("#toast")

        const cacheData = wx.getStorageSync(TEMP_FILE_MAP_CACHE_KEY)
        cacheData && this.setData({ taskFileTempPathMap: cacheData })

        await global.doLogin()

        await this.fetchData()
    },
    onUnload () {
        wx.setStorageSync(TEMP_FILE_MAP_CACHE_KEY, this.data.taskFileTempPathMap)
    },
    openFile(event) {
        const { target: { dataset: { url, taskId } } } = event

        if (!url) {
            return this.toast.showFailure('文件下载错误', '无下载链接 请确认任务状态')
        }

        const that = this

        const { taskFileTempPathMap } = that.data

        if (taskFileTempPathMap[taskId]) {
            wx.openDocument({
                filePath: taskFileTempPathMap[taskId],
                fileType: 'pdf',
                showMenu: true,
                success: function (res) {
                    console.log('打开文档成功')
                },
                fail: function () {
                    taskFileTempPathMap[taskId] = false

                    that.setData({ taskFileTempPathMap })
                    // 走下载流程
                    that.openFile(event)
                }
            })
            return true
        }

        const downloadTask = wx.downloadFile({
            url: url,
            success (res) {
                taskFileTempPathMap[taskId] = res.tempFilePath

                that.setData({ taskFileTempPathMap })

                wx.openDocument({
                    filePath: res.tempFilePath,
                    fileType: 'pdf',
                    showMenu: true,
                    success: function (res) {
                        console.log('打开文档成功')
                    },
                    fail: function (err) {
                        that.toast.showFailure('文件打开失败', err.errMsg || err.message)
                    }
                })
            },
            fail (err) {
                that.toast.showFailure('文件下载失败', err.errMsg || err.message)
            }
        })

        downloadTask.onProgressUpdate((res) => {
            that.setData({ downloadProgress: res.progress })
            that.toast.showLoading('文件下载中', res.progress + '%')
        })
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        this.data.end == false && this.fetchData()
    },
    copyText: copyText,
    async fetchData(page_num) {
        const { page_num: oldPageNum, taskList, last } = this.data;
        const pageNum = page_num || oldPageNum;
        
        wx.showNavigationBarLoading()

        const { code, msg, data: {list, page_size, page_num: resPageNum} = {} } = await User.queryTaskList({ page_num: pageNum })

        if (code != 0) {
            return this.toast.showFailure(msg)
        }

        const newData = {page_num: resPageNum + 1}

        const formatedList = this.formateTaskList(list)
        
        if (pageNum == 1) {
            newData.taskList = formatedList;
        } else {
            newData.taskList = taskList.concat(formatedList);
        }

        if (list.length) {
            newData.last = list[list.length - 1].id;
        }

        if (newData.taskList.length > 0 && list.length < page_size) {
            newData.end = true;
        }

        this.setData(newData);

        wx.hideNavigationBarLoading()
    },
    /**
     * 整理订单列表数据用于显示
     * @param {array} list 
     */
    formateTaskList(list) {
        const lastRefundTime = Date.now() - 1000*60*60*24*4;

        return list.map(item => {
            item.org_create_time = item.create_time
            item.create_time = getRelativeTime(item.create_time);
            
            return item;
        })
    },
})

