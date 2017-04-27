/**
 * Created by zhangsihao on 2017/4/27.
 */
const BaseHandler = require('../libs/base_handler');
const mongoose = require('mongoose');
const ProxyModel = require('disproxy-core').Models.Proxy.AttachModel(mongoose);

class ProxyOfflineHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    static getName() {
        return 'PROXY_OFFLINE_REQUEST';
    }

    async handle(msg) {
        try {
            let proxy = await ProxyModel.findOne({
                internal_ip: msg.internal_ip
            }).exec();
            if (!proxy) {
                this.app.logger.error('Cannot find proxy node with internal ip ', msg.internal_ip);
                return;
            }
            let proxy_id = proxy._id.toString();
            let eip = proxy.external_ip;
            await proxy.remove();
            await this.app.broadcast.broadcast({
                type: 'PROXY_CLOSED',
                proxy_id: proxy_id,
                internal_ip: msg.internal_ip
            });
            await this.app.broadcast.broadcast({
                type: 'PROXY_OFFLINE',
                proxy_id: proxy_id,
                internal_ip: msg.internal_ip
            });
            this.app.logger.info('Proxy node offlined. ID: %s InternalIP: %s ExternalIP: %s', proxy_id, msg.internal_ip, eip);
        } catch (err) {
            this.app.logger.error('Failed to offline proxy node %s', msg.internal_ip, err);
        }
    }
}

module.exports = ProxyOfflineHandler;