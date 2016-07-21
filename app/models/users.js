'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    本地账号: {
        账号: String,
        密码: String
    },
    固件: {
        主控名称: String,
        固件版本: Object,
        固件信息: Object
    }
});

module.exports = mongoose.model('User', User);
