define(['datasource', 'utils'], function (datasource, utils) {
    /**
     * 转化为高德坐标系
     */
    function convertGD(x, y, callback, coordsys, output) {
        if (x == undefined && y == undefined) {
            console.debug(x)
            console.debug(y)
        }

        if (coordsys == undefined) {
            coordsys = 'gps';
        }

        if (output == undefined) {
            output = 'json';
        }

        var url = datasource.getSource('restapi_amap_convert') + '&locations=' + x + ',' + y + '&coordsys=' + coordsys + '&output=' + output;

        return $.ajax({
            url: url,
            dataType: 'jsonp',
            async: false,
            success: function (data) {
                callback(data);
            },
            error: function (error) {
                callback(error);
            }
        });
    }


    function getUserInfo() {
        var user;
        $.ajax({
            url: DSHOW_CONTEXT + datasource.getSource('restapi_dshow_userinfo'),
            async: false,
            cache: true,
            dataType: 'json',
            error: function (err) {
            },
            success: function (data) {
                user = data;
            }
        });
        return user;
    }

    function getUserInfoAsync() {
        return $.ajax({
            url: DSHOW_CONTEXT + datasource.getSource('restapi_dshow_userinfo'),
            cache: true,
            dataType: 'json',
            error: function (err) {
            },
            success: function (data) {
            }
        })
    }

    /**
     * 根据gps坐标系获取高德坐标系
     * @return $.Deferred实例
     */
    function getGD(x, y) {
        var deferred = $.Deferred()
        convertGD(x, y, function (data) {
            data['locations'] = data['locations'] || ","//服务不可用时，locations为undefined
            var locations = data['locations'].split(',')
            deferred.resolve(locations[0], locations[1])
        })
        return deferred
    }

    function getBJPoi(x, y) {
        var info;
        $.ajax({
            url: datasource.getSource('dshow_poi_info') + '?x=' + x + '&y=' + y,
            async: false,
            cache: true,
            dataType: 'jsonp',
            error: function (err) {
            },
            success: function (data) {
                info = data;
            }
        });
        return info;
    }

    return {
        getGD: getGD,
        convertGD: convertGD,
        getUserInfo: getUserInfo,
        getUserInfoAsync: utils.callOne(getUserInfoAsync),
        getBJPoi: getBJPoi
    }
});