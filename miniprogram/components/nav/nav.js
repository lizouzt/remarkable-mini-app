// components/nav/nav.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    bgColor: {
      type: String,
      value: 'white'
    },
    transparent: {
      type: Boolean,
      value: false,
      observer (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.setData({ bgColor: newVal ? 'transparent' : '#fff' })
        }
      }
    },
    alwaysShow: {
      type: Boolean,
      value: false
    },
    back: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    navHeight: global.deviceInfo.navHeight,
    show: false,
    first: true
  },

  lifetimes: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show: function() {
      if (this.data.show == true) {
        return ;
      }

      this.setData({
        show: true,
        first: false
      });
    },

    hide: function() {
      if (this.data.show == false) {
        return ;
      }

      this.setData({
        show: false,
        first: false
      });
    },

    goBack: function() {
      
      if (getCurrentPages().length === 1) {
        return wx.reLaunch({
          url: '/pages/index/index'
        })
      }

      wx.navigateBack({});
    }
  }
})
