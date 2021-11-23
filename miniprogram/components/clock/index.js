const getGMTNowString = () => {
  const d = new Date()
  return d.toGMTString().replace(/\sGMT/i, '')
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  lifetimes: {
    attached () {
      this.timer = setInterval(() => {
        this.setData({ time: getGMTNowString() })
      }, 1e3)
    },
    detached () {
      clearInterval(this.timer)
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    time: getGMTNowString()
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
