var route = require('koa-route')
var request = require('superagent')
var querystring = require('querystring')
var util = require('../utils/util')
var constant = require('../utils/constant')
var codeType = 9//手机号快速登录
var config = require('../config')
var userInfoTable = config.userInfoTable
var log4js = require('log4js')
var logger = log4js.getLogger('error')
logger.setLevel('ERROR')
app.use(route.get('/account/userinfo', function* () {
    var result = {}
    if (this.session.user) {
        result.result = {
            username: this.session.user.lastName,
            empid: this.session.user.ssoUser.empId,
            udid: this.session.user.diu,
            phone: this.session.user.phone,
            gdUserName: this.session.user.gdUserName
        }
        result.count = 1
    } else {
        result.status = "error"
    }
    this.body = JSON.stringify(result)
}))
app.use(route.get('/account/verifycode/get', function*() {
    var phone = this.query.phone
    var targetType = 2//手机短信
    var theRequest = request.post('http://sns.amap.com/ws/pp/verifycode/get/').send(querystring.stringify({
        channel: config.channel,
        code_type: codeType,
        target_type: targetType,
        target_value: phone,
        sign: util.sign(config.channel, codeType, targetType, phone)
    }))
    this.body = (yield theRequest.end.bind(theRequest)).text
}))

app.use(route.post('/account/phone/bind', function*() {
    var params = this.request.body
    var verifyCode = params.verifyCode
    var phone = params.phone
    var checkResult = yield * checkVerifyCode(phone, verifyCode)
    var diu = yield * getDiu("mobile", phone)
    if (checkResult) {
        if (this.session.user) {
            var userInfo = {
                'f:u_phone': phone
            }
            if (diu) {
                userInfo['f:u_diu'] = diu
            }
            var bindResult = yield * saveUserInfo(this.session.user.ssoUser.empId, userInfo)
            if (bindResult) {
                this.session.user.phone = phone
                this.session.user.udid = diu
                this.body = JSON.stringify({
                    status: 'success',
                    diu: diu
                })
            } else {
                this.body = JSON.stringify({
                    status: 'error',
                    msg: '绑定失败，请稍后重试'
                })
            }
        } else {
            this.body = JSON.stringify({
                status: 'error',
                msg: '请先登录'
            })
        }
    } else {
        this.body = JSON.stringify({
            status: 'error',
            msg: '验证码校验失败'
        })
    }
}))
app.use(route.post('/account/gd_account/bind', function*() {
    var userName = this.request.body.userName
    var password = this.request.body.password
    var diu
    var checkResult = yield checkGDAccount(userName, password)
    if (checkResult) {
        if (this.session.user) {
            if (userName.length == 11) {
                diu = yield getDiu('mobile', userName)
            }
            if (!diu) {
                diu = yield getDiu('username', userName)
            }
            var userInfo = {
                'f:u_user_name': userName
            }
            if (diu) {
                userInfo['f:u_diu'] = diu
            }
            var bindResult = yield *saveUserInfo(this.session.user.ssoUser.empId, userInfo)
            if (bindResult) {
                this.body = JSON.stringify({
                    status: 'success',
                    diu: diu
                })
            } else {
                this.body = JSON.stringify({
                    status: 'error',
                    msg: ' 绑定失败，请稍后重试'
                })
            }
        }
        else {
            this.body = JSON.stringify({
                status: 'error',
                msg: '请先登录'
            })
        }
    } else {
        this.body = JSON.stringify({
            status: 'error',
            msg: '用户名或者密码错误'
        })
    }
}))
/**
 *
 * @param {string} employeeId
 * @param {Object} userInfo
 */
function* saveUserInfo(employeeId, userInfo) {
    userInfo.rowkey = employeeId
    var theRequest = request.post(config.home + "/log/put/" + userInfoTable).send(querystring.stringify(userInfo))
    var result = JSON.parse((yield theRequest.end.bind(theRequest)).text)
    return result.status == "success"
}
//private Map<String, String> getUserInfo(String employeeId) throws Exception {
//    Map<String, String> result = new HashMap<String, String>();
//    String url = Context.getRequrestUrl("home") + "log/get/" + userInfoTable;
//    Map<String, String> paramMap = new HashMap<String, String>();
//    paramMap.put("rowkey", employeeId);
//    String res = httpRequestUtil.httpPostRequest(url, paramMap);
//    JSONObject resJson = JSON.parseObject(res);
//    if (resJson == null) {
//        return result;
//    }
//    if (resJson.get("status").toString().equals("success")) {
//        List<Object> resultList = (List<Object>) resJson.get("result");
//        if (resultList.size() > 0) {
//            Map<String, Object> firstOfResultList = (Map<String, Object>) resultList.get(0);
//            Map<String, Object> valueOffirst = (Map<String, Object>) firstOfResultList.get(employeeId);
//            result.put("userName", valueOffirst.get("u_user_name") == null ? null : valueOffirst.get("u_user_name").toString());
//            result.put("phone", valueOffirst.get("u_phone") == null ? null : valueOffirst.get("u_phone").toString());
//            result.put("diu", valueOffirst.get("u_diu") == null ? null : valueOffirst.get("u_diu").toString());
//        }
//    }
//    return result;
//}
function* checkGDAccount(userId, password) {
    var theRequest = request.post(config.loginGDUrl).send(querystring.stringify({
        channel: config.channel,
        userid: userId,
        password: password,
        sign: util.sign(config.channel, userId, password),
        mode: 1
    }))
    var result = JSON.parse((yield theRequest.end.bind(theRequest)).text)
    return result.code == constant.SUCCESSFUL
}
function* checkVerifyCode(phone, verifyCode) {
    var theRequest = request.post('http://sns.amap.com/ws/pp/verifycode/check/').send(querystring.stringify({
        channel: config.channel,
        mobile: phone,
        code_type: codeType,
        code: verifyCode,
        apply: 0,
        sign: util.sign(config.channel, verifyCode)
    }))
    var result = JSON.parse((yield theRequest.end.bind(theRequest)).text)
    return result.code == constant.SUCCESSFUL
}

function* getDiu(type, value) {
    var param = {
        channel: config.channel,
        sign: util.sign(config.channel, value),
        is_all: true
    }
    param[type] = value
    var result = {}
    try {
        var theRequest = request.get(config.getDiuUrl).query(param)
        result = JSON.parse((yield theRequest.end.bind(theRequest)).text)
    } catch (e) {
        logger.error('getDiu error:', config.getDiuUrl, JSON.stringify(param), e)
    }
    return result.code == constant.SUCCESSFUL ? result.diu : ""
}