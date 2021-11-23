const randomName = () => {
  return Date.now() + Math.floor(Math.random() * 100)
}

Component({
  externalClasses: ['mclass'],
  /**
   * 组件的属性列表
   */
  properties: {
    video: {
      type: Boolean,
      value: false
    },
    sourceType: {
      type: Array,
      value: ['album', 'camera']
    },
    multiple: {
      type: Boolean,
      value: false
    },
    path: {
      type: String,
      value: '',
      observer (newVal) {
        let path = newVal

        if (/\S+\//.test(newVal) === false) {
          path += '/'
        }

        this.setData({ targetPath: path })
      }
    },
    list : {
      type : Array,
      value : '',
      observer (newVal, oldVal) {
        const { video } = this.data
        const list = newVal.filter(item => !!item)

        this.setData({ itemList: list })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isUploading: false,
    tempFileUrl: '',
    targetPath: 'tempFile/',
    itemList: [],
  },

  lifetimes: {
    attached () {
      
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onItemTap ({ currentTarget: { dataset: { index } } }) {
      this.triggerEvent('Remove', { index })
    },

    loopUpload (file, options={}) {
      return new Promise(resolve => {
        const that = this

        const typeMatch = file.match(/\.(\S{3,10})$/i)
        const fileType = typeMatch ? typeMatch[0] : '.borys'

        const tarFilePath = `${that.data.targetPath}${randomName()}${fileType}`

        that.setData({ isUploading: true })

        const uploadTask = wx.cloud.uploadFile({
          cloudPath: tarFilePath,
          filePath: file,
          success (res) {
            if (res.fileID) {
              that.triggerEvent('Uploaded', { file: res.fileID, ...options })
            }
          },
          fail (err) {
            that.setData({ isUploading: false })
            that.triggerEvent('error', { err })

            resolve(true)
          }
        })

        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
          if (res.progress === 100) {
            that.setData({ isUploading: false })
            resolve(true)
          }
        })
      })
    },

    uploadVideo () {
      const that = this

      wx.chooseVideo({
        sourceType: this.data.sourceType,
        maxDuration: 10,
        camera: 'back',
        success: ({ tempFilePath, size, height, width }) => {
          if (size / (1024 * 1024) < 20) {
            that.loopUpload(tempFilePath, { width, height })
          } else {
            that.triggerEvent('error', { err: new Error('视频尺寸太大') })
          }
        }
      })
    },

    async onUpload () {
      const { isUploading, video } = this.data

      if (this.data.isUploading) {
        return false
      }

      video ? this.uploadVideo() : this.uploadImage()
    },

    uploadImage () {
      const that = this

      wx.chooseImage({
        count: this.data.multiple ? 6 : 1,
        sizeType: 'compressed',
        success: async chooseResult => {
          for (var i = chooseResult.tempFilePaths.length - 1; i >= 0; i--) {
            const file = chooseResult.tempFilePaths[i]

            await wx.getImageInfo({src: file})
              .then(async ({ width, height }) => {
                await that.loopUpload(file, { width, height })
              })
              .catch(err => {
                that.triggerEvent('Error', { err })
              })
          }
        },
        fail (err) {
          if (err.errMsg !== "chooseImage:fail cancel") {
            that.triggerEvent('Error', { err })
          }
        }
      })
    }
  }
})

