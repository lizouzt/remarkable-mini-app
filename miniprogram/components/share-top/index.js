/**
 * 业务绘制分享图片
 * 业务代码使用分享图片组件功能的时候提供这个函数
 * @returns {image}
 * bind:drawImage
 */

Component({
    externalClasses: ['mclass'],
    properties: {
        title: {
            type: String,
            value: '分享'
        },
        mode: {
            type: String,
            value: 'default'
        },
        // 需要保存的图片
        shareImage: {
            type: Object,
            value: null
        },
        imageSize: {
            type: Object,
            value: {
                height: 900,
                width: 600,
            }
        }
    },
    data: {
        needChoice: false,
        panelVisible: false,
        drawerVisible: false,
        saving: false,
        reAuth: false,
    },
    lifetimes: {
        attached() {
            const { mode, imageSize } = this.data;

            if (mode === 'both') {
                this.setData({
                    needChoice: true,
                    ratio: imageSize.height / imageSize.width,
                    actions: [
                        {
                            name: '发给好友',
                            icon: 'img:weixin',
                            size: 40,
                            color: '#666',
                            openType: 'share'
                        }, {
                            name: '生成二维码',
                            icon: 'img:peng-you-quan',
                            color: '#666',
                            size: 38,
                        }
                    ]
                })
            }
        },
    },
    methods: {
        onShareTap() {
            if (this.data.needChoice) {
                this.setData({ panelVisible: true });
            }
        },
        handleCancel() {
            this.setData({ panelVisible: false });
            this.triggerEvent('onCancel');
        },
        handleClickItem({ detail: { index } }) {
            if (index === 1) {
                if (global.openId) {
                    this.activeDrawer();
                } else {
                    global.message({
                        type: 'warning',
                        content: '请先登录',
                        duration: 3
                    });

                    setTimeout(() => {
                        wx.switchTab({url: '/pages/user/main'});
                    }, 2e3)
                }
            } else {
                this.triggerEvent('onShare');
                this.handleCancel();
            }
        },
        /*************** 画图部分 ***************/
        activeDrawer() {
            this.setData({
                drawerVisible: true,
                panelVisible: false,
            });

            this.triggerEvent('drawImage');
        },
        handleClickMask() {
            this.setData({
                drawerVisible: false,
            })
        },
        saveQRCode() {
            this.saveFile(this.data.shareImage.qrcode);
        },
        saveImage() {
            this.saveFile(this.data.shareImage.img);
        },
        saveFile(file) {
            if (this.data.shareImage) {
                this.setData({saving: true});

                wx.saveImageToPhotosAlbum({
                    filePath: file,
                    success: (res) => {
                        global.message({
                            content: "图片保存成功!",
                            type: "success"
                        });
                        this.setData({saving: false, reAuth: false});
                    },
                    fail: ({errMsg}) => {
                        if (/authorize/i.test(errMsg) || /fail auth deny/i.test(errMsg)) {
                            global.message({
                                content: '您之前已拒绝授权保存图片 需重新设置授权!',
                                type: 'warning',
                                duration: 6,
                            });
                            this.setData({reAuth: true});
                        } else if (errMsg != 'saveImageToPhotosAlbum:fail cancel') {
                            console.warn('7', errMsg);
                            global.message("图片保存失败!");
                        }
                        this.setData({saving: false});
                    }
                })
            }
        }
    }
})