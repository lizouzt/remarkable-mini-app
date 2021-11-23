let searchTimer = null

Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        extClass: {
            type: String,
            value: ''
        },
        focus: {
            type: Boolean,
            value: false
        },
        width: {
            type: Number,
            value: 30
        },
        placeholder: {
            type: String,
            value: '搜索'
        },
        value: {
            type: String,
            value: ''
        },
        search: {
            type: Function,
            value: null
        },
        throttle: {
            type: Number,
            value: 500
        },
        cancelText: {
            type: String,
            value: '取消'
        },
        cancel: {
            type: Boolean,
            value: true
        }
    },
    data: {
        result: []
    },
    lastSearch: Date.now(),
    lifetimes: {
        attached: function attached() {
            if (this.data.focus) {
                this.setData({
                    searchState: true
                });
            }
        }
    },
    methods: {
        clearInput: function clearInput() {
            this.setData({
                value: ''
            });
            this.triggerEvent('clear');
        },
        inputFocus: function inputFocus(e) {
            this.setData({ focus: true })
            this.triggerEvent('focus', e.detail);
        },
        inputBlur: function inputBlur(e) {
            this.setData({
                focus: false
            });
            this.triggerEvent('blur', e.detail);
        },
        hideInput: function hideInput() {
            this.setData({
                searchState: false
            });
            this.triggerEvent('cancel');
        },
        inputChange: function inputChange(e) {
            clearTimeout(searchTimer);

            this.setData({
                value: e.detail.value
            });
            this.triggerEvent('input', e.detail);

            searchTimer = setTimeout(() => {
                this.triggerEvent('search', this.data.value)
            }, 3e2)
        },
        selectResult: function selectResult(e) {
            var index = e.currentTarget.dataset.index;

            var item = this.data.result[index];
            this.triggerEvent('selectresult', { index: index, item: item });
        }
    }
})