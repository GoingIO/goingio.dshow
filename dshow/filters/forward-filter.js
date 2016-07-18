//因为此项目从java迁移过来，so所有的访问请求路径部分都以/dshow-web/开头，为了向后兼容，这里将以dshow-web开头的路径全部改写
var route = require('koa-route')
app.use(route.get('/', function*(next) {
    this.url = '/dshow-web/index'
    yield next
}))
app.use(route.get('/dshow-web', function*(next) {
    this.url = '/dshow-web/index'
    yield next
}))
app.use(function*(next) {
    this.url = this.url.replace(/dshow-web\//, "")
    yield  next
})