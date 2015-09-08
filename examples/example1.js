"use strict";

var IPC = require('./../index');
var ipc = new IPC();

ipc.interface = 'redis';
ipc.network = {
    password: 'veryHardPass'
};

ipc.init().then(function() {
    console.log(ipc.pub)
});
