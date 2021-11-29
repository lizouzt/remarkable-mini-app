import BaseService from "./base-service"

export default class DeviceService extends BaseService {
    constructor() {
        super()
    }
    async getUserId() {
        // openId传入后端很容易被偷数据
        // 前端要用云API 或 无登录态页面 的时候自己从云API获取
        // 后端交互的时候用微信登录态获取
        return await this.callFunction('user', 'getUserId')
    }
    async getCode(options) {
        return { code: 0, msg: 'ok', data: { code: '1231kh23kjh1k23h' } }
        return await this.request({
            url: '/ui/api/newcode',
            method: 'post',
            data: options
        }, true)
    }
    async ridOfCode(options) {
        return await this.request({
            url: '/ui/api/delete',
            method: 'post',
            data: options
        }, true)
    }
}