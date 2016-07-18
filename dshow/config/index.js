var _ = require('underscore')
var commonConfig = {
    userInfoTable: 's_amap_dm_user_ids',
    bucLoginUrl: 'https://login.alibaba-inc.com/',
    getDiuUrl: 'http://sns.testing.amap.com/ws/pp/device/diu/get/',
    dshowVersion: 'BATA-0.2.6',
    dshowTheme: 'xenon',
    channel: 'qmx',
    dshowIndex: '/index',
    dshowContext: '/dshow-web',
    secureKey: '4sbaHnmJFcrdKznOQxdj8ki02xCJ255abwtkQMOp'
}
var config = _.extend(commonConfig, require('./config'))
module.exports = config