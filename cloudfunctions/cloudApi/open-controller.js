const BaseController = require('./base-controller.js')

class OpenController extends BaseController {
  constructor() {
    super()
  }
  async requestSubscribeMessage(event, context) {
    // 此处为模板 ID，开发者需要到小程序管理后台 - 订阅消息 - 公共模板库中添加模板，
    // 然后在我的模板中找到对应模板的 ID，填入此处
    return '请到管理后台申请模板 ID 然后在此替换' // 如 'N_J6F05_bjhqd6zh2h1LHJ9TAv9IpkCiAJEpSw0PrmQ'
  }

  async sendSubscribeMessage(event) {
    const { OPENID } = cloud.getWXContext()

    const { templateId } = event

    const sendResult = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      templateId,
      miniprogram_state: 'developer',
      page: 'pages/openapi/openapi',
      // 此处字段应修改为所申请模板所要求的字段
      data: {
        thing1: {
          value: '咖啡',
        },
        time3: {
          value: '2020-01-01 00:00',
        },
      }
    })

    return sendResult
  }

  async msgSecureCheck(event, context) {
      try {
          return await cloud.openapi.security.msgSecCheck({
              "scene": 1,
              "version": 2,
              "openid": event.openid,
              "content": event.content,
          })
      } catch (err) {
          return err
      }
  }
  async imgSecureCheck(event, context) {
    let result = { code: 0 }

    try {
      const res = await cloud.downloadFile({
          fileID: event.fileID,
      })

      const checkRet = await cloud.openapi.security.imgSecCheck({media: {
          contentType: 'image/jpg',
          value: res.fileContent,
      }})
      
      if (checkRet.errCode != 0) {
        return { code: 1, msg: checkRet.errCode }
      } else {
        return this.success()
      }
    } catch (err) {
      return { code: 1, msg: err.message }
    }
  }

  async getUnlimitedWXACode(event) {
    return await cloud.openapi.wxacode.getUnlimited({
      page: event.page || '',
      scene: event.scene || '',
      width: event.width || 280,
      isHyaline: event.isHyaline == undefined ? true : event.isHyaline
    })

  }

  async getWXACode(event) {
    // 此处将获取永久有效的小程序码，并将其保存在云文件存储中，最后返回云文件 ID 给前端使用

    const wxacodeResult = await cloud.openapi.wxacode.get({
      path: 'pages/openapi/openapi',
    })

    const fileExtensionMatches = wxacodeResult.contentType.match(/\/([^/]+)/)
    const fileExtension = (fileExtensionMatches && fileExtensionMatches[1]) || 'jpg'

    const uploadResult = await cloud.uploadFile({
      // 云文件路径，此处为演示采用一个固定名称
      cloudPath: `wxacode_default_openapi_page.${fileExtension}`,
      // 要上传的文件内容可直接传入图片 Buffer
      fileContent: wxacodeResult.buffer,
    })

    if (!uploadResult.fileID) {
      throw new Error(`upload failed with empty fileID and storage server status code ${uploadResult.statusCode}`)
    }

    return uploadResult.fileID
  }

  async getOpenData(event) {
    return cloud.getOpenData({
      list: event.openData.list,
    })
  }
}

module.exports = OpenController
