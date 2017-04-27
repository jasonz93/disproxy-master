/**
 * Created by zhangsihao on 2017/4/27.
 */
const BaseHandler = require('../libs/base_handler');
const mongoose = require('mongoose');
const ProxyModel = require('disproxy-core').Models.Proxy.AttachModel(mongoose);

class ProxyOnlineRequestHandler extends BaseHandler {
    constructor(app) {
        super(app);
    }

    static getName() {
        return 'PROXY_ONLINE_REQUEST';
    }

    async handle(msg) {
        if (!msg.internal_ip) {
            this.app.logger.error('Proxy online request without internal ip.');
            return;
        }
        let eip;
        if (msg.node_type === 'ALIYUN') {
            eip = await this.app.aliyun.getEIpByPrivateIp(msg.internal_ip);
            if (!eip) {
                this.app.logger.error('Failed to get aliyun eip by private ip. private ip:', msg.internal_ip);
                return;
            }
        } else {
            this.app.logger.error('This version of master only supports aliyun node.');
            return;
        }
        let now = new Date();
        let proxy = await ProxyModel.findOneAndUpdate({
            external_ip: eip
        }, {
            internal_ip: msg.internal_ip,
            port: msg.port,
            protocol: msg.protocol,
            type: msg.node_type,
            create_at: now,
            update_at: now
        }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }).exec();
        await this.app.broadcast.broadcast({
            type: 'PROXY_ONLINE',
            proxy_id: proxy._id.toString()
        });
        this.app.logger.info('Proxy onlined. ID:', proxy._id, ' InternalIP:', proxy.internal_ip, ' ExternalIP:', proxy.external_ip);
    }
}

module.exports = ProxyOnlineRequestHandler;