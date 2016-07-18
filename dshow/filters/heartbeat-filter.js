var route = require('koa-route')
app.use(route.get('/check.node', function*() {
    this.body = 'success'
}))