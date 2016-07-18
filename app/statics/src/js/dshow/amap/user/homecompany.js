require(['dataloader', 'toastr', 'datautils', 'datasource', 'md5', 'utils', "promise-util", "directives", "services"],
    function (dataloader, toastr, datautils, datasource, md5, utils, promiseUtil) {
        promiseUtil.errorAsRejected()
        $('#mapContainer').css('min-height', '1000px;');//解决默认div高度为0的时候，zoom不起作用的情况
        var map = new AMap.Map('mapContainer', {
            resizeEnable: true,
            rotateEnable: true,
            dragEnable: true,
            zoomEnable: true,
            view: new AMap.View2D({
                center: new AMap.LngLat(116.397428, 39.90923),
                zoom: 12
            })
            // tileUrl:"http://mt{1,2,3,0}.google.cn/vt/lyrs=m@142&hl=zh-CN&gl=cn&x=[x]&y=[y]&z=[z]&s=Galil"
            // //取图地址
            // })]
        });
        map.plugin(["AMap.ToolBar"], function () {
            toolBar = new AMap.ToolBar();
            map.addControl(toolBar);
        });

        var isloginUser = false;
        var diu


        /**
         * 根据高德坐标系获取地址信息
         * @return jquery的延迟对象
         *
         */
        function getAddress(x, y) {
            var deferred = $.Deferred()
            AMap.service(["AMap.Geocoder"], function () {
                var MGeocoder = new AMap.Geocoder({
                    radius: 1000,
                    extensions: "all"
                })
                //逆地理编码
                MGeocoder.getAddress(new AMap.LngLat(x, y), function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        deferred.resolve(result)
                    }
                })
            })
            return deferred
        }


        /**
         * @param {Object} windowData
         * @param windowData.score
         * @param windowData.p1
         * @param windowData.p2
         * @param windowData.updatetime
         * @param {Object} gd
         * @param gd.x
         * @param gd.y
         */
        function _createInfowindow(title, windowData, gd, regeocode) {
            var info = [];
            windowData = windowData || {}
            info.push('<div class="panel panel-default" style="margin: 0px; padding: 0px;">');
            info.push('<div class="panel-heading" style="padding-bottom: 4px;font-size:14px;">');
            info.push('<span>' + title + '</span>');
            info.push('</div>');
            info.push('<div style="padding-top: 5px; padding-bottom: 10px">');
            info.push('<span class="label label-secondary">高德坐标系</span>&nbsp;' + gd.y + "," + gd.x);
            if (windowData.x && windowData.y) {
                info.push('<br><span class="label label-secondary">gps坐标系</span>&nbsp;' + windowData.y + "," + windowData.x);
            }
            info.push('<br><span class="label label-secondary">地址</span>&nbsp;' + regeocode['formattedAddress']);
            if (windowData.score) {
                info.push('<br><span class="label label-secondary">分数</span>&nbsp;' + windowData.score);
            }
            if (windowData.p1) {
//			info.push('<br><span class="label label-secondary">置信区间上限</span>&nbsp;' + windowData.p2); 
                info.push('<br><span class="label label-secondary">置信区间下限</span>&nbsp;' + windowData.p1);
            }
            if (windowData.updatetime) {
                info.push('<br><span class="label label-secondary">更新时间</span>&nbsp;' + windowData.updatetime)
            }
            info.push('</div>');

//		info.push('<div style="padding-bottom: 4px;font-size:14px;">'); 
//		info.push('<span class="label label-secondary">附近POI</span>'); 
//		info.push('</div>'); 
//		info.push('<div >'); 
//		info.push('<table style="width: 100%;" class="poi-table">')
//		for(var index in regeocode['pois']){
//			info.push('<tr style="background-color: ' + (index % 2 === 0 ?  '#eee' : '#fff') + '"><td><a href="javascript: void(0);"   data-position="' + regeocode['pois'][index]['location'].toString()  + '">' + regeocode['pois'][index]['name'] + '</a></td></tr>');
//		}
//		info.push('</table>')
//		info.push('</div>'); 
//		info.push('</div>');

            var infoWindow = new AMap.InfoWindow({
                content: info.join(''),
                offset: new AMap.Pixel(0, -20)
            });
            return infoWindow;
        }

        var specify = {};
        if (true) {
            $('button[id$="specify"]').click(function () {
                var id = $(this).attr('id');
                var type = id.substring(0, id.indexOf('_specify'));
                var icon = (type == 'home' ? '8' : '3');
                var x = $('#' + type + '_x').val().trim();
                var y = $('#' + type + '_y').val().trim();
                if (x == '' && y == '') {
                    x = map.getCenter().getLng() + Math.random() * 0.0001;
                    y = map.getCenter().getLat() + Math.random() * 0.0001;
                }
                if (specify[type] != undefined) {
                    specify[type].setMap(null);
                }

                specify[type] = new AMap.Marker({
                    icon: 'http://webapi.amap.com/images/' + icon + '.png',
                    position: new AMap.LngLat(x, y),
                    draggable: true,
                    cursor: 'move'
                });

                AMap.event.addListener(specify[type], 'dragging', function (e) {
                    $('#' + type + '_x').val(specify[type].getPosition().getLng());
                    $('#' + type + '_y').val(specify[type].getPosition().getLat());
                });
                specify[type].setMap(map);
                map.setFitView();

            });

            $('button[id$="specify"]').dblclick(function () {
                var id = $(this).attr('id');
                var type = id.substring(0, id.indexOf('_specify'));
                if (specify[type] != undefined) {
                    specify[type].setMap(null);
                }
            });
        }


        $('#submit').click(function () {
            var userId = md5.hex_md5(diu);
            var home_check = $('input:radio[name="home_check"]:checked').val();
            var company_check = $('input:radio[name="company_check"]:checked').val();
            var home_x = $('#home_x').val().trim();
            var home_y = $('#home_y').val().trim();
            var company_x = $('#company_x').val().trim();
            var company_y = $('#company_y').val().trim();

            if (userId == '') {
                toastr.error('无法获取您的唯一标识，请在高德地图客户端登陆该账号后, 重新查找、更新');
                return;
            }

            var checkObj, homeObj, compObj;

            if (home_check != '' && company_check != '') {
                homeObj = dataloader.put(userId, datasource.getSource('dshow_home_company'), {
                    source: 'home',
                    type: 'post',
                    params: {
                        'f:home_check': home_check,
                        'f:company_check': company_check
                    }
                }, function (data) {
                    if (data && data['status'] == 'failed') {
                        toastr.error('您的反馈提交失败');
                    } else {
                        toastr.info('您的反馈已经提交成功');
                    }
                });
            }

            if (home_check == '-1') {
                if (home_x != '' && home_y != '') {
                    homeObj = dataloader.put(userId, datasource.getSource('dshow_home_company'), {
                        source: 'home',
                        type: 'post',
                        params: {
                            'f:home_x': home_x,
                            'f:home_y': home_y
                        }
                    }, function (data) {
                        toastr.info('您家的位置已经更新成功');
                    });
                }
            }
            if (company_check == '-1') {
                if (company_x != '' && company_y != '') {
                    compObj = dataloader.put(userId, datasource.getSource('dshow_home_company'), {
                        source: 'home',
                        type: 'post',
                        params: {
                            'f:company_x': company_x,
                            'f:company_y': company_y
                        }
                    }, function (data) {
                        toastr.info('您公司的位置已经更新成功');
                    });
                }
            }
        });


        $('#home_check').css('display', 'none');
        $('#company_check').css('display', 'none');

        $('input:radio[name$="_check"]').click(function () {
            var v = $(this).val();
            var index = $(this).attr('name') ? $(this).attr('name').indexOf('_check') : 0;
            var type = $(this).attr('name').substring(0, index);
            if (v == -1) {
                $('#' + $(this).attr('name')).css('display', 'block');
            } else {
                specify[type] ? specify[type].setMap(null) : true;
                $('#' + $(this).attr('name')).css('display', 'none');
            }
        });
        var app = angular.module("app", ["directives", "services"])
        app.config(['$locationProvider', function($locationProvider) {
            $locationProvider.html5Mode(true);
        }]);
        app.controller("appCtrl", ["$scope", "applyService", "$location", function ($scope, applyService, $location) {
            applyService.wrapApply()
            dataloader.ajaxFailHint()
            $scope.searchTypeList = ["gps", "gd", "diu"]
            $scope.type = "diu"
            $scope.changeSearchType = function () {
                var index = $scope.searchTypeList.indexOf($scope.type)
                if (++index >= $scope.searchTypeList.length) {
                    index = 0
                }
                $scope.type = $scope.searchTypeList[index]
            }
            $scope.nullHint = {
                x: "无经度信息",
                y: "无纬度信息",
                regeocode: {
                    formattedAddress: "无相关位置信息"
                }
            }
            $scope.searchForm = {
                userIdOrLngLat: ""
            }
            var ruler
            map.plugin(["AMap.RangingTool"], function () {
                ruler = new AMap.RangingTool(map)
                AMap.event.addListener(ruler, "end", function (e) {
                    ruler.turnOff()
                    $scope.openRuler = false
                    applyService.$apply()
                })
            })
            $scope.openRuler = false
            $scope.toggleRuler = function () {
                $scope.openRuler = !$scope.openRuler
                if ($scope.openRuler) {
                    ruler.turnOn()
                } else {
                    ruler.turnOff()
                }
            }
            $scope.$watch("openRuler", function (val) {
                if (val) {
                    $scope.ruleTip = "量测中"
                } else {
                    $scope.ruleTip = "量测"
                }
            })
            /**
             * 是否挖掘到了家
             */
            function diggedHome(result) {
                return parseFloat(result.u_home_x) != 0 && parseFloat(result.u_home_y) != 0
            }

            /**
             * 是否挖掘到了公司
             */
            function diggedCompany(result) {
                return parseFloat(result.u_company_x) != 0 && parseFloat(result.u_company_y) != 0
            }

            function diggedPermanent(result) {
                return parseFloat(result.u_permanent_x) != 0 && parseFloat(result.u_permanent_y) != 0
            }

            /**
             * @param {string} lngLat "116.368904,39.920255"
             */
            function searchByLngLat(lngLat) {
                var deferred = $.Deferred()
                var locations = lngLat.split(",")
                var lngLatReg = /^\d+(\.\d+)?$/
                if (locations.length !== 2 || !lngLatReg.test(locations[0]) || !lngLatReg.test(locations[1])) {
                    deferred.reject("请输入正确格式的经纬度")
                } else {
                    var options = {
                        isGD: !!($scope.type === "gd"),
                        x: locations[1],
                        y: locations[0],
                        image: 'http://webapi.amap.com/images/custom_a_j.png',
                        imageOffset: new AMap.Pixel(0, 0),
                        windowTitle: "查询结果"
                    }
                    if ($scope.type === "gps") {
                        options.windowData = {
                            x: locations[1],
                            y: locations[0]
                        }
                    }
                    $scope.showInfoWindowAndMarker(options).then(function (data) {
                        setTimeout(function () {
                            $scope.openInfoWindow(data.infoWindow, data.marker)
                        }, 200)

                    })
                    deferred.resolve()
                }
                return deferred
            }

            /**
             * @param {Object}options
             * @param options.x经度
             * @param options.y纬度
             * @param options.size marker图标大小
             * @param options.image marker的图标
             * @param options.imageOffset marker图标的偏移
             * @param options.windowTitle 信息窗口的标题
             * @param options.windowData 信息窗口中展示的数据
             * @param options.isGD options.x,options.y是高德坐标系
             * @return $.deferred对象，resolve接收的参数为{regeocode,marker,infoWindow,x,y}
             */
            $scope.showInfoWindowAndMarker = function (options) {
                var deferred = $.Deferred()
                var gd
                var getAddressPromise
                if (options.isGD) {
                    gd = {
                        x: options.x,
                        y: options.y
                    }
                    getAddressPromise = getAddress(gd.x, gd.y)
                } else {
                    getAddressPromise = datautils.getGD(options.x, options.y).then(function (x, y) {
                        gd = {
                            x: x,
                            y: y
                        }
                        return getAddress(x, y)
                    })
                }
                getAddressPromise.then(function (address) {
                    var marker = new AMap.Marker({
                        position: new AMap.LngLat(gd.x, gd.y),
                        icon: new AMap.Icon({
                            size: options.size || new AMap.Size(28, 37),
                            image: options.image,
                            imageOffset: options.imageOffset
                        })
                    })
                    marker.setMap(map)
                    var regeocode = address['regeocode']
                    var infoWindow = _createInfowindow(options.windowTitle, options.windowData, gd, regeocode)
                    AMap.event.addListener(marker, 'click', function () {
                        infoWindow.open(map, marker.getPosition())
                    })
                    map.setFitView()
                    deferred.resolve({
                        regeocode: regeocode,
                        marker: marker,
                        infoWindow: infoWindow,
                        x: gd.x,
                        y: gd.y
                    })
                })
                return deferred
            }
            $scope.clearShowInfo = function () {
                $scope.showHomeSubscribe = false
                $scope.showHomeFeedback = false
                $scope.showHomeDig = false
                $scope.showCompanySubscribe = false
                $scope.showCompanyFeedback = false
                $scope.showCompanyDig = false
                $scope.showUserOperation = false
                $scope.showPermanentDig = false
                map.clearMap()
            }
            $scope.search = function () {
                $scope.clearShowInfo()
                var userIdOrLngLat = $scope.searchForm.userIdOrLngLat
                if ($scope.type !== "diu") {
                    searchByLngLat(userIdOrLngLat).fail(function (reason) {
                        toastr.warning(reason)
                    })
                    return
                }
                if (userIdOrLngLat == '') {
                    userIdOrLngLat = diu;
                }
                if (userIdOrLngLat == diu) {
                    isloginUser = true;
                    if (!diu) {
                        toastr.warning("账户信息不包含diu")
                        return
                    }
                } else {
                    isloginUser = false;
                }
                var userId_md5 = md5.hex_md5(userIdOrLngLat);
                dataloader.get(userId_md5, datasource.getSource('dshow_home_company'), {
                    source: 'home',
                    type: 'post',
                    disableErrCallback: true
                }, angular.noop).then(function (resData) {
                    var data = resData.result
                    var diggedNullHint = "查询结果为空(可能diu不正确或者挖掘结果为空)"
                    if (data && Object.keys(data).length > 0) {
                        var attr = data[0][userId_md5];
                        if (attr) {
                            //如果返回结果不包含家和公司信息
                            if (!diggedHome(attr) && !diggedCompany(attr)) {
                                if (diggedPermanent(attr)) {
                                    $scope.showInfoWindowAndMarker({
                                        x: attr.u_permanent_x,
                                        y: attr.u_permanent_y,
                                        image: 'http://webapi.amap.com/images/custom_a_j.png',
                                        imageOffset: new AMap.Pixel(-56, 0),
                                        windowTitle: '常驻地',
                                        windowData: {
                                            score: attr.u_permanent_score,
                                            p2: attr.u_permanent_confi_p2,
                                            p1: attr.u_permanent_confi_p1,
                                            updatetime: attr.u_permanent_updatetime,
                                            x: attr.u_permanent_x,
                                            y: attr.u_permanent_y
                                        }
                                    }).then(function (data) {
                                        $scope.showPermanentDig = true
                                        $scope.permanentDig = data
                                    })
                                }

                            } else {
                                $scope.showHomeDig = true
                                $scope.showCompanyDig = true
                                if (diggedHome(attr)) {
                                    $scope.showInfoWindowAndMarker({
                                        x: attr.u_home_x,
                                        y: attr.u_home_y,
                                        image: 'http://webapi.amap.com/images/custom_a_j.png',
                                        imageOffset: new AMap.Pixel(0, 0),
                                        windowTitle: '家的位置',
                                        windowData: {
                                            score: attr.u_home_score,
                                            p2: attr.u_home_confi_p2,
                                            p1: attr.u_home_confi_p1,
                                            updatetime: attr.u_home_updatetime,
                                            x: attr.u_home_x,
                                            y: attr.u_home_y
                                        }
                                    }).then(function (data) {
                                        $scope.homeDig = data
                                    })
                                } else {
                                    $scope.homeDig = $scope.nullHint
                                    applyService.$apply()
                                }
                                if (diggedCompany(attr)) {
                                    $scope.showInfoWindowAndMarker({
                                        x: attr.u_company_x,
                                        y: attr.u_company_y,
                                        image: 'http://webapi.amap.com/images/custom_a_j.png',
                                        imageOffset: new AMap.Pixel(-28, 0),
                                        windowTitle: '公司的位置',
                                        windowData: {
                                            score: attr.u_company_score,
                                            p2: attr.u_company_confi_p2,
                                            p1: attr.u_company_confi_p1,
                                            updatetime: attr.u_company_updatetime,
                                            x: attr.u_company_x,
                                            y: attr.u_company_y
                                        }
                                    }).then(function (data) {
                                        $scope.companyDig = data
                                        applyService.$apply()
                                    })
                                } else {
                                    $scope.companyDig = $scope.nullHint
                                    applyService.$apply()
                                }
                                dataloader.query(datasource.getSource('dshow_user_mytrafficxy'), {
                                    source: 'rds',
                                    debug: false,
                                    type: 'post',
                                    params: {
                                        match: 'u_diu:' + userIdOrLngLat,
                                    }
                                }, function (data) {
                                    if (data && data.length > 0) {
                                        $scope.updateSubscribe(data[0], attr)
                                    } else {
                                        $scope.updateFeedback(attr)
                                    }
                                })
                            }

                            if (isloginUser) {
                                $scope.showUserOperation = true
                                applyService.$apply()
                                attr['home_check'] ? $('input:radio[name="home_check"][value="' + attr['home_check'] + '"]').attr('checked', true) : true;
                                attr['company_check'] ? $('input:radio[name="company_check"][value="' + attr['company_check'] + '"]').attr('checked', true) : true;
                                attr['home_x'] ? $('#home_x').val(attr['home_x']) : true;
                                attr['home_y'] ? $('#home_y').val(attr['home_y']) : true;
                                attr['company_x'] ? $('#company_x').val(attr['company_x']) : true;
                                attr['company_y'] ? $('#company_y').val(attr['company_y']) : true;
                                $('input:radio[name="home_check"][value="' + attr['home_check'] + '"]').click();
                                $('input:radio[name="company_check"][value="' + attr['company_check'] + '"]').click();
                            }

                        } else {
                            toastr.warning(diggedNullHint);
                        }
                    } else {
                        toastr.warning(diggedNullHint);
                    }
                })
            }
            datautils.getUserInfoAsync().then(function (data) {
                var user = data;
                diu = user ? user['result']['udid'] : '';
                if ($location.search().diu) {
                    diu = $location.search().diu;
                    $scope.searchForm.userIdOrLngLat = diu;
                }
                $scope.search()
            })
            $scope.openInfoWindow = function (infoWindow, marker) {
                map.panTo(marker.getPosition())
                infoWindow.open(map, marker.getPosition())
            }
            /**
             * 在地图上和左侧显示反馈信息
             * @param {Object} homeAndCompany
             */
            $scope.updateFeedback = function (homeAndCompany) {
                var home_x = homeAndCompany.home_x
                var home_y = homeAndCompany.home_y
                var company_x = homeAndCompany.company_x
                var company_y = homeAndCompany.company_y
                if (homeAndCompany.home_check == "1") {
                    $scope.homeFeedback = {
                        right: true
                    }
                    $scope.showHomeFeedback = true
                    applyService.$apply()
                } else if (homeAndCompany.home_check == "-1") {
                    $scope.showInfoWindowAndMarker({
                        x: home_x,
                        y: home_y,
                        size: new AMap.Size(20, 28),
                        image: 'http://www.amap.com/img/poi.png',
                        imageOffset: new AMap.Pixel(-5, -138),
                        windowTitle: '家的反馈位置',
                        isGD: true
                    }).then(function (data) {
                        $scope.homeFeedback = data
                        $scope.homeFeedback.right = false
                        if (diggedHome(homeAndCompany)) {
                            datautils.getGD(homeAndCompany.u_home_x, homeAndCompany.u_home_y).then(function (gdx, gdy) {
                                var distance = utils.spherical_distance([gdx, gdy], [home_x, home_y])//home_x,home_y为反馈的坐标，使用高德坐标系
                                $scope.homeFeedback.distance = utils.decimal(distance, 3)
                            })
                        }
                        $scope.showHomeFeedback = true
                        applyService.$apply()
                    })
                }
                if (homeAndCompany.company_check == "1") {
                    $scope.companyFeedback = {
                        right: true
                    }
                    $scope.showCompanyFeedback = true
                    applyService.$apply()
                } else if (homeAndCompany.company_check == "-1") {
                    $scope.showInfoWindowAndMarker({
                        x: company_x,
                        y: company_y,
                        size: new AMap.Size(20, 28),
                        image: 'http://www.amap.com/img/poi.png',
                        imageOffset: new AMap.Pixel(-37, -138),
                        windowTitle: '公司反馈位置',
                        isGD: true
                    }).then(function (data) {
                        $scope.companyFeedback = data
                        $scope.companyFeedback.right = false
                        if (diggedCompany(homeAndCompany)) {
                            datautils.getGD(homeAndCompany.u_company_x, homeAndCompany.u_company_y).then(function (gdx, gdy) {
                                var distance = utils.spherical_distance([gdx, gdy], [company_x, company_y])
                                $scope.companyFeedback.distance = utils.decimal(distance, 3)
                            }, function () {

                            })
                        }
                        $scope.showCompanyFeedback = true
                        applyService.$apply()
                    })
                }
            }
            /**
             * 在地图上和左侧显示订阅信息
             */
            $scope.updateSubscribe = function (userInfo, homeAndCompany) {
                if (userInfo['u_start_x'] != 0 && userInfo['u_start_y'] != 0) {
                    $scope.showInfoWindowAndMarker({
                        x: userInfo['u_start_x'],
                        y: userInfo['u_start_y'],
                        size: new AMap.Size(20, 28),
                        image: 'http://www.amap.com/img/poi.png',
                        imageOffset: new AMap.Pixel(-5, -138),
                        windowTitle: "家的订阅位置",
                        isGD: true
                    }).then(function (data) {
                        $scope.homeSubscribe = data
                        if (diggedHome(homeAndCompany)) {
                            datautils.getGD(homeAndCompany.u_home_x, homeAndCompany.u_home_y).then(function (gdx, gdy) {
                                var distance = utils.spherical_distance([gdx, gdy], [userInfo['u_start_x'], userInfo['u_start_y']]);
                                $scope.homeSubscribe.distance = utils.decimal(distance, 3)
                            })

                        }
                        $scope.showHomeSubscribe = true
                    })
                }
                if (userInfo['u_end_x'] != 0 && userInfo['u_end_y'] != 0) {
                    $scope.showInfoWindowAndMarker({
                        x: userInfo['u_end_x'],
                        y: userInfo['u_end_y'],
                        size: new AMap.Size(20, 28),
                        image: 'http://www.amap.com/img/poi.png',
                        imageOffset: new AMap.Pixel(-37, -138),
                        windowTitle: "公司订阅位置",
                        isGD: true
                    }).then(function (data) {
                        $scope.companySubscribe = data
                        if (diggedCompany(homeAndCompany)) {
                            datautils.getGD(homeAndCompany.u_company_x, homeAndCompany.u_company_y).then(function (gdx, gdy) {
                                var distance = utils.spherical_distance([gdx, gdy], [userInfo['u_end_x'], userInfo['u_end_y']]);
                                $scope.companySubscribe.distance = utils.decimal(distance, 3)
                            })

                        }
                        $scope.showCompanySubscribe = true
                    })
                }
            }
        }])
        angular.bootstrap($("#ng-app")[0], [app.name])
    })
