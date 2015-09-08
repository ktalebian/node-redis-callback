"use strict";

var _JSON = {
    parse: function(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return str;
        }
    },

    parsable: function (str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    },

    stringify: function (str) {
        return JSON.stringify(str);
    }
};

module.exports = _JSON;

