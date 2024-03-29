const sysInfo = wx.getSystemInfoSync()

const sysData = {}

sysData.deviceInfo = {
  ...sysInfo,
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
  modeConf: {
    // 货币单位 关联影响1、货币显示；2、收货地址微信读取
    exchangeUnit: '¥',
    // 显示汇率
    exchangeRate: 1,
    ossHost: "https://rmcloud.oss-cn-shanghai.aliyuncs.com",
    vipItems: [{ id: '61aa3363feb304175c9f5855', amount: 1 }, { id: '61aa33c8feb304175c9f5856', amount: 1 }],
  },
  isMaster: (app="zm") => {
    return global.BorysAppsMaster[app] ? global.BorysAppsMaster[app].includes(global.openid) : false
  }
})

