/**
 * Created by zhangsihao on 2017/4/27.
 */
class BaseHandler {
    constructor(app) {
        this.app = app;
    }

    static getName() {
        throw new Error('Method not implemented.');
    }

    async handle(msg) {
        throw new Error('Method not implemented.');
    }
}

module.exports = BaseHandler;