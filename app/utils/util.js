var crypto = require('crypto')
var fs = require('fs')
var path = require('path')
var config = require('../config')
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex')
}
function sign() {
    return md5([].join.call(arguments, '') + "@" + config.secureKey).toUpperCase()
}
function createFileIfNoExists(filePath) {
    var exists = fs.existsSync(filePath)
    if (!exists) {
        mkdirSync(path.dirname(filePath))
        fs.openSync(path.basename(filePath), 'w', '0755')
    }
}
function mkdirSync(url, mode, cb) {
    var arr = url.split("/");
    mode = mode || '0755';
    cb = cb || function () {
        };
    if (arr[0] === ".") {//处理 ./aaa
        arr.shift();
    }
    if (arr[0] == "..") {//处理 ../ddd/d
        arr.splice(0, 2, arr[0] + "/" + arr[1])
    }
    function inner(cur) {
        if (cur && cur.trim() && !fs.existsSync(cur)) {//不存在就创建一个
            fs.mkdirSync(cur, mode)
        }
        if (arr.length) {
            inner(cur + "/" + arr.shift());
        } else {
            cb();
        }
    }

    arr.length && inner(arr.shift());
}
//console.log(sign('qmx','zhanglingkang'))
module.exports = {
    md5: md5,
    sign: sign,
    mkdirSync:mkdirSync,
    createFileIfNoExists: createFileIfNoExists
}