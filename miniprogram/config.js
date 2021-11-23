const sysInfo = wx.getSystemInfoSync()

const sysData = {}

sysData.deviceInfo = {
  /* 普通手机 20 + 46 */
  navHeight: sysInfo.statusBarHeight + 46,
  /* 普通手机 49 */
  messageBarTopOffset: sysInfo.statusBarHeight * 2 + 49,
  statusBarHeight: sysInfo.statusBarHeight,
  isQiYe: sysInfo.environment === "wxwork"
}

sysData.deviceInfo.windowWidth = sysInfo.windowWidth
sysData.deviceInfo.windowHeight = sysInfo.windowHeight
sysData.deviceInfo.pixelRatio = sysInfo.pixelRatio

sysData.deviceInfo.isQiYe = sysInfo.environment === "wxwork"


const IS_DEV = sysInfo.platform === 'devtools'
const conf = (false && IS_DEV) ? require('./config/local') : require('./config/prod')

export default Object.assign(sysData, {
  IS_DEV,
  ...conf,
  isMaster: (app="zm") => {
    return global.BorysAppsMaster[app] ? global.BorysAppsMaster[app].includes(global.openid) : false
  }
})

