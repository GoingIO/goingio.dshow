var querystring = require('querystring')
var forwardUrlReg = /^.+req\/common/
var route = require('koa-route')
var request=require('superagent')
var config=require('../config')
app.use(route.post(forwardUrlReg, function*() {
    var params = this.request.body
    var source = config[params["request-source"].trim()]
    var targetUrl = this.originalUrl.replace(forwardUrlReg, source)
    var theRequest = request.post(targetUrl).send(querystring.stringify(params))
    var res = yield theRequest.end.bind(theRequest)
    this.body = res.text
}))

/**
 * 转发请求查询poi id对应名字
 * querystring ?id=B021307FCI
 */
app.use(route.get(/\/restpoi\/?/, function* () {

    var query = querystring.parse(this.request.querystring);
    var response = yield request.get("http://restapi.amap.com/v3/place/detail?key=d5e3debf995837bd41ac3fa0df9b2aca&id=" + query.id);

    this.response.type = 'application/json';

    this.body = response.text;
}));