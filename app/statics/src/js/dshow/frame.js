require(['datautils', 'datasource', 'dataloader', 'utils', 'xenon'], function (datautils, datasource, dataloader, utils) {
    if (true) {
        datautils.getUserInfoAsync().then(function (data) {
            var user = data
            console.debug(user)
            if (user) {
                var username = user['result'] && user['result']['username'];
                $('#user-profile').text(username);
                if (username) {
                    $('#user-opt').append('<li class="settings"><a href="' + DSHOW_CONTEXT + '/web/m/settings' + '"> <i class="fa-wrench"></i>设置 </a></li>');
                }
                var hint = username ? "登出" : "登录"
                $('#user-opt').append('<li><a href="' + DSHOW_CONTEXT + datasource.getSource('restapi_dshow_logout') + '"> <i class="fa-lock"></i>' + hint + '</a></li>');
            }
        })
    }
})