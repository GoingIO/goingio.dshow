var staticServer = require('koa-static-cache')
var path = require('path')
var config = require('../config')
var crypto = require('crypto')
var route = require('koa-route')
app.use(function*(next) {
    this.url = this.url.replace(/\/statics/, "")
    yield next
    if (/\?v=/.test(this.url)) {
        var nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        this.response.set({
            'Cache-Control': 'max-age=1209600',
            'Expires': nextMonth
        })
    }
})
app.use(route.get(/^\/livelocate\/?$/, function* () {
    this.response.redirect('/livelocate/index.html');
}));
app.use(staticServer(
        path.join(path.dirname(require.main.filename), 'statics', config.staticsDirName)
    )
)