define(['utils'], function (utils) {
    var datasource = {
        /****************************************************业务数据源**************************************************************/

        //全活用户
        data_aos_awaken: 'log/post/nocache/s_amap_aos_cube_awaken_all_distinct',
        //新增
        data_aos_aos_xinzeng: 'log/post/nocache/s_amap_aos_cube_newuser',
        //累计
        data_aos_leiji: 'log/post/nocache/s_amap_aos_cube_totaluser',
        //30天活跃
        data_aos_yuehuo: 'log/post/nocache/s_amap_aos_cube_mactuser',
        //日活
        data_aos_rihuo: 'log/post/nocache/s_amap_aos_cube_actuser',
        //7天活跃
        data_aos_zhouhuo: 'log/post/nocache/s_amap_aos_cube_wactuser',
        //使用时长
        data_aos_rjsc: 'log/post/nocache/s_amap_aos_cube_usetime',
        //注册
        data_aos_register: 'http://sns.amap.com/ws/pp/statis/daily?channel=qmx&start={0}&end={1}',
        //启动次数
        data_aos_qidong: 'log/post/nocache/s_amap_aos_cube_startnumbers',
        //登录用户
        data_aos_login: 'log/post/nocache/s_amap_aos_cube_login',
        //新增留存
        data_aos_absretention: 'log/post/nocache/s_amap_aos_cube_dailyabsretention',
        //活跃留存
        data_aos_actremain: 'log/post/nocache/s_amap_aos_cube_actuser_remain',
        //版本升级
        data_aos_updateurl: 'log/post/nocache/s_amap_aos_cube_verupdate',
        //响应时长
        data_aos_rsptime: '/log/post/nocache/s_amap_aos_cube_qos_service_rsptime',
        //包量
        data_aos_datasize: '/log/post/nocache/s_amap_aos_cube_qos_service_datasize',
        //服务接口
        data_aos_service: '/log/post/nocache/s_amap_aos_cube_servpv',
        //服务接口pvuv
        data_aos_service_pvuv: '/log/post/nocache/s_amap_aos_cube_servpvuv',
        //新服务接口pvuv
        data_aos_channelpvuv: '/log/post/nocache/s_amap_aos_cube_servchannelpvuv',
        //活跃天数
        data_aos_daycounts: '/log/post/nocache/s_amap_aos_cube_actuser_daycounts',
        //月活
        data_aos_monthlyactuser: '/log/post/nocache/s_amap_aos_cube_monthlyactuser',
        //分平台，分周、月活跃天数分布
        data_aos_actdistribute: '/log/post/nocache/s_amap_aos_cube_actuser_dayuser',
        //分平台，分周、月平均活跃天数
        data_aos_actuseravgdays: '/log/post/nocache/s_amap_aos_cube_actuser_avgdays',
        //周用户构成
        data_aos_cube_wact_constit_b: '/log/post/nocache/s_amap_aos_cube_wact_constit_b',
        //月用户构成
        data_aos_cube_mact_constit: '/log/post/nocache/s_amap_aos_cube_mact_constit',


        /**************************搜索专题************************/
        //搜索关键字
        data_aos_searchcharts: '/log/post/nocache/s_amap_aos_cube_searchcharts',
        //搜索关键字总榜
        s_amap_aos_cube_searchcharts_alltop: '/log/post/nocache/s_amap_aos_cube_searchcharts_alltop',
        //搜索关键字  分地市
        s_amap_aos_cube_searchcharts_city: '/log/post/nocache/s_amap_aos_cube_searchcharts_city',
        //搜索关键字  分时
        s_amap_aos_cube_searchcharts_period: '/log/post/nocache/s_amap_aos_cube_searchcharts_period',
        //搜索专题 分类榜
        s_amap_aos_cube_searchcharts_typekwtop: '/log/post/nocache/s_amap_aos_cube_searchcharts_typekwtop',
        //搜索波动
        s_amap_aos_cube_searchmonitor: '/log/post/nocache/s_amap_aos_cube_searchmonitor',
        //泛搜索排行
        s_amap_aos_cube_searchcharts_fankeywordtop: '/log/post/nocache/s_amap_aos_cube_searchcharts_fankeywordtop',
        /**************************搜索专题************************/

        //漏斗pv
        data_aos_page_funnel_pv: '/log/post/nocache/s_amap_aos_cube_page_funnelpv',
        //漏斗uv
        data_aos_page_funnel_uv: '/log/post/nocache/s_amap_aos_cube_page_funneluv',
        //实时表
        data_aos_page_realtime: '/log/post/nocache/s_amap_aos_cube_nearrealtime_indicators_pv',
        //data_aos_page_realtime: '/log/post/nocache/s_amap_aos_cube_nearrealtime_indicators',

		//应用分析
		data_lbs_appanalysis: '/log/post/nocache/s_amap_open_cube_appanalysis',
		//LbsCloud服务应用
		data_lbs_cloudservapp: '/log/post/nocache/s_amap_open_cube_cloudservapp',
		//Locate服务接口
		data_lbs_locateservapi: '/log/post/nocache/s_amap_open_cube_locateservapi',
		//RestApi服务应用
		data_lbs_restservapp: '/log/post/nocache/s_amap_open_cube_restservapp',
		//服务加载
		data_lbs_serviceinit: '/log/post/nocache/s_amap_open_cube_serviceinit',
		//RestApi服务应用(key)
		data_lbs_restservappkey: '/log/post/nocache/s_amap_open_cube_restservappkey',
		//服务加载(key)
		data_lbs_serviceinitkey: '/log/post/nocache/s_amap_open_cube_serviceinitappkey',
		//服务应用(key)
		data_lbs_servverappkey: '/log/post/nocache/s_amap_open_cube_servverappkey',
		//Locate服务接口(带key)
		data_lbs_locateservappkey: '/log/post/nocache/s_amap_open_cube_locateservappkey',
		//服务后端耗时响应区间
		data_lbs_servrspareaend: '/log/post/nocache/s_amap_open_cube_servrspareaend',
		//服务请求总耗时响应区间
		data_lbs_servrspareareq: '/log/post/nocache/s_amap_open_cube_servrspareareq',
		//云图-累积终端表
		data_lbs_accdevices_lbscloud: '/log/post/nocache/s_amap_open_cube_accdevices_lbscloud',
		//云图-日新增设备
		data_lbs_newdevices_lbscloud: '/log/post/nocache/s_amap_open_cube_newdevices_lbscloud',
		//云图-日活跃设备
		data_lbs_actdevices_lbscloud: '/log/post/nocache/s_amap_open_cube_actdevices_lbscloud',
		//云图-日活跃用户表
		data_lbs_actusers_lbscloud: '/log/post/nocache/s_amap_open_cube_actusers_lbscloud',
		//云图-用户服务调用表
		data_lbs_userservice_lbscloud: '/log/post/nocache/s_amap_open_cube_userservice_lbscloud',
		//服务响应时长
		data_lbs_servrsptime: 's_amap_open_cube_servrsptime',
		//行政区划定位接口PV
		data_lbs_adcode_dlocate: 's_amap_lbs_cube_adcode_dlocate',
		//行政区划定位接口PV
		data_lbs_adcode_hlocate: 's_amap_lbs_cube_adcode_hlocate',
		//商圈定位接口PV
		data_lbs_business_dlocate: 's_amap_lbs_cube_business_dlocate',
		//商圈定位接口PV
		data_lbs_business_hlocate: 's_amap_lbs_cube_business_hlocate',
		// 自定义事件PV UV
        data_aos_pagepvuv: '/log/post/nocache/s_amap_aos_cube_page',
        // aos PV UV
        data_aos_htmlpvuv: '/log/post/nocache/s_amap_aos_cube_html',
        // page PV UV
        data_page_htmlpvuv: '/log/post/nocache/s_amap_page_cube_html',
        // aos事件 para
        data_aos_htmlpara: '/log/post/nocache/s_amap_aos_cube_html_toppara',
        // page事件 para
        data_page_htmlpara: '/log/post/nocache/s_amap_page_cube_html_toppara',
        // 事件 para
        data_aos_pagepara: '/log/post/nocache/s_amap_aos_cube_page_toppara',
        //在线H5事件的信息
        data_aos_h5para: '/log/post/nocache/s_amap_aos_cube_h5para',
        //离线H5事件的信息
        data_app_h5para: '/log/post/nocache/s_amap_app_cube_h5para',
        // crash android
        data_aos_crash_android: '/log/post/nocache/s_amap_aos_cube_crash_android',

        data_aos_crash_android_today: '/log/post/nocache/s_amap_aos_cube_crash_android',
        // crash ios
        data_aos_crash_ios: '/log/post/nocache/s_amap_aos_cube_crash_ios',

        data_aos_crash_ios_today: '/log/post/nocache/s_amap_aos_cube_crash_ios',

        data_aos_start: '/log/post/nocache/s_amap_aos_cube_div_starts',
        // mlog
        data_lbs_mlog: '/log/post/nocache/s_amap_mlog_cube_src',
        // mlog 操作
        data_lbs_mlog_operatepvuv: '/log/post/nocache/s_amap_mlog_cube_operatepvuv',
        // mlog	页面
        data_lbs_mlog_pagepvuv: '/log/post/nocache/s_amap_mlog_cube_pagepvuv',

        // 出行总体 PV UV
        data_aos_transfer_pvuv: '/log/post/nocache/s_amap_aos_cube_transfer',
        // 出行bus  PV UV
        data_aos_transfer_buspvuv: '/log/post/nocache/s_amap_aos_cube_transfer_bus',
        // 出行car PV UV
        data_aos_transfer_carpvuv: '/log/post/nocache/s_amap_aos_cube_transfer_car',
        // 出行walk PV UV
        data_aos_transfer_walkpvuv: '/log/post/nocache/s_amap_aos_cube_transfer_walk',

        //机型活跃
        data_aos_device_act: '/log/post/nocache/s_amap_aos_cube_device_act',
        //机型活跃（网络等）
        data_aos_device_net_act: '/log/post/nocache/s_amap_aos_cube_device_net_act',
        //机型新增
        data_aos_device_new: '/log/post/nocache/s_amap_aos_cube_device_new',
        //用户流失
        s_amap_aos_cube_churnuser: '/log/post/nocache/s_amap_aos_cube_churnuser',
        //用户回流
        s_amap_aos_cube_wact_constit: '/log/post/nocache/s_amap_aos_cube_wact_constit',
        //离线下载
        s_amap_aos_cube_cdn_download:'/log/post/nocache/s_amap_aos_cube_cdn_download',
        //离线下载数据
        s_amap_aos_cube_cdn_all:'/log/post/nocache/s_amap_aos_cube_cdn_all',
        //离线城市
        s_amap_aos_cube_cdn_city:'/log/post/nocache/s_amap_aos_cube_cdn_city',
        //离线设备
        s_amap_aos_cube_cdn_device:'/log/post/nocache/s_amap_aos_cube_cdn_device',
        //离线CDN结点下载
        s_amap_aos_cube_cdn_node:'/log/post/nocache/s_amap_aos_cube_cdn_node',
        /****************************************************维度数据源**************************************************************/
        //平台
        dict_platform: 'log/s_amap_aos_dict_platform',
        //版本
        dict_version: '/log/post/nocache/s_amap_aos_dict_version',
        //渠道信息
        dict_channel: 'log/post/nocache/s_amap_aos_dict_channelinfo',
        //省份
        dict_province: 'log/post/nocache/s_amap_dict_adcode',
        //adcode
        dict_adcode: 'log/s_amap_dict_adcode',
        //服务channel
        service_channel: 'log/post/nocache/s_amap_aos_dict_servchannel',
        //商圈
        dict_business: 'log/s_amap_dict_business',
        //pkg
        dict_pkgmapping: 's_amap_lbs_dict_pkgmapping',
        // 网络类型
        dict_nettype: 'log/post/nocache/s_amap_aos_dict_nettype',
        // 网络运营商
        dict_netop: 'log/post/nocache/s_amap_aos_dict_netop',
        // 服务渠道
        dict_servicechannel: 'log/post/nocache/s_amap_aos_dict_servicechannel',
        // 漏斗
        dict_funnel: 'log/post/nocache/s_amap_aos_dict_funnel',
        // 漏斗步骤
        dict_funstep: 'log/post/nocache/s_amap_aos_dict_funstep',
        // 点击事件
        dict_clickinfo: 'log/post/nocache/s_amap_aos_dict_clickinfo',
        // 自定义事件
        dict_eventslist: 'log/post/nocache/s_amap_aos_dict_clickinfo',
        //渠道推广情况
        dict_dicinfo: 'log/post/nocache/s_amap_aos_dict_dicinfo',
        //页面点击操作表
        dict_pageclickinfo: 'log/post/nocache/s_amap_mlog_dict_pageclickinfo',

        /********************************************************实时数据***************************************************************/
        realtime_server: 'http://qmx.amap.com',

        hbase_actuser: 'log/post/nocache/amap_aos_realtime_actuser',
        hbase_newuser: 'log/post/nocache/amap_aos_realtime_newuser',
        hbase_pv: 'log/post/nocache/amap_aos_realtime_startnumbers',
        hbase_performance: 'log/post/nocache/amap_qos_performance_rsptime',
        hbase_performance_qps: 'log/post/nocache/amap_qos_performance_qps',
        /**************uc数据获取*********************/
        uc_newactjoin: 'log/post/nocache/s_amap_aos_uc_newactjoin',
        uc_daydecay: 'log/post/nocache/s_amap_aos_uc_daysdecay',
        uc_refernew: 'log/post/nocache/s_amap_aos_spam_newuserevacount',


        /**************离线日志查询***************/
        offline_log_search: '/log/offline/odps/orign',
        offline_tablecolumn: '/log/offline/tablecolumn',

        offlinelogsearch_server: 'http://qmx.amap.com',
        //offlinelogsearch_server:'http://localhost:9093',
        sns_table: 'autonavi_aos_dw.s_amap_aos_raw_sns_beijing',
        maps_table: 'autonavi_aos_dw.s_amap_aos_raw_maps_beijing,autonavi_aos_dw.s_amap_aos_raw_maps_shanghai',
        oss_table: 'autonavi_aos_dw.s_amap_aos_raw_oss_beijing',
        mps_table: 'autonavi_aos_dw.s_amap_aos_raw_mps_beijing,autonavi_aos_dw.s_amap_aos_raw_mps_shanghai',
        crash_ios_table: 'autonavi_aos_da.s_amap_aos_cube_crash_ios',
        crash_android_table: 'autonavi_aos_da.s_amap_aos_cube_crash_android',
        mid_page_table: 'autonavi_aos_dw.s_amap_aos_mid_page',
        //crash_ios_table:'autonavi_aos_dw_dev.s_amap_aos_temp_yml_test_multicolumns',
        //crash_android_table:'autonavi_aos_dw_dev.s_amap_aos_temp_yml_test_multicolumns,autonavi_aos_dw_dev.s_amap_aos_temp_yml_test_multicolumns',

        sns_column: 'content',
        maps_column: 'content',
        oss_column: 'content',
        mps_column: 'content',
        crash_ios_column: 'd_content',
        crash_android_column: 'd_content',
        crash_android_column: 'd_content',
        mid_page_column: 'd_content',

//		offlinelogsearch_server:'http://qmx.amap.com',
//		sns_table:'autonavi_aos_dw.s_amap_aos_raw_sns_beijing',
//		maps_table:'autonavi_aos_dw.s_amap_aos_raw_maps_beijing,autonavi_aos_dw.s_amap_aos_raw_maps_shanghai',
//		oss_table:'autonavi_aos_dw.s_amap_aos_raw_oss_beijing',
//		mps_table:'autonavi_aos_dw.s_amap_aos_raw_mps_beijing,autonavi_aos_dw.s_amap_aos_raw_mps_shanghai',
//		crash_ios_table:'autonavi_aos_da.s_amap_aos_cube_crash_ios',
//		crash_android_table:'autonavi_aos_da.s_amap_aos_cube_crash_android'


        /**************离线日志查询***************/

        //反爬虫
        aos_anticrawler: 'log/post/nocache/s_amap_aos_anticrawler_blockip_effect2',
        aos_anticrawler_summary: 'log/post/nocache/s_amap_aos_anticrawler_blockip_effect_summary_total'
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