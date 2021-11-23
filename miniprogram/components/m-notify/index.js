Component({
    externalClasses: ['mclass'],
    properties: {
        duration: {
            type: Number,
            value: 0
        }
    },
    data: {
        active: false,
    },
    methods: {
        toggle () {
            this.setData({ active: !this.data.active });
        },
        preventTouchMove () {
            
        }
    }
})