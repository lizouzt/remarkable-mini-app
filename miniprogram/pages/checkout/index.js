import { moneyFormat, resizeImg } from "../../common/utils"
import { User } from "../../manager/api"

Page({
    /**
     * 页面的初始数据
     */
    data: {
        needRefresh: 0,
        buyLoading: false,

        contractAgree: false,

        /** 服务器返回数据 */
        showPhoneAuth: false,
        activeIndex: 0,
        couponList: [],
        goodsInfo: [],
        userInfo: null,
        settleInfo: null,
        pre_order_id: null,

        theme: 'light',

        items: [],
        exchangeUnit: global.modeConf.exchangeUnit,
        skRegion: {
            init: true
        },
    },
    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad (options) {
        // wx.hideShareMenu({menus: ['shareAppMessage', 'shareTimeline']})
        
        this.setData({ items: global.vipItems, theme: global.deviceInfo.theme })

        this.toast = this.selectComponent("#toast")
        const loginSucceed = await global.doLogin()

        loginSucceed && this.fetchOrderInitData()
    },

    onShow() {
        if (this.data.needRefresh > 0 && Date.now() - this.data.needRefresh > 1e3 * 120) {
            // 停留时间大于两分钟刷新订单商品数据
            this.data.buyItem && this.fetchOrderInitData()
        }
    },

    onHide() {
        this.setData({ needRefresh: Date.now() })
    },

    onError(error) {
        this.toast.showFailure(error.message)
    },

    onChangeItem({ currentTarget: { dataset: { index } } }) {
        this.setData({ activeIndex: index })
    },

    onUpdateAgreeCoupon({ detail: { current } }) {
        this.setData({ contractAgree: current })
    },

    async getPhoneNumber({ detail }) {
        const { errMsg } = detail;

        if (errMsg !== 'getPhoneNumber:ok') {
            console.log('errMsg', errMsg)
            this.toast.showFailure(errMsg.replace(/[:\w\s]+/, '') || '授权绑定手机号失败')
            return false
        }

        const { userInfo, address } = this.data;

        const { code, msg, data } = await User.bindPhoneNumber(detail)

        if (code != 0) {
            return this.toast.showFailure(msg || '绑定手机号失败')
        } else {
            const { phone } = data
            this.setData({ 
                showPhoneAuth: false, 
                userInfo: {...userInfo, phone}, 
                address: {...address, phone} 
            })
        }
    },
    /**
     * 结算详情
     */
    async fetchOrderInitData() {
        wx.showNavigationBarLoading()
        const { code, msg, data } = await User.initOrder({
            goods_info: this.data.items,
            sm_id: '',
            smt: 0,
        })
        wx.hideNavigationBarLoading()
        this.setData({ 'skRegion.init': false })

        if (code == 0) {
            this.calculateOrderData(data)
        } else {
            this.toast.showFailure(msg || '结算数据获取失败')
        }
    },
    calculateOrderData({ goods_info = [], user_info = {}, settle_info = {}, sale_mode_type = 0, promotion }) {
        const goodsInfo = goods_info.map((item, index) => {
            return {
                ...item,
                sprice: moneyFormat(item.amount * item.price, true)
            }
        })

        this.setData({
            goodsInfo: goodsInfo,
            userInfo: user_info,
            settleInfo: settle_info,
            showPhoneAuth: !user_info.phone,
        });
    },
    /**
     * 发起支付请求
     */
    async payRequest({ detail: { formId } }) {
        const {
            items,
            userInfo,
            activeIndex,
            contractAgree,
        } = this.data

        if (!contractAgree) {
            return this.toast.showWarning('需同意服务协议')
        }

        this.setData({ buyLoading: true });

        const requestData = {
            goods_info: [items[activeIndex]],
            smt: 0,
            sm_id: '',
            use_score: 0,
            use_coupon: '',
            use_wallet: false,
            address_info: {
                phone: '-',
                area: '交易-虚拟-商品',
                detail: '不发货',
                name: '-'
            }
        }

        const { code, msg, data } = await User.pay(requestData)

        this.setData({ buyLoading: false })

        if (code == 0) {
            const { payParams, pre_order_id } = data

            this.setData({ pre_order_id })

            if (payParams) {
                /** 发起微信支付 */
                this.requestPayOrder(payParams)
            } else {
                this.turnToOrderListWhileOrderCreateSucceed()
            }
        } else {
            this.toast.showFailure(msg || '结算失败')
        }
    },

    requestPayOrder(payParams) {
        wx.requestPayment({
            ...payParams,
            success: (res) => {
                this.makeSubscribe()
                this.createRequest()
            },
            fail: function ({ err_code, err_desc, errMsg }) {
                if (errMsg !== 'requestPayment:fail cancel') {
                    this.toast.showFailure(err_desc || errMsg)
                }
            }
        })
    },
    /**
     * 支付成功通知服务端
     * 订单初始状态: 已支付待确认
     */
    async createRequest() {
        const { code, data } = await User.clientPayNotify({ pre_order_id: this.data.pre_order_id })

        if (code == 0) {
            this.turnToOrderListWhileOrderCreateSucceed()
        } else {
            this.toast.showSuccess('订单处理中 请稍后查看')

            setTimeout(() => {
                wx.switchTab({ url: '/pages/index/index' })
            }, 2e3)
        }
    },
    turnToOrderListWhileOrderCreateSucceed() {
        this.toast.showSuccess('支付成功')
        
        // 跳转订单列表页
        setTimeout(() => {
            wx.redirectTo({ url: '/pages/orderList/main' })
        }, time)
    },
    /** 续费成功通知消息 */
    makeSubscribe () {
        const tmplId = 'R6hV31kmkN5RPt7arEkXu_RokyF73Vau6K59MXTzGOY'

        wx.requestSubscribeMessage({
            tmplIds: [tmplId],
            success (res) {
                if (res.tmplId == 'accept') {
                    /**
                     * TODO::通知服务器 用户同意订阅
                     */
                }
            },
            fail (err) { console.log(err) }
        })
    }
})

