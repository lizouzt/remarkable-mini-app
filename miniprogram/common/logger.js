const translateMsg = (type, info) => {
  if (info.constructor === String) {
    return {
      type,
      title: info, 
    }
  } else if (info.constructor === Object) {
    const title = info.title || type.toString()
    delete info.title

    return {
      title,
      type,
      data: info, 
    } 
  } else {
    console.error('error log data formate.', type, info)
  }
}

/**
 * 插件没有找到可以使用的wx.API
 * 日志格式 { type, title, data }
 */
module.exports = {
  info(info) {
    /**
     * 缓存后提交
     */
    const logData = translateMsg('info', info)

    global.IS_DEV && console.log(logData)
  },
  warn() {
    /**
     * 缓存后提交
     * const logData = translateMsg('warn', info)
     */
  },
  error() {
    /**
     * 即时提交
     * const logData = translateMsg('error', info)
     */
  }
}