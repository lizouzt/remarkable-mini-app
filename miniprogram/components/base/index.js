function getCtx (selector) {
    const pages = getCurrentPages();
    const ctx = pages[pages.length - 1];
    
    const componentCtx = ctx.selectComponent(selector);

    if (!componentCtx) {
        console.error('无法找到对应的组件，请按文档说明使用组件');
        return null;
    }
    return componentCtx;
}

function Toast(options) {
    const { selector = '#toast' } = options;
    const ctx = getCtx(selector);

    ctx.handleShow(options);
}

Toast.hide = function (selector = '#toast') {
    const ctx = getCtx(selector);

    ctx.handleHide();
};

function Message(options) {
    if (options.constructor === String) {
        options = {
            content: options,
            duration: 3,
            type: 'error',
        }
    }

    const { selector='#message' } = options;
    const ctx = getCtx(selector);

    ctx.handleShow(options);
}

function Share(selector='') {
    selector = selector || '#mShareTop';

    const ctx = getCtx(selector);
    ctx.onShareTap();
}

module.exports = {
    mShare: Share,
    mToast: Toast,
    mMessage: Message
};