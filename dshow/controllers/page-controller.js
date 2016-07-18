var route = require('koa-route')
var thunkify = require('thunkify')
var fs = require('fs')
var path = require('path')
var readFile = thunkify(fs.readFile)
var config = require('../config')
var startDir = path.dirname(require.main.filename)
var staticsDir = path.join(startDir, 'statics', config.staticsDirName)
var log4js = require('log4js')
var logger = log4js.getLogger('page-access')
logger.setLevel('INFO')
app.use(route.get('/index', function*(next) {
    this.url = this.url.replace(/\/index/, '/web/m/index')
    yield next
}))
app.use(route.get(/\/web\/m/, function*() {
    log(this)
    var parentPagePath = path.join(staticsDir, 'parents/m.html')
    var parentPage = getFinalParentPage(yield readFile(parentPagePath, {encoding: 'utf-8'}))
    var childPagePath = path.join(staticsDir, 'children', this.path.replace('web', '')) + '.html'
    var childPage = yield readFile(childPagePath, {encoding: 'utf-8'})
    var content = parentPage.replace('#FRAME_TEMPLATE#', childPage)
    this.body = content
}))
app.use(route.get(/\/web\/r/, function*() {
    log(this)
    var parentPagePath = path.join(staticsDir, 'parents/r.html')
    var parentPage = getFinalParentPage(yield readFile(parentPagePath, {encoding: 'utf-8'}))
    var childPagePath = path.join(staticsDir, 'children/r', this.path.replace('web/r', '')) + '.html'
    var childPage = yield readFile(childPagePath, {encoding: 'utf-8'})
    this.body = parentPage.replace('#MENULESS_TEMPLATE#', childPage)
}))
function log(ctx) {
    var userName = 'guest'
//    var user = ctx.session.user
//    if (user && user.lastName) {
//        userName = user.lastName
//    }
    logger.info(userName + '-' + ctx.originalUrl)
}

function getFinalParentPage(parentPage) {
    return parentPage.replace(/#DSHOW_VERSION#/g, config.dshowVersion).replace(/#DSHOW_THEME#/g, config.dshowTheme).replace(/#DSHOW_CONTEXT#/g, config.dshowContext)
}