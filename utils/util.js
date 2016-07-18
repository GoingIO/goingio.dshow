var crypto = require('crypto')
var fs = require('fs')
var path = require('path')

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

module.exports = {
    mkdirSync:mkdirSync,
    createFileIfNoExists: createFileIfNoExists
}