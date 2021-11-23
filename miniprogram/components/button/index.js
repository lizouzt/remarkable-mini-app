Component({
    externalClasses: ['mclass'],

    properties: {
        // default, primary, ghost, info, success, warning, error
        type: {
            type: String,
            value: '',
        },
        // submit
        formType: {
            type: String,
            value: ''
        },
        // must submit with formId
        mustFormId: {
            type: Boolean,
            value: false
        },
        // true, false
        border: {
            type: Boolean,
            value: true
        },
        // true, false
        padding: {
            type: Boolean,
            value: true
        },
        // '0 10px 0 10px'
        paddingSize: {
            type: String,
            value: ''
        },
        // true, false
        margin: {
            type: Boolean,
            value: true
        },
        height: {
            type: [String, Number],
        },
        width: {
            type: [String, Number],
        },
        inline: {
            type: Boolean,
            value: false
        },
        // default, large, small
        size: {
            type: String,
            value: 'default',
        },
        // circle, square
        shape: {
            type: String,
            value: 'square'
        },
        disabled: {
            type: Boolean,
            value: false,
        },
        loading: {
            type: Boolean,
            value: false,
        },
        long: {
            type: Boolean,
            value: false
        },
        openType: String,
        appParameter: String,
        hoverStopPropagation: Boolean,
        hoverStartTime: {
            type: Number,
            value: 20
        },
        hoverStayTime: {
            type: Number,
            value: 70
        },
        lang: {
            type: String,
            value: 'en'
        },
        sessionFrom: {
            type: String,
            value: ''
        },
        sendMessageTitle: String,
        sendMessagePath: String,
        sendMessageImg: String,
        showMessageCard: Boolean
    },

    data: {
        isQiYe: false
    },

    lifetimes: {
        attached () {
            
        }
    },

    observers: {
        "height, width, paddingSize": function () {
            const { height, width, paddingSize } = this.data;
            
            let style = '';

            if (height) {
                const tHeight = height + (/\D/.test(height) ? '' : 'px');
                style += `height:${tHeight};line-height:${tHeight};`;
                if (this.shape == 'circle') {
                    style += `border-radius:${tHeight};`;
                }
                // 有height就不能有size
                this.setData({size: ''});
            }
            if (width) {
                style += `width:${width + (/\D/.test(width) ? '' : 'px')};`;
            }
            if (paddingSize) {
                style += `padding: ${paddingSize};`;
            }

            if (style != '') {
                this.setData({style})
            }
        }
    },

    methods: {
        handleTap () {
            if (this.data.disabled) return false;

            this.triggerEvent('click');
        },
        bindgetuserinfo({ detail = {} } = {}) {
            if (this.data.disabled) return false;

            this.triggerEvent('getuserinfo', detail);
        },
        bindcontact({ detail = {} } = {}) {
            if (this.data.disabled) return false;

            this.triggerEvent('contact', detail);
        },
        bindgetphonenumber({ detail = {} } = {}) {
            if (this.data.disabled) return false;
            
            this.triggerEvent('getphonenumber', detail);
        },
        binderror({ detail = {} } = {}) {
            this.triggerEvent('error', detail);
        },
        bindsubmit({ detail = {} } = {}) {
            if (this.data.disabled) return false;
            
            const { formId } = detail;
            
            if (this.data.mustFormId && formId.indexOf('requestFormId:fail') > -1) {
                const [page] = getCurrentPages()
                let toast
                
                if (page == null || (toast = page.selectComponent("#toast")) == null) {
                    wx.showToast({
                        title: '手机网络异常 请检查网络再重新点击',
                        duration: 2000
                    })
                } else {
                    toast.showWarning('手机网络异常', '请检查网络再重新点击')
                }

                return false;
            }

            this.triggerEvent('submit', detail)
        }
    }
});
