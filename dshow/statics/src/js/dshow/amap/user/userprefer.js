/**
 * Created by telen on 16/2/24.
 */
require(['dataloader', 'toastr', 'datautils', 'datasource', 'md5', 'utils', "promise-util"],
    function (dataloader, toastr, datautils, datasource, md5, utils, promiseUtil) {

        var column_keys = [
            "u_prefer_autos_1",
            "u_prefer_foods_1",
            "u_prefer_shops_1",
            "u_prefer_lifes_1",
            "u_prefer_leisures_1",
            "u_prefer_healths_1",
            "u_prefer_hotels_1",
            "u_prefer_scenerys_1",
            "u_prefer_edus_1",
            "u_prefer_traffics_1",
            "u_prefer_banks_1",
            "u_prefer_roads_1",
            "u_prefer_others_1",
            //"u_prefer_autos_2",
            //"u_prefer_foods_2",
            //"u_prefer_shops_2",
            //"u_prefer_lifes_2",
            //"u_prefer_leisures_2",
            //"u_prefer_healths_2",
            //"u_prefer_hotels_2",
            //"u_prefer_scenerys_2",
            //"u_prefer_edus_2",
            //"u_prefer_traffics_2",
            //"u_prefer_banks_2",
            //"u_prefer_roads_2",
            //"u_prefer_others_2",
            //"u_prefer_autos_3",
            //"u_prefer_foods_3",
            //"u_prefer_shops_3",
            //"u_prefer_lifes_3",
            //"u_prefer_leisures_3",
            //"u_prefer_healths_3",
            //"u_prefer_hotels_3",
            //"u_prefer_scenerys_3",
            //"u_prefer_edus_3",
            //"u_prefer_traffics_3",
            //"u_prefer_banks_3",
            //"u_prefer_roads_3",
            //"u_prefer_others_3"
        ];

        var columnNameMapping1 = {
            "u_prefer_autos_1": "汽车",
            "u_prefer_foods_1": "美食",
            "u_prefer_shops_1": "购物",
            "u_prefer_lifes_1": "生活服务",
            "u_prefer_leisures_1": "休闲娱乐",
            "u_prefer_healths_1": "医疗保健",
            "u_prefer_hotels_1": "酒店",
            "u_prefer_scenerys_1": "景区",
            "u_prefer_edus_1": "科教文化",
            "u_prefer_traffics_1": "交通设施",
            "u_prefer_banks_1": "金融保险",
            "u_prefer_roads_1": "道路附属",
            "u_prefer_others_1": "其他"
        };

        var DIU = '',
            key = '',
            PreferDATA = {},
            Feedback = {},
            Feedback_column = ['overview_feedback'];

        datautils.getUserInfoAsync().then(data => {

            DIU = data['result'].udid;

            if (DIU) {
                $('#udiu').val(DIU);
            }

        });

        /**
         * fetch prefer data with specific DIU
         * @param diu
         */
        var loadDIU = function(diu) {

            key = md5.hex_md5(diu);

            dataloader.get(key,
                datasource.getSource('user_prefer'),
                {
                    source: 'home',
                    type: 'post'
                },
                function(data) {

                    if (data.length) {
                        PreferDATA = data[0][key];

                        if (data[0][key]) {

                            var chartSeries = processData(PreferDATA);

                            if (chart.series.length)
                                chart.series[0].remove();

                            chart.addSeries({
                                name: '一级类目偏好',
                                colorByPoint: true,
                                data: chartSeries
                            });

                            Feedback = PreferDATA['overview_feedback'];

                            feedbackControl(Feedback);
                        }
                    } else {
                        if (chart.series.length)
                            chart.series[0].remove();
                    }

                }
            );
        };

        $('#reset_diu_btn').click(function(e) {
            if ($('#udiu').val()) {
                loadDIU($('#udiu').val());
            }
        });

        /**
         *
         * @param data
         * @returns {Array}
         */
        var processData = function(data) {

            var chartSeries = [];

            column_keys.forEach(function(column) {
                if (data[column]) {

                    var u1 = data[column].split(';');

                    if (column.indexOf('_1')) { // 一级类目

                        var subCategory = processSubCategory(u1, column.replace(/\d/, "2"));

                        var oneSum = 0;
                        subCategory.forEach(function(item) { // 一级类目偏好总数
                            oneSum += item.y;
                        });

                        chartSeries.push({
                            name: columnNameMapping1[column],
                            y: oneSum,
                            color: preferCategoryColor(oneSum).color,
                            colorGrade: preferCategoryColor(oneSum).name,
                            drilldown: column.replace(/\d/, "2")
                        });
                    }

                    if (column.indexOf('_2')) { // 二级类目

                    }

                    if (column.indexOf('_3')) { // 三级类目

                    }
                }
            });

            return chartSeries;

        };

        var processSubCategory = function(data, drilldown) {
            var seriesPoints = []; // 单类目下的子类目

            data.forEach(function(item) {
                var preferPair = item.split(':');
                var preferItemObj = {
                    code: preferPair[0],
                    y: Number.parseFloat(preferPair[1]),
                    color: preferCategoryColor(Number.parseFloat(preferPair[1])).color,
                    colorGrade: preferCategoryColor(Number.parseFloat(preferPair[1])).name,
                    name: PreferDic[preferPair[0]],
                    drilldown: drilldown
                };
                seriesPoints.push(preferItemObj);
            });

            return seriesPoints;
        };

        var preferCategoryColor = function(val) {
            var color = '#aaeeee';
            if (val > 5) { // 4
                color = { color: '#ff0066', name: '强' };
            } else if (val <= 5 && val > 3) { // 3
                color = { color: '#006fb5', name: '偏强' };
            } else if (val <= 3 && val > 1) { // 2
                color = { color: '#55bf3b', name: '中等' };
            } else if (val <= 1 && val > 0.1) { // 1
                color = { color: '#7798bf', name: '偏弱' };
            } else if (val <= 0.1 && val > 0.01) { // 0
                color = { color: '#aaeeee', name: '若' };
            }

            return color;
        }


        Highcharts.theme = {
            colors: ["#006FB5", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
                "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"]
        };

        // Apply the theme
        Highcharts.setOptions(Highcharts.theme);

        $('#demo-chart').highcharts({

            credits: {
                enabled: false
            },
            chart: {
                type: 'column',
                events: {
                    load: function() {

                        if (DIU) {
                            loadDIU(DIU);
                        } else {
                            datautils.getUserInfoAsync().then(data => {

                                DIU = data['result'].udid;

                                if (DIU) {
                                    $('#udiu').val(DIU);
                                }
                                loadDIU(DIU);
                            });
                        }

                    },
                    drillup: function () {
                        Feedback_column.pop();

                        feedbackControl(PreferDATA[Feedback_column[Feedback_column.length - 1]]);

                        if (Feedback_column.length == 1) {
                            $('#reset_diu_btn').attr('disabled', false);
                            chart.setTitle(null, {text: '一级类目'});
                        }
                        if (Feedback_column.length == 2) {
                            chart.setTitle(null, {text: '二级类目'});
                        }
                    },
                    drilldown: function (e) {

                        if (!e.seriesOptions) {
                            var chart = this;

                            $('#reset_diu_btn').attr('disabled', true);
                            // e.point.name is info which bar was clicked
                            chart.showLoading('Loading ...');

                            var u1 = PreferDATA[e.point.drilldown].split(';');
                            var feedbackColumn = e.point.drilldown + '_feedback';


                            if (e.point.drilldown.indexOf('_3') != -1) {

                            }
                            var subCategory = processSubCategory(u1,
                                e.point.drilldown.indexOf('_3') != -1 ? null : e.point.drilldown.replace(/\d/, "3"));

                            var data = {
                                name: e.point.drilldown.indexOf('_3') != -1 ? '三级类目偏好' : '二级类目偏好',
                                id: e.point.drilldown,
                                data: subCategory
                            };

                            chart.hideLoading();
                            chart.addSeriesAsDrilldown(e.point, data);

                            Feedback_column.push(feedbackColumn);

                            feedbackControl(PreferDATA[Feedback_column[Feedback_column.length - 1]]);

                            if (Feedback_column.length == 2) {
                                chart.setTitle(null, {text: '二级类目'});
                            }
                            if (Feedback_column.length == 3) {
                                chart.setTitle(null, {text: '三级类目'});
                            }
                        }
                    }
                }
            },

            title: {
                text: '类目偏好'
            },
            subtitle: {
                text: '一级类目'
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: null
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.3f}'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.3f}</b> <br/><span style="font-style: italic">{point.colorGrade}</span> '
            },

            series: [{
                name: 'Prefers',
                data: []
            }],

            drilldown: {
                series: []
            }
        });

        var chart = $("#demo-chart").highcharts();


        /**
         * 反馈面板控制
         * @param content
         */
        var feedbackControl = function(content) {
            if (!content) {
                $('.switch').show();
                $('.switch2').hide();
            } else {
                $('.switch').hide();
                $('.switch2').show();
            }
        };

        /**
         * 反馈提交
         */
        $('#feedback_form_submit').click(function(e) {
            var feedback = {
                timestamp: new Date().format('yyyy-MM-dd hh:mm:ss')
            };

            $.each($('#feedback_form').serializeArray(), function(_, kv) {
                feedback[kv.name] = kv.value;
            });

            if (!feedback['feedback_iscorrect']) {
                toastr.warning('请点选反馈准确与否');
                return;
            }
            if (feedback['feedback_iscorrect'] == '-1' && feedback['feedback_reason'].trim().length == 0) {
                toastr.warning('反馈不准确请留下意见，谢谢');
                return;
            }


            var pkey = 'f:' + Feedback_column[Feedback_column.length - 1];
            var param = {};
            param[pkey] = JSON.stringify(feedback);

            dataloader.put(key, datasource.getSource('user_prefer'), {
                source: 'home',
                type: 'post',
                params: param
            }, function (data) {
                if (data && data['status'] == 'failed') {
                    toastr.error('您的反馈提交失败');
                } else {
                    toastr.info('您的反馈已经提交成功');

                    $('#feedback_form')[0].reset();
                    PreferDATA[Feedback_column[Feedback_column.length - 1]] = JSON.stringify(feedback);
                    feedbackControl(JSON.stringify(feedback));
                }
            });
        });

    }
);