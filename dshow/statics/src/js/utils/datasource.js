define(function () {
    var datasource = {
        dshow_home_company: '/s_amap_dm_user_homecompany',
        dshow_user_mytrafficxy: '/log/post/nocache/s_amap_dm_user_archive_mytrafficxy',
        dshow_poi_info: 'http://10.16.18.109:2014/poi_in_aoi_building/page/poi_in_shape.jsp',
        user_migration: '/s_amap_dm_user_migrate_city',
        dshow_permanent_city: '/s_amap_dm_user_areasadcode_all',
        dshow_permanent_area: '/s_amap_dm_user_areasfilter_all',
        dshow_userinfo: 's_amap_dm_user_ids',

        restapi_amap_convert: 'http://restapi.amap.com/v3/assistant/coordinate/convert?key=9f6c2b09a278eccd06e7a0d01c36131a',
        restapi_dshow_userinfo: '/account/userinfo',
        restapi_dshow_logout: '/logout',
        restapi_dshow_get_verifycode: "/account/verifycode/get",
        restapi_dshow_bind_phone: "/account/phone/bind",
        restapi_dshow_bind_gd_account: "/account/gd_account/bind",

        user_navi_overview: '/s_amap_dm_app_tracks_navioverview_aos', // 用户导航概览
        user_navi_summary: '/s_amap_dm_user_tracks_navisummary', //用户累计导航信息
        user_navi_detail: '/s_amap_dm_user_tracks_navidetail', //用户单次导航信息

        user_navi_allday_overview: '/s_amap_dm_app_tracks_overview_all', // 哪天有活跃
        user_navi_allday_tracks: '/s_amap_dm_app_tracks_allday_all', // 全天轨迹
        user_navi_allday_staymbrs: '/s_amap_dm_app_tracks_staymbrs_all', // 停留区域块数
        user_navi_allday_stayarea:'/s_amap_dm_app_tracks_stayrankareas_all', // 全天轨迹停留区域

        dshow_home_company_ab: '/s_amap_dm_user_homecompany_ab', // 家和公司对比
        user_homepage: '/s_amap_dm_app_user_homepage_all', // 用户主页

        user_prefer: '/s_amap_dm_alg_user_categoryprofiles_all', // 类目偏好
    };


    function getSource(key) {
        return datasource[key] == undefined ? '' : datasource[key];
    }

    //获取带有参数的数据源
    function getSourceF() {
        if (arguments.length == 0)
            return '';
        var str = datasource[arguments[0]];
        if (str == undefined) {
            return '';
        } else {
            for (var i = 1; i < arguments.length; i++) {
                var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        }
    }

    return {
        getSource: getSource,
        getSourceF: getSourceF
    }

});
