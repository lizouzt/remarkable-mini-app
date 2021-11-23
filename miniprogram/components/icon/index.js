Component({
    externalClasses: ['mclass'],

    properties: {
        type: {
            type: String,
            value: '',
            observer (newVal, oldVal) {
                const type = newVal;

                if (/^img:/.test(type)) {
                    this.setData({
                        imageMode: true, 
                        type: type.replace(/^img:/, '')
                    });
                } else if (/^custom:/.test(type)) {
                    this.setData({
                        customMode: true,
                        type: type.replace(/^custom:/, '')
                    })
                }
            }
        },
        size: {
            type: Number,
            value: 14
        },
        color: {
            type: String,
            value: ''
        },
        weight: {
            type: Number,
            value: 400
        }
    },
    lifetimes: {
        attached () {
            
        }
    }
});
