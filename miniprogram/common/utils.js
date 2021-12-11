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

export const copyText = ({ currentTarget: { dataset } }) => {
    wx.setClipboardData({
        data: dataset['text'],
        success: function(res) {
            wx.showToast({
                title: '复制成功',
                icon: 'none'
            });
        }
    });
}

export const randomName = () => {
  return Date.now() + Math.floor(Math.random() * 1000)
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
        fail(err) { console.log(err) }
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

export const sleep = (timer = 1e3) => new Promise((resolve) => setTimeout(resolve, timer))
export const delay = (resolve, timer = 1e3) => setTimeout(resolve, timer)

export const numToChDX = (n) => {
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
        return "数据非法";
    var unit = "仟佰拾亿仟佰拾萬仟佰拾圆角分",
        str = "";
    n += "00";
    var p = n.indexOf('.');
    if (p >= 0)
        n = n.substring(0, p) + n.substr(p + 1, 2);
    unit = unit.substr(unit.length - n.length);
    for (var i = 0; i < n.length; i++)
        str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
    return str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(萬|亿|圆)/g, "$1").replace(/(亿)萬|壹(拾)/g, "$1$2").replace(/^圆零?|零分/g, "").replace(/圆$/g, "圆整");
};
//加法
export const FloatAdd = (arg1, arg2) => {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m;
}

//减法
export const FloatSub = (arg1, arg2) => {
    var r1, r2, m, n;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

//乘法
export const FloatMul = (arg1, arg2) => {
    var m = 0,
        s1 = arg1.toString(),
        s2 = arg2.toString();
    try { m += s1.split(".")[1].length } catch (e) {}
    try { m += s2.split(".")[1].length } catch (e) {}
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}


//除法
export const FloatDiv = (arg1, arg2) => {
    var t1 = 0,
        t2 = 0,
        r1, r2;
    try { t1 = arg1.toString().split(".")[1].length } catch (e) {}
    try { t2 = arg2.toString().split(".")[1].length } catch (e) {}

    r1 = Number(arg1.toString().replace(".", ""));

    r2 = Number(arg2.toString().replace(".", ""));
    return (r1 / r2) * Math.pow(10, t2 - t1);
}
// 求余
export const FloatRemainder = (arg1, arg2) => {
    return FloatSub(arg1, FloatMul(parseInt(FloatDiv(arg1, arg2)), arg2))
}

// m_lfit: 等比缩放，限制在指定w与h的矩形内的最大图片。
// m_mfit: 等比缩放，延伸出指定w与h的矩形框外的最小图片。
// m_fill: 固定宽高，将延伸出指定w与h的矩形框外的最小图片进行居中裁剪。
// m_pad: 固定宽高，缩略填充。
// m_fixed: 固定宽高，强制缩略。
// png图片不能加这个处理 加完更大

// resizeImg(640, 150, 'crop')
// resizeImg(640)
// webp/quality,90 图片细节压缩太厉害了
export const resizeImg = (w = 500, h, type = "m_lfit", position = 'center', webp = false) => {
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
export const getRelativeTime = (timeStamp, needTail = true) => {
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

export const priceFormatter = (price, isInt = false) => {
    let int = Math.floor(price)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let tail = Math.floor(FloatMul(FloatRemainder(price, 1), 100));
    let val = price;
    if (tail === 0) {
        val = int + (isInt ? '' : '.00');
    } else if (tail < 10) {
        val = int + '.0' + tail;
    } else {
        val = int + '.' + tail;
    }
    return val;
}

export const priceToYuan = price => {
    return price == 0 ? price : FloatDiv(price, 100).toFixed(2)
}

export const priceToFen = price => {
    return FloatMul(price, 100);
}

/**
 * 货币显示转换
 */
export const moneyFormat = (price, isInt = false) => {
    return price == 0 ? '0' : priceFormatter(priceToYuan(price * global.modeConf.exchangeRate), isInt);
}