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
            url: '/ui/api/login',
            method: 'post',
            data: {...options, __openid__: global.openid}
        }, true)
    }
    async getconf(options) {
        return await this.request({
            url: '/xy/api/getconf',
            method: 'get',
            data: options
        }, true)
    }
    async postFile(options) {
        return await this.request({
            url: '/xy/api/tiger/postfile',
            method: 'post',
            data: {...options, __openid__: global.openid}
        }, true)
    }
    async fileList(options) {
        return await this.request({
            url: '/xy/api/tiger/files',
            method: 'post',
            data: options
        }, true)
    }
}