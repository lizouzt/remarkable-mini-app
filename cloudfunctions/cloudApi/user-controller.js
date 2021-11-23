const BaseController = require('./base-controller.js')

class UserController extends BaseController {
    constructor() {
        super()
    }
    async getUserId(event, context) {
        // 可执行其他自定义逻辑
        // console.log 的内容可以在云开发云函数调用日志查看

        // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
        const wxContext = cloud.getWXContext()

        return {
            event,
            openid: wxContext.OPENID,
            appid: wxContext.APPID,
            unionid: wxContext.UNIONID,
            env: wxContext.ENV,
        }
    }
}
module.exports = UserController