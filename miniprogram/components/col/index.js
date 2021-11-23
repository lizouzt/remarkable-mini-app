Component({
    externalClasses: ['mclass'],

    relations: {
        '../row/index': {
            type: 'parent'
        }
    },

    properties: {
        span: {
            value: 0,
            type: Number
        },
        offset: {
            value: 0,
            type: Number
        }
    }
});
