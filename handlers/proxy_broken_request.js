/**
 * Created by zhangsihao on 2017/4/27.
 */
const BaseHandler = require('../libs/base_handler');

class ProxyBrokenRequestHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    static getName() {
        return 'PROXY_BROKEN_REQUEST';
    }

    async handle(msg) {
        //TODO: Ping to ensure that the proxy is actually broken, then offline it.
    }
}

module.exports = ProxyBrokenRequestHandler;