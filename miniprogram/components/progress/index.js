Component({
    externalClasses: ['mclass', 'tipclass', 'textclass'],

    properties: {
        percent: {
            type: Number,
            value: 0
        },
        // normal || active || wrong || success
        status: {
            type: String,
            value: 'normal'
        },
        tip: {
            type: String
        },
        strokeWidth: {
            type: Number,
            value: 12
        },
        hideInfo: {
            type: Boolean,
            value: false
        }
    },
    data: {
        showBlink: false
    },
    observers: {
        percent: function () {
            const { percent } = this.data;

            if (percent > 20) {
                this.setData({showBlink: true})
            }
        }
    }
});
