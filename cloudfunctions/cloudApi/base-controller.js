const codeStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
class BaseController {
  constructor() { }
  success(data) {
    return { code: 0, data }
  }
  fail(msg = '', desc = '', code = -1) {
    return desc ? { msg, code, desc } : { msg, code }
  }
  async getByKey(tableName, where={}, fields) {
    return await db.collection(tableName).where(where).field(fields || {}).get().then(res => {
      return res.data
    }).catch(() => [])
  }
  async getById(tableName, id, fields) {
    return await db.collection(tableName).doc(id).field(fields || {}).get().then(res => {
      return res.data
    }).catch(() => null)
  }
  getId() {
    var ret = ''
    var ms = (new Date()).getTime()
    ret += this.base62encode(ms, 6) 
    ret += this.base62encode(Math.ceil(Math.random() * (62 ** 6)), 6)
    return ret
  }
  base62encode(v, n) {
    var ret = ""
    for (var i = 0; i < n; i++) {
      ret = codeStr[v % codeStr.length] + ret
      v = Math.floor(v / codeStr.length)
    }
    return ret
  }
}
module.exports = BaseController