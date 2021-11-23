// 云函数入口文件
const cloud = require('wx-server-sdk')
const User = require('./user-controller.js')
const Open = require('./open-controller.js')

const api = {
  user: new User(),
  open: new Open(),
}

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

global.db = cloud.database({
  throwOnNotFound: false,
  autoRecommend: true
})

global.cloud = cloud
global.isInit = false

// 云函数入口函数
exports.main = async (event, context) => {

  const {
    action,
    controller,
    data
  } = event
  
  if (!isInit) {
    try {
      await db.createCollection('users').catch(() => null)
    } catch (error) {
      console.log(error)
    } finally {
      isInit = true
    }
  }

  const ctx = cloud.getWXContext()

  return ctx ? await api[controller][action](data, ctx) : (new Error('cloud.getWXContext 失败'))
}

