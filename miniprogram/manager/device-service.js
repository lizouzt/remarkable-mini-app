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
        return await this.request({
            url: '/api/newcode',
            method: 'post',
            data: options
        }, true)
    }
    async ridOfCode(options) {
        return await this.request({
            url: '/api/delete',
            method: 'post',
            data: options
        }, true)
    }
    async queryList(options) {
        // return options.page_num == 1 ? { code: 0, data: { doclist: [{"id":"7dd94560-340c-4c00-803e-fac38afcb5d9","name":"Folder","children":[{"id":"006a45e9-d816-40f0-abee-0f9544ce36d5","name":"Folder 3","children":[{"id":"0427f1c3-94da-4d16-80f8-0cb1dd1c9a9e","name":"Folder 4","children":[{"id":"e90ffb6e-c777-49bd-b3e6-ea9296afcead","name":"Notebook 2","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0}],"LastModified":"0001-01-01T00:00:00Z"}],"LastModified":"0001-01-01T00:00:00Z"},{"id":"0c87f016-516e-454d-85e5-607a1cdd6c54","name":"Folder 5","children":[{"id":"57c32902-23ff-4d9a-842e-97d213bad518","name":"Notebook","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"0b540be2-7c83-43a6-84f0-900c5de5320e","name":"笨办法学 Python （第三版）","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0}],"LastModified":"0001-01-01T00:00:00Z"}],"LastModified":"0001-01-01T00:00:00Z"},{"id":"a5bd64d9-c6f9-427a-ac7d-2eeb50b409c8","name":"Folder 2","children":[],"LastModified":"0001-01-01T00:00:00Z"},{"id":"10656e85-5505-4ec1-b04c-704d142f54ff","name":"Driscoll","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"ea4922aa-fc4f-4896-b0d5-6709777aa2c8","name":"Notebook 18","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"c6f919c3-78d4-45b1-a905-ee61152e7040","name":"Quick sheets","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"da6d6953-4d08-49fc-9903-db4fd1804f47","name":"科学史  及其与哲学和宗教的关系  下册_12803107","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"u123y8716238asyd","name":"咖看点趣味就打卡机","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"7777","name":"阿手机壳电话卡和深刻的","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"8798978978","name":"就啊好帅的阿斯顿","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"81237817263","name":"阿精神病对不起我","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"552525252","name":"iiii哦撒娇 阿贾克斯队","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0},{"id":"38383838","name":"ooo 【一天会看到空空的🐱","type":"DocumentType","LastModified":"0001-01-01T00:00:00Z","Size":0}] } } : { code: 0, data: { doclist: [] } }

        return await this.request({
            url: '/api/documents',
            method: 'POST',
            data: options
        })
    }
    async download(options) {
        return await this.request({
            url: '/api/download',
            method: 'POST',
            data: options
        })
    }
    async getShareCode(options) {
        // return { code: 0, data: { code: '628723' } }
        return await this.request({
            url: '/api/sharecode',
            data: options
        })
    }
}