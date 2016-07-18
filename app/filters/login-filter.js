var session = require('koa-session')
var buc = require('koa-buc')
var config = require('../config')
var request = require('superagent')
var _ = require('underscore')
var querystring = require('querystring')
app.keys = ['a', 'b']
app.use(session(app))
app.use(buc({
    appname: 'ant-qmx',
    //clientType: 'e57778cb-2e9a-49bd-8876-3ba18521307a',
    ssoURL: config.bucLoginUrl
}))

app.use(function*(next) {
    if (this.session.user) {
        if (!this.session.user.getUserInfo) {
            this.session.user.getUserInfo = true
            this.session.user = _.extend(yield getUserInfo(this.session.user.workid), this.session.user)
        }
    }
    yield next
})
function*getUserInfo(employeeId) {
    employeeId = employeeId.trim()
    var targetUrl = config.home + "log/get/" + config.userInfoTable
    var theRequest = request.post(targetUrl).send(querystring.stringify({
        rowkey: employeeId
    }))
    var userInfo = {}
    var result = JSON.parse((yield theRequest.end.bind(theRequest)).text)
    if (result.status == 'success') {
        if (result.result.length > 0) {
            userInfo = result.result[0][employeeId]
        }
    }
    return {
        gdUserName: userInfo['u_user_name'],
        phone: userInfo['u_phone'],
        diu: userInfo['u_diu']
    }
}