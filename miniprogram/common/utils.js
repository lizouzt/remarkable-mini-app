import timeFormater from './timeFormater'
/**
 * 空对象判断
 */
export const isEmpty = (obj) => {
  if (obj === undefined || obj === null || obj === '') {
    return true
  } else if (obj.constructor === Array) {
    return obj.length === 0
  } else if (obj.constructor === Object) {
    return JSON.stringify(obj) === '{}'
  }
}

/**
 * 按钮音效设置
 */
export const getBtnAudioCtx = (audioPath) => {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = false
    innerAudioContext.loop = false
    wx.setInnerAudioOption({ 
        // ios在静音状态下能够正常播放音效
        obeyMuteSwitch: true,
        fail (err) { console.log(err) }
    })

    innerAudioContext.src = audioPath
    
    return innerAudioContext
}

export const encodeUri = (obj) => {
  let params = ''

  for (let key in obj) {
    if (obj[key] !== undefined) {
      params += `&${key}=${obj[key]}`
    }
  }

  if (params != '') {
    params = params.slice(1)
  }

  return params
}

export const sleep = (timer=1e3) => new Promise((resolve) => setTimeout(resolve, timer))
export const delay = (resolve, timer=1e3) => setTimeout(resolve, timer)

// m_lfit: 等比缩放，限制在指定w与h的矩形内的最大图片。
// m_mfit: 等比缩放，延伸出指定w与h的矩形框外的最小图片。
// m_fill: 固定宽高，将延伸出指定w与h的矩形框外的最小图片进行居中裁剪。
// m_pad: 固定宽高，缩略填充。
// m_fixed: 固定宽高，强制缩略。
// png图片不能加这个处理 加完更大

// resizeImg(640, 150, 'crop')
// resizeImg(640)
// webp/quality,90 图片细节压缩太厉害了
export const resizeImg = (w = 500, h, type = "m_lfit", position='center', webp = true) => {
    if (type == 'crop') {
        return `?x-oss-process=image/crop,g_${position},w_${w},${ h ? ('h_' + h + ',') : ''}${webp ? 'webp' : ''}/quality,90`
    } else {
        return `?x-oss-process=image/resize,${type},w_${w},${ h ? ('h_' + h + ',') : ''}${webp ? 'webp' : ''}/quality,90`
    }
}

/**
 * @param {Number} timeStamp 传入的时间戳
 * @param {Number} currentTime 当前时间时间戳
 * @returns {Boolean} 传入的时间戳是否早于当前时间戳
 */
const isEarly = (timeStamp, currentTime) => {
    return timeStamp < currentTime;
}

/**
 * @param {String|Number} timeStamp 时间戳
 * @returns {String} 相对时间字符串 支持年
 */
/**
 * @param {String|Number} timeStamp 时间戳
 * @returns {String} 相对时间字符串 支持年
 */
export const getRelativeTime = (timeStamp, needTail=true) => {
    if (!timeStamp) {
        return '';
    }

    if (timeStamp.constructor === String) {
        if (/\D/.test(timeStamp)) {
            timeStamp = new Date(timeStamp).getTime();
        } else {
            // 传入的时间戳可以是数值或字符串类型，这里统一转为数值类型
            timeStamp = Number(timeStamp);
        }
    }

    // 毫秒格式则转为秒格式
    timeStamp = parseInt((timeStamp /= 1000));
    // 获取当前时间时间戳
    const currentTime = Math.floor(Date.parse(new Date()) / 1000);
    // 判断传入时间戳是否早于当前时间戳
    const IS_EARLY = isEarly(timeStamp, currentTime);
    // 获取两个时间戳差值
    let diff = Math.floor(currentTime - timeStamp);
    // 如果IS_EARLY为false则差值取反
    if (!IS_EARLY) diff = -diff;
    let resStr = '';
    const dirStr = needTail ? (IS_EARLY ? '前' : '后') : '';
    // 少于等于59秒
    if (diff <= 59) resStr = diff + '秒' + dirStr;
    // 多于59秒，少于等于59分钟59秒
    else if (diff > 59 && diff <= 3599) resStr = Math.floor(diff / 60) + '分钟' + dirStr;
    // 多于59分钟59秒，少于等于23小时59分钟59秒
    else if (diff > 3599 && diff <= 86399) resStr = Math.floor(diff / 3600) + '小时' + dirStr;
    // 多于23小时59分钟59秒，少于等于29天59分钟59秒
    else if (diff > 86399 && diff <= 2623859) resStr = Math.floor(diff / 86400) + '天' + dirStr;
    // 多于29天59分钟59秒，少于364天23小时59分钟59秒，且传入的时间戳早于当前
    else if (diff > 2623859 && diff <= 31567859 && IS_EARLY) resStr = timeFormater(timeStamp * 1000, 'M月d日 H:m');
    else resStr = timeFormater(timeStamp * 1000, 'yy年M月d日 H点');

    return resStr;
}