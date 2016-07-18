require(['dataloader', 'toastr', 'datautils', 'datasource', 'md5', 'utils', 'opacitynumbermap', 'promise-util', 'dateutil', "d3", "directives", "services"],
    function (dataloader, toastr, datautils, datasource, md5, utils, OpacityNumberMap, promiseUtil, DateUtil, d3) {
        promiseUtil.promisifyAll(AMap)
        promiseUtil.errorAsRejected()
        var COUNTRY_LEVEL = 5
        var CITY_LEVEL = 10
        var STREET_LEVEL = 14
        var LEVEL_20 = 18
        var LEVEL_50 = 17
        var LEVEL_100 = 16
        var LEVEL_200 = 15
        var BATCH_SIZE = 3//某些用户活跃区域特别，导致页面卡死，分批次加载
        var position = new AMap.LngLat(116.397428, 39.90923)
        var map = window._map = new AMap.Map("mapContainer", {
            view: new AMap.View2D({
                center: position,
                zoom: COUNTRY_LEVEL,
                rotation: 0
            }),
            resizeEnable: true
            //lang: "zh_cn"
        })
        promiseUtil.promisifyAll(map)
        var gradient = {
            '0.1': 'rgb(0,0,255)',
            '0.2': 'rgb(117,211,248)',
            '0.4': 'rgb(0, 255, 0)',
            '0.5': 'rgb(255,250,0)',
            '1.0': 'rgb(255,0,0)'
        }
        var heatMap
        var setHeatMapDeferred = map.pluginAsync(["AMap.Heatmap"]).then(function () {
            heatMap = new AMap.Heatmap(map, {
                radius: 25,
                opacity: [0.2, 0.9],
                gradient: gradient
            })
        })
        map.plugin(["AMap.ToolBar"], function () {
            var tool = new AMap.ToolBar()
            map.addControl(tool)
        })
        var app = angular.module("app", ["directives", "services"])
        app.config(['$locationProvider', function($locationProvider) {
            $locationProvider.html5Mode(true);
        }]);
        app.controller("appCtrl", ["$scope", "$compile", "$filter", "applyService", "$location", function ($scope, $compile, $filter, applyService, $location) {
            applyService.wrapApply()
            dataloader.ajaxFailHint()
            $scope.closeAllPopover = function () {
                $(".area [aria-describedby^=popover]").popover("hide")
            }
            document.addEventListener("click", function (event) {
                if ($(event.target).parents(".popover").length === 0) {
                    $scope.closeAllPopover()
                }
            }, true)

            function setCssGradient() {
                var backgroundGradient = angular.copy(gradient)
                backgroundGradient[0] = backgroundGradient[Object.keys(backgroundGradient).sort()[0]]
                var opacityScale = getOpacityScale()
                var gradientStr = ""
                Object.keys(backgroundGradient).sort().forEach(function (index) {
                    gradientStr += backgroundGradient[index].replace(/\)/, "," + opacityScale(index) + ") " + index * 100 + "%" + ",")
                })
                gradientStr = gradientStr.replace(/rgb/g, "rgba")
                $scope.colorRuleStyle = {
                    background: "linear-gradient(to top," + gradientStr.replace(/,$/, ")")
                }
            }

            setCssGradient()
            $scope.scrollToArea = function (area) {
                var selector = "[city=" + area.city.order + "]"
                if ($(selector).find(".in.area-list").length === 0) {
                    $(selector).find("[data-toggle=collapse]").click()
                    setTimeout(function () {
                        $(selector + " [area=" + area.order + "]")[0].scrollIntoViewIfNeeded()
                    }, 500)
                } else {
                    $(selector + " [area=" + area.order + "]")[0].scrollIntoViewIfNeeded()
                }
            }
            $scope.selectArea = function (area) {
                $scope.cityList.forEach(function (city) {
                    city.areaList.forEach(function (area) {
                        area.selected = false
                    })
                })
                area.selected = true
                applyService.$apply()
            }
            $scope.viewArea = function (area) {
                var properLevel = getProperLevel(area)
                map.setZoomAndCenter(properLevel, new AMap.LngLat(area.centergdx, area.centergdy))
                if (properLevel < LEVEL_20) {
                    heatMap.setMap(null)
                } else {
                    heatMap.setMap(map)
                }
                $scope.selectArea(area)
                $scope.scrollToArea(area)
            }

            $scope.viewCity = function (city, $event) {
                $("#" + $($event.currentTarget).attr("collpase-id")).collapse("show")
                map.setCity(city.u_adcode)
            }
            $scope.viewTimeList = function (area, $event, scope) {
                var $target = $($event.currentTarget)
                if (!$target.data("_popover")) {
                    $target.data("_popover", true)
                    $target.popover({
                        html: true,
                        content: $target.parent().find(".time-list").html(),
                        container: "body",
                        trigger: "click"
                    })
                    $target.popover("show")
                }
            }
            $scope.searchForm = {
                diu: ""
            }


            $scope.search = function () {
                map.clearMap()
                if (typeof heatMap !== "undefined") {
                    heatMap.setMap(null)
                }
                $scope.progress = "0%"
                if ($scope.searching) {
                    toastr.warning("正在加载中...")
                    return
                }
                var diu = $scope.searchForm.diu || $scope.diu
                if (!diu) {
                    toastr.warning("账户信息不包含diu")
                    return
                }
                $scope.searching = true
                var md5Diu = md5.hex_md5(diu)
                loadCityList(md5Diu).fail(function (cause) {
                    if (cause instanceof Error) {
                        console.error(cause.stack)
                    }
                }).always(function () {
                    $scope.searching = false
                    drawByCityList()
                })
            }
            datautils.getUserInfoAsync().then(function (userData) {
                $scope.diu = userData ? userData['result']['udid'] : ''
                $scope.diu = $scope.diu
                if ($location.search().diu) {
                    $scope.diu = $location.search().diu;
                    $scope.searchForm.diu = $location.search().diu;
                }
                $scope.search()
            })
            $scope.$watch("progress", function (progress) {
                if (progress) {
                    $scope.progressStyle = {
                        width: progress
                    }
                }
            })

            /**
             *
             * 得到绘制的矩形区域的颜色和透明度
             * @param options
             * @param options.count 某个区域的访问次数
             * @param options.total 访问次数的最大值
             */
            function getColorAndOpacity(options) {
                var domain = Object.keys(gradient).sort()
                var range = domain.map(function (item) {
                    return gradient[item]
                })
                //range.push(range[range.length - 1])
                var colorScale = d3.scale.linear().domain(domain).range(range)
                var percent = options.count / options.total
                var color = colorScale(percent)
                var opacityScale = getOpacityScale()
                return {
                    color: color,
                    opacity: opacityScale(percent)
                }
            }

            function getOpacityScale() {
                return d3.scale.linear().domain([0, 1]).range([0.5, 0.5])
            }

            /**
             * 加载城市列表(包含了城市下的活跃区域信息)，加载完毕后，在$scope上添加了cityList属性
             * @param md5Diu md5加密过后的diu
             */
            function loadCityList(md5Diu) {
                var rowKey = md5Diu
                return dataloader.get(rowKey + ":" + rowKey + "~", datasource.getSource("dshow_permanent_city"), {
                    source: "home",
                    type: "post",
                    params: {
                        //"f:d_version": QUERY_DATE
                    }
                }, angular.noop).then(function (cityData) {
                    if (!cityData.result || cityData.result.length === 0) {
                        toastr.warning("查询结果为空(可能diu不正确或者挖掘结果为空)")
                        cityData.result = []
                    }
                    $scope.originCityList = cityData.result.map(function (city, i) {
                        var result = city[Object.keys(city)[0]]
                        result.order = i
                        result.u_visitcount = +result.u_visitcount
                        return result
                    })
                    $scope.cityList = []
                    $scope.originCityList = $filter("orderBy")($scope.originCityList, "u_visitcount", true)
                    return $scope.loadAll()
                })
            }

            $scope.loadMore = function ($event) {
                if ($scope.searching) {
                    return
                }
                loadMoreCityList().then(function () {
                    drawByCityList()
                })
            }
            $scope.loadAll = function () {
                var deferred = $.Deferred()
                //if ($scope.searching) {
                //    deferred.reject("正在加载中...")
                //    return deferred
                //}
                var INIT = 1
                var SENDING = 2
                var END = 3
                var loadCityQueue = []//这个队列的值最大为BATCH_SIZE
                var deferredList = []
                var loaded = 0

                function loadAllCityList() {
                    if ($scope.originCityList.length > 0) {
                        loadCityQueue = loadCityQueue.filter(function (item) {
                            return item.reqStatus !== END
                        })
                        if (loadCityQueue.length < BATCH_SIZE) {
                            var needLoadCityList = $scope.originCityList.splice(0, BATCH_SIZE - loadCityQueue.length)
                            loadCityQueue = loadCityQueue.concat(needLoadCityList.map(function (city) {
                                return {
                                    reqStatus: INIT,
                                    city: city
                                }
                            }))
                            $scope.cityList = $scope.cityList.concat(needLoadCityList)
                        }
                        loadCityQueue.forEach(function (item) {
                            var fillCityInfoCallOne = utils.callOne(fillCityInfo)
                            var loadCityAreaListCallOne = utils.callOne(loadCityAreaList)
                            var city = item.city
                            if (item.reqStatus === INIT) {
                                item.reqStatus = SENDING
                                $.when(fillCityInfoCallOne(city), loadCityAreaListCallOne(city)).then(function () {
                                    item.reqStatus = END
                                    loaded++
                                    $scope.progress = Math.round(loaded / ($scope.cityList.length + $scope.originCityList.length) * 100) + "%"
                                    loadAllCityList()
                                })
                                deferredList.push(fillCityInfoCallOne(city))
                                deferredList.push(loadCityAreaListCallOne(city))
                            }
                        })
                    } else {
                        $.when.apply($, deferredList).then(function () {
                            //drawByCityList()
                            deferred.resolve("加载完成")
                        })
                    }
                }

                loadAllCityList()
                return deferred
            }
            //$scope.$watch("cityList.length", function (length) {
            //    if (length > 0) {
            //        requestAnimationFrame(function () {
            //            $(".load-more-container")[0].scrollIntoViewIfNeeded()
            //        })
            //    }
            //})

            /**
             *
             * @returns {Promise|*}
             */
            function loadMoreCityList() {
                var deferredList = []
                if ($scope.originCityList.length > 0) {
                    $scope.cityList = $scope.cityList || []
                    var needLoadCityList = $scope.originCityList.splice(0, BATCH_SIZE)
                    $scope.cityList = $scope.cityList.concat(needLoadCityList)
                    $scope.searching = true
                    needLoadCityList.forEach(function (city) {
                        deferredList.push(fillCityInfo(city))
                        deferredList.push(loadCityAreaList(city))
                    })
                }
                return $.when.apply($, deferredList).always(function () {
                    $scope.searching = false
                })
            }


            /**
             * 加载城市下活跃区域列表，加载成功后city添加了areaList属性
             * @param city
             * @param return $.Defered()
             */
            function loadCityAreaList(city) {
                var rowKey = city.u_adid + city.u_adcode
                return dataloader.get(rowKey + ":" + rowKey + "~", datasource.getSource("dshow_permanent_area"), {
                    source: "home",
                    type: "post",
                    params: {
                        //"f:d_version": QUERY_DATE
                    }
                }, angular.noop).then(function (areaData) {
                    var loadAreaDeferred = []
                    city.areaList = areaData.result.map(function (item, areaIndex) {
                        var area = item[Object.keys(item)[0]]
                        var timeListStr = area.u_timeslices.replace(/To/gi, "至")
                        area.timeList = timeListStr.split(";")
                        area.u_accesscount = +area.u_accesscount
                        area.city = city
                        return area
                    })
                    city.areaList = $filter("orderBy")(city.areaList, 'u_accesscount', true)
                    city.areaList.forEach(function (area, i) {
                        var order = "000" + i
                        area.order = order.substring(order.length - 3)
                    })
                    city.areaList.forEach(function (area) {
                        loadAreaDeferred.push(fillAreaInfo(area))
                    })
                    return $.when.apply($, loadAreaDeferred)
                })
            }

            /**
             * 根据城市的adcode查找城市名称
             */
            function fillCityInfo(city) {
                return AMap.serviceAsync(["AMap.DistrictSearch"]).then(function () {
                    var district = new AMap.DistrictSearch({
                        //subdistrict: 1,   //返回下一级行政区
                        extensions: 'all',  //返回行政区边界坐标组等具体信息
                        level: 'district'  //查询行政级别为 市
                    })
                    promiseUtil.promisifyAll(district)
                    return district.searchAsync(city.u_adcode).then(function (status, districtSearchResult) {
                        var district = districtSearchResult.districtList ? districtSearchResult.districtList[0] : {
                            name: "未找到名称"
                        }
                        city.name = district.name
                        city.cityCode = district.citycode
                        city.center = district.center
                        city.boundaries = district.boundaries
                    })
                })

            }

            /**
             * 将区域的gps坐标系转为高德坐标系,计算中心点，获取poi信息
             * @param area
             * @return $.Deferred()
             */
            function fillAreaInfo(area) {
                var getMaxGD = datautils.getGD(area.u_leafmax_x, area.u_leafmax_y).then(function (gdx, gdy) {
                    area.maxgdx = gdx
                    area.maxgdy = gdy
                    return AMap.serviceAsync(["AMap.Geocoder"])
                })
                var getMinGD = datautils.getGD(area.u_leafmin_x, area.u_leafmin_y).then(function (gdx, gdy) {
                    area.mingdx = gdx
                    area.mingdy = gdy
                    return AMap.serviceAsync(["AMap.Geocoder"])
                })
                return $.when(getMaxGD, getMinGD).then(function () {
                    area.centergdx = utils.decimal((+area.mingdx + +area.maxgdx) / 2, 8)
                    area.centergdy = utils.decimal((+area.mingdy + +area.maxgdy) / 2, 8)
                    return AMap.serviceAsync(["AMap.Geocoder"])
                }).then(function () {
                    var MGeocoder = new AMap.Geocoder({
                        radius: 100,
                        extensions: "all"
                    })
                    promiseUtil.promisifyAll(MGeocoder)
                    return MGeocoder.getAddressAsync(new AMap.LngLat(area.centergdx, area.centergdy))
                }).then(function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        area.regeocode = result.regeocode
                    } else {
                        toastr.warning(area.centergdx + "," + area.centergdy + " 逆地理编码加载失败")
                    }
                })
            }

            /**
             * 在地图上画城市边界
             * @param city
             */
            function drawDistrictBound(city) {
                var colorAndOpacity = getColorAndOpacity({
                    count: city.u_visitcount,
                    total: $scope.cityList[0].u_visitcount,
                    opacity: [.2, .8]
                })
                if (city.boundaries) {
                    for (var i = 0; i < city.boundaries.length; i++) {
                        var polygon = new AMap.Polygon({
                            map: map,
                            strokeWeight: 1,
                            path: city.boundaries[i],
                            fillOpacity: colorAndOpacity.opacity,
                            fillColor: colorAndOpacity.color,
                            strokeColor: '#CC66CC'
                        })
                    }
                }
            }

            /**
             * 根据当前的$scope.cityList数据在页面上进行相应的绘制，包括热力图和矩形区域
             */
            function drawByCityList() {
                map.clearMap()
                heatMap.setMap(null)
                var pointList = []
                $scope.cityList.forEach(function (city) {
                    city.areaList.forEach(function (area) {
                        pointList.push({
                            lng: area.centergdx,
                            lat: area.centergdy,
                            count: area.u_accesscount
                        })
                        drawAreaAndAddEvent(area)
                    })
                })
                setHeatMapDeferred.then(function () {
                    var max = getMaxVisitCountOfArea()
                    heatMap.setDataSet({max: max, data: pointList})
                    heatMap.setMap(map)
                })
                map.setFitView()
            }

            /**
             * 在地图上绘制活跃区域
             * @param area
             */
            function drawAreaAndAddEvent(area) {
                var colorAndOpacity = getColorAndOpacity({
                    count: area.u_accesscount,
                    total: area.city.areaList[0].u_accesscount
                })
                var rect = drawRect({
                    maxgdx: area.maxgdx,
                    maxgdy: area.maxgdy,
                    mingdx: area.mingdx,
                    mingdy: area.mingdy,
                    color: colorAndOpacity.color,
                    opacity: colorAndOpacity.opacity
                })
                rect.on("click", function () {
                    $scope.viewArea(area)
                })
                rect.on("mouseover", function (event) {
                    if (map.getZoom() > STREET_LEVEL) {
                        var $tip = showTip({
                            x: event.pixel.x + 10,
                            y: event.pixel.y,
                            content: area.u_accesscount
                        })

                        function deleteTip() {
                            $tip.remove()
                            rect.off("mouseout", deleteTip)
                        }

                        rect.on("mouseout", deleteTip)
                    }
                })
            }

            /**
             * 在地图上绘制矩形
             * @param options
             * @param options.maxgdx
             * @param options.maxgdy
             * @param options.mingdx
             * @param options.mingdy
             * @param options.color
             * @param options.opacity
             * @return 返回绘制的矩形
             */
            function drawRect(options) {
                try {
                    var pointList = []
                    pointList.push(new AMap.LngLat(options.maxgdx, options.maxgdy));
                    pointList.push(new AMap.LngLat(options.maxgdx, options.mingdy));
                    pointList.push(new AMap.LngLat(options.mingdx, options.mingdy));
                    pointList.push(new AMap.LngLat(options.mingdx, options.maxgdy));
                    var rect = new AMap.Polygon({
                        path: pointList,
                        strokeColor: "#FF33FF",
                        strokeOpacity: 0.2,
                        strokeWeight: 1,
                        fillColor: options.color,
                        fillOpacity: options.opacity
                    });
                    rect.setMap(map);
                } catch (e) {
                    console.count("drawRect Error")
                    console.log(e)
                }
                return rect
            }

            /**
             * 得到一个矩形区域内的一个随机点
             * @param config
             * @param config.maxgdx
             * @param config.maxgdy
             * @param config.mingdx
             * @param config.mingdy
             */
            function getRandomPointInRect(config) {
                var randomgdx = utils.decimal(Math.random() * (config.maxgdx - config.mingdx) + config.mingdx, 8)
                var randomgdy = utils.decimal(Math.random() * (config.maxgdy - config.mingdy) + config.mingdy, 8)
                return {
                    lng: randomgdx,
                    lat: randomgdy
                }
            }

            /**
             * 根据区域的面积得到一个合适的地图缩放级别
             * @param area
             */
            function getProperLevel(area) {
                var level = LEVEL_20
                if (area.u_leafarea > Math.pow(200, 2)) {
                    level = LEVEL_200
                } else if (area.u_leafarea > Math.pow(100, 2)) {
                    level = LEVEL_100
                } else if (area.u_leafarea > Math.pow(50, 2)) {
                    level = LEVEL_50
                }
                return level
            }

            function getMaxVisitCountOfArea() {
                var maxVisitCountList = $scope.cityList.map(function (city) {
                    if (!city.areaList || !city.areaList.length) {
                        return 0
                    }
                    return city.areaList[0].u_accesscount
                })
                return maxVisitCountList.sort().reverse()[0]
            }

            AMap.event.addListener(map, "zoomchange", function () {
                if (map.getZoom() < STREET_LEVEL) {
                    heatMap.setMap(map)
                }
            })
            AMap.event.addListener(map, "click", function (event) {
                if (map.getZoom() < CITY_LEVEL) {
                    map.setCenter(event.lnglat)
                    AMap.serviceAsync(["AMap.Geocoder"]).then(function () {
                        var MGeocoder = new AMap.Geocoder({
                            radius: 1,
                            level: "city"
                        })
                        promiseUtil.promisifyAll(MGeocoder)
                        return MGeocoder.getAddressAsync(event.lnglat)
                    }).then(function (status, result) {
                        if (status === 'complete' && result.info === 'OK') {
                            map.setCity(result.regeocode.addressComponent.adcode.substring(0, 4) + "00")
                        } else {
                            toastr.warning(lnglat.lng + "," + lnglat.lat + " 逆地理编码加载失败")
                        }
                    })
                } else if (map.getZoom() < STREET_LEVEL) {
                    map.setZoomAndCenter(STREET_LEVEL, event.lnglat)
                }
            })
            /**
             *
             * @param options
             * @param {number} options.x
             * @param {number} options.y
             * @param {string} options.content
             * @return 返回提示结点(jquery实例)
             */
            function showTip(options) {
                var mapContainerRect = $("#mapContainer")[0].getClientRects()[0]
                var $content = $('<div class="tooltip right" role="tooltip"><div class="tooltip-inner"></div></div>')
                $content.find(".tooltip-inner").append(options.content)
                $content.css({
                    position: "absolute",
                    opacity: "1",
                    left: options.x + mapContainerRect.left,
                    top: options.y + mapContainerRect.top
                })
                $("body").append($content)
                return $content
            }
        }])
        angular.bootstrap($("#ng-app")[0], [app.name])
    })