"use strict";

var Redis = require('redis');
var JSON = require('./json');
var Promise = require('rsvp').Promise;
var uuid = require('node-uuid');
var _ = require('lodash');
var config = require('./configs/configs');
var IPC = require('./ipc');

module.exports = InterfaceRedis;

var PIPELINE = "wavelet.ada.ipc";

function InterfaceRedis(options) {
    return new Promise(function (resolve, reject) {
        options = _.extend({
            port: config.redis.port,
            host: config.redis.host,
            password: config.redis.password
        }, options);

        var pub, sub;
        pub = Redis.createClient(options.port, options.host);
        pub.auth(options.password, function() {
            pub.setMaxListeners(0);
            sub = Redis.createClient(options.port, options.host);
            sub.auth(options.password, function() {
                sub.subscribe(PIPELINE, resolve);
                sub.setMaxListeners(0);
            });
        });

        // Add to the prototype
        IPC.prototype.emit = _emit;
        IPC.prototype.on = _on;
        IPC.prototype.sub = sub;
        IPC.prototype.pub = pub;
        IPC.prototype.Redis = Redis;

        // To emit, you first have to create a listener on the callback
        function _emit(channel, data, callback) {
            var payload = {
                data: data,
                channel: channel,
                responseChannel: uuid.v4()
            };

            if (callback) {
                pub.publish(PIPELINE, JSON.stringify(payload));
                sub.on("message", _listen);
                setTimeout(function() {
                    sub.removeListener("message", _listen);
                }, config.redis.timeout);
            }

            else {
                pub.publish(PIPELINE, JSON.stringify(payload));
            }

            function _listen(_pipeline, _response) {
                if (_pipeline !== PIPELINE) {
                    return;
                }

                _response = JSON.parse(_response);
                if (payload.responseChannel === _response.channel) {
                    if (callback) {
                        callback(JSON.parse(_response.data));
                    }
                    sub.removeListener("message", _listen);
                }
            }

        }

        function _on(channel, callback) {
            sub.on("message", function (_pipeline, _payload) {
                if (_pipeline !== PIPELINE) {
                    return;
                }

                // Parse packet
                _payload = JSON.parse(_payload);
                // If this is what we want
                if (_payload.channel === channel) {
                    callback(_payload.data, function (data) {
                        _emit(_payload.responseChannel, JSON.stringify(data));
                    });
                }
            });
        }
    });
}
