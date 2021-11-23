const app = getApp();
let tempOnLoadOptions = {};

Page({
    data: {
        url: ''
    },
    onLoad: function (options=tempOnLoadOptions) {
        tempOnLoadOptions = options;
        
        if (options.url) {
            this.setData({
                url: options.url
            })
        } 
    }
})