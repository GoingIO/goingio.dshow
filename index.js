var koa = require('koa');
var app = global.app = koa();
var fs = require('fs');
var bodyParser = require('koa-bodyparser');
var path = require('path');
var log4js = require('log4js');
var util = require('./utils/util');
var logDirPath = path.join(__dirname, 'logs');
util.mkdirSync(logDirPath)
log4js.configure({
    appenders: [
        {
            type: 'dateFile',
            filename: logDirPath + '/access',
            alwaysIncludePattern: true,
            category: 'access',
            pattern: "-yyyyMMdd.log"
        },
        {
            type: 'dateFile',
            filename: logDirPath + '/error',
            alwaysIncludePattern: true,
            category: 'error',
            pattern: "-yyyyMMdd.log"
        },
        {
            type: 'dateFile',
            filename: logDirPath + '/page-access',
            alwaysIncludePattern: true,
            category: 'page-access',//只记录页面的访问
            pattern: "-yyyyMMdd.log"
        }
    ]
});

app.use(bodyParser());
var logger = log4js.getLogger('error')
logger.setLevel('ERROR')
app.on('error', function (err) {
    logger.error(err)
});
process.on('uncaughtException', function (err) {
    logger.error('uncaught-', err)
});

app.listen(3000);