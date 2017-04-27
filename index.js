/**
 * Created by zhangsihao on 2017/4/26.
 */
const Core = require('disproxy-core');
const ConnectorManager = new Core.ConnectorManager();
const _ = require('lodash');
const klaw = require('klaw');
const mongoose = require('mongoose');

const app = {};

app.logger = console;

app.opts = _.defaults({
    broadcast: process.env.DISPROXY_BROADCAST,
    message_queue: process.env.DISPROXY_MESSAGE_QUEUE,
    mongo: process.env.DISPROXY_MONGODB,
    aliyun_region: process.env.DISPROXY_ALIYUN_REGION,
    aliyun_access_key: process.env.DISPROXY_ALIYUN_ACCESS_KEY,
    aliyun_access_secret: process.env.DISPROXY_ALIYUN_ACCESS_SECRET
}, {
    broadcast: 'redis://localhost/disproxy_broadcast',
    message_queue: 'redis://localhost/disproxy_mq',
    mongo: 'mongodb://localhost/disproxy',
    aliyun_region: '',
    aliyun_access_key: '',
    aliyun_access_secret: ''
});

mongoose.Promise = Promise;
mongoose.connect(app.opts.mongo);

app.aliyun = new Core.Aliyun(app.opts.aliyun_region, app.opts.aliyun_access_key, app.opts.aliyun_access_secret);
app.handlers = {};

klaw('./handlers')
    .on('data', (item) => {
        if (_.endsWith(item.path, '.js')) {
            let handler = require(item.path);
            app.handlers[handler.getName()] = new handler(app);
            console.log('Handler', handler.getName(), 'registered.');
        }
    })
    .on('end', () => {
        app.broadcast = ConnectorManager.getBroadcast(app.opts.broadcast, (msg) => {
            (async () => {
                let handler = app.handlers[msg.type];
                if (handler) {
                    await handler.handle(msg);
                }
            })();
        });
        app.mq = ConnectorManager.getMessageQueue(app.opts.message_queue, (msg) => {
            (async () => {
                let handler = app.handlers[msg.type];
                if (handler) {
                    await handler.handle(msg);
                }
            })();
        });
        console.log('DisProxy master initialized.');
    });