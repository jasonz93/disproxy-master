/**
 * Created by zhangsihao on 2017/4/27.
 */
const BaseHandler = require('../libs/base_handler');
const mongoose = require('mongoose');
const ProxyModel = require('disproxy-core').Models.Proxy.AttachModel(mongoose);
const url = require('url');

class BanRequestHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    static getName() {
        return 'BAN_REQUEST';
    }

    async handle(msg) {
        let parsedUrl = url.parse(msg.url);
        let host = parsedUrl.hostname;
        let proxy = await ProxyModel.findOneAndUpdate({
            _id: msg.proxy_id
        }, {
            $addToSet: {
                bans: host
            }
        }).exec();
        if (!proxy) {
            this.app.logger.error('Proxy in ban request does not exist.');
            return;
        }
        await this.app.broadcast.broadcast({
            type: 'BAN_NOTIFY',
            proxy_id: proxy._id.toString(),
            url: msg.url,
            host: host
        });
        let restProxy = await ProxyModel.find({
            bans: {
                $ne: host
            }
        }).exec();
        this.app.logger.info('Ban host %s has %d proxies left available.', host, restProxy.length);
    }
}

module.exports = BanRequestHandler;