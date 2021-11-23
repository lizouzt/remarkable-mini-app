const default_data = {
    visible: false,
    content: '',
    duration: 2,
    type: 'default', // default || success || warning || error
};

let timmer = null;

Component({
    externalClasses: ['mclass'],

    properties: {
        withHeader: {
            type: Boolean,
            value: true
        }
    },

    data: {
        ...default_data,
        paddingTop: 0,
    },

    lifetimes: {
        attached() {
            if (!this.data.withHeader) {
                this.setData({paddingTop: global.deviceInfo.messageBarTopOffset})
            }
        }
    },

    methods: {
        handleShow (options) {
            const { type = 'default', duration = 2 } = options;

            this.setData({
                ...options,
                type,
                duration,
                visible: true
            });

            const d = this.data.duration * 1000;

            if (timmer) clearTimeout(timmer);
            if (d) {
                timmer = setTimeout(() => {
                    this.handleHide();
                    timmer = null;
                }, d);
            }
        },

        handleHide () {
            if (timmer) clearTimeout(timmer)

            this.setData({
                ...default_data
            });
        }
    }
});