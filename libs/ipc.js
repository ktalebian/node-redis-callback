"use strict";

var Promise = require('rsvp').Promise;

/**
 * Expose IPC
 * @type {IPC}
 */
module.exports = IPC;

var InterfaceRedis = require('./interface.redis');

var INTERFACE_REDIS = 'redis';

function IPC(_interface, _network) {
    this.interface = _interface;
    this.network = _network;

    if (!this.interface) {
        this.interface = INTERFACE_REDIS;
    }
}

IPC.prototype.init = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
        var instant;
        switch(self.interface) {
            case INTERFACE_REDIS:
                instant = new InterfaceRedis(self.network);
                break;
        }

        instant.then(resolve, reject);
    });
};