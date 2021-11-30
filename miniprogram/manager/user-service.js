import BaseService from "./base-service"

export default class UserService extends BaseService {
    constructor() {
        super()
    }
    async getUserId() {
        // openId传入后端很容易被偷数据
        // 前端要用云API 或 无登录态页面 的时候自己从云API获取
        // 后端交互的时候用微信登录态获取
        return await this.callFunction('user', 'getUserId')
    }
    async login(options) {
        return await this.request({
            url: '/api/wxapp/user/login',
            method: 'post',
            data: options
        }, true)
    }
    async bindPhoneNumber(options) {
        return await this.request({
            url: '/api/wxapp/user/phone',
            method: 'post',
            data: options
        }, true)
    }
    async initOrder(options) {
        return await this.request({
            url: '/api/order/checkout/init',
            method: 'post',
            data: options
        }, true)
    }
    async updateSettle(options) {
        return await this.request({
            url: '/api/order/checkout/update',
            method: 'POST',
            data: options
        }, true)
    }
    async pay(options) {
        return await this.request({
            url: '/api/order/checkout/pay',
            method: 'post',
            data: options
        }, true)
    }
    async clientPayNotify(options) {
        return await this.request({
            url: '/api/order/checkout/create',
            method: 'post',
            data: options
        }, true)
    }
    async queryOrderList(options) {
        return await this.request({
            url: '/api/order/list',
            method: 'POST',
            data: options
        })
    }
    async queryTask(options) {
        return await this.request({
            url: '/api/task/query',
            method: 'POST',
            data: options
        })
    }
}