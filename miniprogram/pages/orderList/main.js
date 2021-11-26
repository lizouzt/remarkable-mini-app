import { 
    moneyFormat, 
    getRelativeTime,
    copyText, 
} from "../../common/utils"
import { User } from "../../manager/api"

Page({
    /**
     * TODO::
     * 根据订单时间筛选待收获订单已[发货4天内]
     */
    data: {
        page_num: 1,
        last: '',       // $lt
        end: false,     // 已加载完列表
        
        orderList: [],
        orderStat: [],  // Tab状态数据
        
        // 静态数据
        OrderStateMap: ['待确认', '待发货', '交易成功', '交易关闭'],
        exchangeUnit: global.modeConf.exchangeUnit,
    },
    async onLoad () {
        this.toast = this.selectComponent("#toast")
        
        await global.doLogin()

        await this.fetchData()
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        this.data.end == false && this.fetchData()
    },
    copyText: copyText,
    async fetchData(page_num) {
        const { page_num: oldPageNum, orderList, last } = this.data;
        const pageNum = page_num || oldPageNum;
        
        wx.showNavigationBarLoading()

        const { code, msg, data: {list, page_size, page_num: resPageNum} = {} } = await User.queryOrderList({ 
            type: 0, 
            page_num: pageNum,
            last: pageNum == 1 ? '' : last,
        })

        if (code != 0) {
            return this.toast.showFailure(msg)
        }

        const newData = {page_num: resPageNum + 1}

        const formatedList = this.formatOrderList(list)
        
        if (pageNum == 1) {
            newData.orderList = formatedList;
        } else {
            newData.orderList = orderList.concat(formatedList);
        }

        if (list.length) {
            newData.last = list[list.length - 1].id;
        }

        if (newData.orderList.length > 0 && list.length < page_size) {
            newData.end = true;
        }

        this.setData(newData);

        wx.hideNavigationBarLoading()
    },
    /**
     * 整理订单列表数据用于显示
     * @param {array} list 
     */
    formatOrderList(list) {
        const lastRefundTime = Date.now() - 1000*60*60*24*4;

        return list.map(order => {
            order.org_create_time = order.create_time
            order.create_time = getRelativeTime(order.create_time);
            
            let amount = 0;
            order.goods_info.forEach(item => {
                item.s_price  = moneyFormat(item.price);
                amount += item.amount;
            });

            order.amount = amount;
            const stateRefundable = (order.state == 1) || ( order.state == 2 && +new Date(order.deliver_time) > lastRefundTime);
            order.refundable = stateRefundable && order.goods_info.findIndex(item => item.refunded != true) > -1;

            order.settleInfoForShow = this.getSettleInfoForShow(order.settle_info);
            
            return order;
        })
    },
    /**
     * 把结算数据中的金额数据整理为字符串
     * @param {object} info 
     */
    getSettleInfoForShow(info) {
        const infoForShow = {};
        for (let key in info) {
            if (info.hasOwnProperty(key)) {
                infoForShow[key] = moneyFormat(info[key])
            }
        }
        return infoForShow
    }
})

