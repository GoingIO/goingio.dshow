var log4js = require('log4js')
var logger = log4js.getLogger('access')
logger.setLevel('INFO')
app.use(function*(next) {
    var userName = 'guest'
    var user = this.session.user
    if (user && user.lastName) {
        userName = user.lastName
    }
    logger.info(userName + '-' + this.originalUrl)
    yield next
})