/**
 * Created by telen on 15/5/22.
 */
/*eslint-env browser, jquery, amd */
/*global DSHOW_CONTEXT:false*/

require(["leaflet", "d3", "dataloader", "datasource", "datepicker", "datautils", "md5", "toastr"], function(L, d3, dataloader, datasource, Datepicker, datautils, md5) {
    "use strict";

    (function(lib) {
        lib(window, window.jQuery);
    }(function(w, $) {
        function resizeMap() {
            var height = w.innerHeight;
            var naviHeight = 85;
            $("#map").height(height - naviHeight);

            $('#maincontainer').height(height - naviHeight);
            $('.tracks').height(height - naviHeight - 50 - 113)
        }
        resizeMap();

        var resizeTimer = null;
        w.onresize = function(){
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeMap, 200);
        };
        w.onresize();
    }));

    /**
     * 根据高德坐标系获取地址信息
     * @return jquery的延迟对象
     *
     */
    function getAddress(x, y) {
        var deferred = $.Deferred();
        AMap.service(["AMap.Geocoder"], function () {
            var MGeocoder = new AMap.Geocoder({
                radius: 1000,
                extensions: "all"
            });
            //逆地理编码
            MGeocoder.getAddress(new AMap.LngLat(x, y), function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    deferred.resolve(result);
                }
            });
        });
        return deferred;
    }
    (function($) {
        $.fn.drags = function(opt) {

            opt = $.extend({handle:"",cursor:"move"}, opt);

            if(opt.handle === "") {
                var $el = this;
            } else {
                var $el = this.find(opt.handle);
            }

            return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
                if(opt.handle === "") {
                    var $drag = $(this).addClass('draggable');
                } else {
                    var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
                }
                var z_idx = $drag.css('z-index'),
                    drg_h = $drag.outerHeight(),
                    drg_w = $drag.outerWidth(),
                    pos_y = $drag.offset().top + drg_h - e.pageY,
                    pos_x = $drag.offset().left + drg_w - e.pageX;
                $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                    $('.draggable').offset({
                        top:e.pageY + pos_y - drg_h,
                        left:e.pageX + pos_x - drg_w
                    }).on("mouseup", function() {
                        $(this).removeClass('draggable').css('z-index', z_idx);
                        map.dragging.enable();
                    });
                });
                map.dragging.disable();
                e.preventDefault(); // disable selection
            }).on("mouseup", function() {
                map.dragging.enable();
                if(opt.handle === "") {
                    $(this).removeClass('draggable');
                } else {
                    $(this).removeClass('active-handle').parent().removeClass('draggable');
                }
            });

        }
    })(jQuery);
    $(".info-tracks").drags();

    var diu;
    var dateNow = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    var weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var LOOP_PERIOD = 60; // days
    var naviInfo = [];

    function  dayOfYear(inDate) {
        inDate = inDate || new Date();
        var year = inDate.getMonth() >= 0 ? inDate.getFullYear() : inDate.getFullYear() - 1; // 上半年减去去年
        var start = new Date(year, 0, 1);
        var diff = inDate - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    var app = angular.module('MyApp', []);
    app.config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);
    app.controller('appCtrl', ['$scope', '$location', '$sce', function($scope, $location, $sce){

        $scope.OverviewDuration = 0;
        $scope.OverviewDistance = 0;
        $scope.OverviewAverageSpeed = 0;

        $scope.naviInfoList = [];
        $scope.showList = false;
        $scope.startEndPoint = {};
        $scope.dayOverview = {};
        $scope.diu;
        var adid,
            userDiu;
        var allRects = [];

        var loadDiu = function(diu) {
            adid = md5.hex_md5(diu);
            $("#lock-main").show();

            dataloader.get(adid, datasource.getSource('user_navi_allday_overview'), {
                source: 'home',
                type: 'post'
            }, function (data) {

                if (data.length) {
                    var trackDaysOverview = data[0][adid];
                    var trackDatesArr = trackDaysOverview['u_track_dates'].split('|').reverse();
                    var recentNaviDay = trackDatesArr[0];

                    var markDates = {};
                    trackDatesArr.forEach(function(item) {
                        var month = parseInt(item.substr(5, 2))-1;
                        if (!markDates[month]) {
                            markDates[month] = [];
                        }
                        markDates[month].push(parseInt(item.substr(8, 2)));
                    });

                    $('#datepicker div').remove();
                    $('.ta_calendar').remove();
                    new Datepicker('#datepicker', {
                        target: 'date',
                        startDate: recentNaviDay || dateNow.format('yyyy-MM-dd'),
                        shortOpt: true,
                        format: 'yyyy-mm-dd',
                        markCertainDate: markDates,
                        markedAllDisabled: true,
                        isTodayValid: false
                    }, function(obj) {

                        $scope.showList = false;
                        $scope.naviInfoList = [];
                        $scope.naviInfoList.length = 0;
                        for(var i = 0; i < allRects.length; i++) {
                            map.removeLayer(allRects[i]);
                        }

                        var modDay = dayOfYear(obj.startDate) % LOOP_PERIOD;
                        var naviWeek = obj.startDate.format('MM.dd') + ' ' + weekMap[obj.startDate.getDay()];

                        if (diu) {
                            // 单天
                            var key = adid + '_' + modDay;
                            loadSummary(key);
                            loadAreas(key, naviWeek);
                            $("#lock-main").hide();
                        }

                    });
                } else {
                    $('#datepicker div').remove();
                    $('.ta_calendar').remove();
                    new Datepicker('#datepicker', {
                        target: 'date',
                        startDate: recentNaviDay || dateNow.format('yyyy-MM-dd'),
                        shortOpt: true,
                        format: 'yyyy-mm-dd',
                        markCertainDate: {},
                        markedAllDisabled: true,
                        isTodayValid: false
                    }, function(obj) {

                    });

                    $("#lock-main").hide();
                    $scope.$apply(function() {
                        $scope.OverviewDistance = 0;
                        $scope.OverviewDuration = 0;
                        $scope.OverviewAverageSpeed = 0;
                        $scope.naviInfoList = [];
                        $scope.showList = true;
                        $scope.dayOverview = {};
                    });

                }

            });


        };

        datautils.getUserInfoAsync().then(function(data) {
            var user = data;
            diu = userDiu = user ? user['result']['udid'] : '';
            if ($location.search().diu) {
                diu = $location.search().diu;
            }
            $scope.diu = diu;

            loadDiu(diu);
        });

        $scope.resetDiu = function() {

            if (!$scope.diu) {
                $scope.diu = userDiu;
            }
            diu = $scope.diu;

            loadDiu(diu);
            $scope.naviInfoList = [];
            $scope.naviInfoList.length = 0;


            for(var i = 0; i < allRects.length; i++) {
                map.removeLayer(allRects[i]);
            }

        };



        /**
         * 查询一天轨迹
         * @param key adid_modDay
         * @param choosenDay [yyyy-MM-dd]
         */
        function loadSummary(key) {
            dataloader.get(key, datasource.getSource('user_navi_allday_tracks'), {
                source: 'home',
                type: 'post'
            }, function(data) {
                caNavi(data, key);
            });
        }

        /**
         * 先查询MBR停留区域块数
         * 再依次将块查询出来
         * @param key
         */
        function loadAreas(key, dayWeek) {
            dataloader.get(key, datasource.getSource('user_navi_allday_staymbrs'), {
                source: 'home',
                type: 'post'
            }, function(data) {



                if (data.length) {

                    var mbrsObj = data[0][key];

                    $scope.$apply(function() {
                        $scope.dayOverview = {
                            firsttime: mbrsObj['u_day_firsttime'].substr(11),
                            lasttime: mbrsObj['u_day_lasttime'].substr(11),
                            loccount: mbrsObj['u_day_loccount'],
                            staycount: mbrsObj['u_day_staycount'],
                            areastays: caculateTimeLong(mbrsObj['u_day_areastays']),
                            mbrs: mbrsObj['u_mbrs']
                        };
                    });

                    var mbrs = mbrsObj['u_mbrs'];

                    for (var i = 1; i <= mbrs; i++) {

                        $scope.naviInfoList[i - 1] = {};
                        $scope.naviInfoList[i - 1]['areaIndex'] = i - 1;
                        $scope.naviInfoList[i - 1]['dayWeek'] = dayWeek;

                        var a = i;
                        (function(b) {
                            var pkey = key + '_' + b;
                            dataloader.get(pkey, datasource.getSource('user_navi_allday_stayarea'), {
                                source: 'home',
                                type: 'post'
                            }, function(data) {
                                var data = data[0][pkey];

                                var areaStays = caculateTimeLong(data['u_areastays']); // 停留时长(s)
                                var locCount = data['u_loccount']; // 定位次数
                                var startTime = data['u_starttime'];
                                var endTime = data['u_endtime'];


                                var deferAreaMin = datautils.getGD(data['u_mbrmin_x'], data['u_mbrmin_y']);
                                var deferAreaMax = datautils.getGD(data['u_mbrmax_x'], data['u_mbrmax_y']);
                                var medoid = datautils.getGD(data['u_medoid_x'], data['u_medoid_y']);

                                $scope.naviInfoList[b - 1]['fromTo'] = sliceStayTime(data['u_timeslices']); // 起止时间
                                $scope.naviInfoList[b - 1]['areaStays'] = areaStays; // 停留时长
                                $scope.naviInfoList[b - 1]['mbrarea'] = data['u_mbrarea'] + '平方米'; // 停留面积
                                $scope.naviInfoList[b - 1]['timeslices'] = $sce.trustAsHtml((() => {
                                    return data['u_timeslices'].split(';').join('<br>');
                                })()); // 停留面积


                                $.when(deferAreaMin, deferAreaMax, medoid).then(function(areaMin, areaMax, medoid) {

                                    getAddress(medoid[0], medoid[1]).done(function(data) {

                                        var bounds = [[areaMin[1], areaMin[0]], [areaMax[1], areaMax[0]]];

                                        var rect = L.rectangle(bounds, {color: "#782200", weight: 1}).addTo(map);

                                        allRects.push(rect);

                                        rect.bindPopup('开始时间：' + startTime +
                                            '<br>结束时间：' + endTime +
                                            '<br>停留时间：' + areaStays +
                                            '<br>定位次数：' + locCount +
                                            '<br>地址：' + data.regeocode.formattedAddress);

                                        rect.on('mouseover', function() {
                                            this.setStyle({
                                                color: 'red'
                                            });
                                        });
                                        rect.on('mouseout', function() {
                                            this.setStyle({
                                                color: '#782200'
                                            });
                                        });

                                        $scope.$apply(function() {
                                            $scope.naviInfoList[b - 1]['bounds'] = bounds;
                                            $scope.naviInfoList[b - 1]['rect'] = rect;
                                            $scope.naviInfoList[b - 1]['address'] = data.regeocode.formattedAddress;
                                        });
                                    });
                                });


                            });
                        }(a));

                    }

                    $scope.naviInfoList[0]['areaIndex'] = 0;
                }

            });
        }

        function sliceStayTime(time) {
            var toPeriod = time.split(';');
            var fromTo = toPeriod[0].split('To');
            fromTo[0] = fromTo[0].substr(11, 5);
            fromTo[1] = fromTo[1].substr(12, 5);

            return fromTo;
        }

        function caNavi(data, key) {
            if (data.length) {
                naviInfo = data[0][key];
                processNaviInfoArr();
            }
        }

        function processNaviInfoArr() {
            $("#lock-main").hide();

            (function() {
                getAddress(naviInfo['u_track_fromx'], naviInfo['u_track_fromy']).done(function(data) {
                    $scope.$apply(function() {
                        naviInfo.from = data.regeocode.formattedAddress;
                        $scope.startEndPoint['start'] = {
                            time: naviInfo['u_track_firsttime'].substr(11, 5),
                            address: data.regeocode.formattedAddress
                        };
                    });
                });

                getAddress(naviInfo['u_track_tox'], naviInfo['u_track_toy']).done(function(data) {
                    $scope.$apply(function() {
                        naviInfo.to = data.regeocode.formattedAddress;
                        $scope.startEndPoint['end'] = {
                            time: naviInfo['u_track_lasttime'].substr(11, 5),
                            address: data.regeocode.formattedAddress
                        };
                    });
                });
            })();

            var tracks = naviInfo['u_track_json'];
            tracks = JSON.parse(tracks);

            gCollection.features[0] = tracks;
            D3path.init(gCollection);

            //$scope.$apply(function() {
            //    $scope.naviInfoList = naviInfo;
            //});
        }

        // click
        $scope.loadAreaDetail = function(index, listIndex) {

            $scope.naviInfoList[index]['rect'].openPopup();
            map.fitBounds($scope.naviInfoList[index]['bounds']);
        };



    }]);

    app.filter('toInt', function() {
        return function(input) {
            return parseInt(input, 10);
        };
    });
    app.filter('toFix', function() {
        return function(input) {
            return parseFloat(input).toFixed(2);
        };
    });
    app.filter('toDuration', function() {
        return function(input) {
            return caculateTimeLong(input);
        };
    });

    function caculateTimeLong(input) {
        var days = 0;
        var hours = 0;
        var mins = 0;
        if (input >= 86400) {
            days = Math.floor(input / 86400);
            input = input - days * 86400;
        }
        if (input >= 3600) {
            hours = Math.floor(input / 3600);
            input = input - hours * 60 * 60;
        }
        if (input >= 60) {
            mins = Math.floor(input / 60);
        }

        return (days > 0 ? days + '天' : '') + (hours > 0 ? hours + '小时' : '') + (mins > 0 ? mins + '分钟' : '') +
            ( (days == 0 && hours == 0 && mins == 0) ? parseInt(input) + '秒' : '');
    }

    angular.bootstrap(document.getElementById("maincontainer"), [app.name]);



    L.Icon.Default.imagePath = '/dshow-web/statics/images/';
    var startIcon = L.icon({
        iconUrl: '/dshow-web/statics/images/start-icon.png',
        shadowUrl: '/dshow-web/statics/images/marker-shadow.png',

        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],

        shadowSize: [41, 41]
    });
    var endIcon = L.icon({
        iconUrl: '/dshow-web/statics/images/end-icon.png',
        shadowUrl: '/dshow-web/statics/images/marker-shadow.png',

        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],

        shadowSize: [41, 41]
    });
    var center = [39.92, 116.46];
    var pathSettings = {
        playPath: false,
        pathStrokeWidth: 3,
        pathDuration: 2000
    };
    var themeColor = {
        startMarker: 'rgb(118, 150, 113)',
        endMarker: 'rgb(228, 50, 113)'
    };
    /**
     * map, page initialization
     */
    var map = (function() {


        var map = L.map("map").setView(center, 10);

        // Disable drag and zoom handlers.
        //    map.dragging.disable();
        //    map.touchZoom.disable();
        //    map.doubleClickZoom.disable();
        //    map.scrollWheelZoom.disable();

        /**
         * c=
         *  1：poi
         2：roadlabel
         4：road
         8：region
         3:所有tile合并后的结果
         16：json
         v = blue,light,dark
         */
        //L.tileLayer("http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
        L.tileLayer("http://mapservice.amap.com/mapservice?t=0&c=3&x={x}&y={y}&z={z}&size=0&v=light", {
            maxZoom: 16,
            attribution: null
        }).addTo(map);
        //    L.tileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png", {
        //        maxZoom: 18,
        //        attribution: "Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery <a href="http://stamen.com">Stamen</a>"
        //    }).addTo(map);

        return map;
    })();

    var gHistory = [];
    var gTrajectory = { // GeoJSON
        "coordinates": [],
        "properties": {
            "time": []
        }
    };

    var gCollection = {
        type: "FeatureCollection",
        features: []
    };


    var D3path = (function (lib) {
        return lib();
    }(function () {

        var markerFlowRadius = 30,
            markerMovingRadius = 5,
            startStopMarkerRadius = 6;


        // private data
        var svg = d3.select(map.getPanes().overlayPane).append("svg"),
            g = svg.append("g").attr("class", "leaflet-zoom-hide");
        var tweenToggle = 0,
            pathIndex = 0;
        var color = d3.scale.category10();
        var centerPoint = map.latLngToLayerPoint(center);

        var geoJSONData;
        var feature;
        var Lmarkers = [];

        var marker = g.append("circle");

        marker.attr("r", markerFlowRadius)
            .attr("id", "marker")
            .style("fill", "#98209f")
            .attr("fill-opacity", 0.3);
        marker.attr("transform", "translate(" + centerPoint.x + "," + centerPoint.y + ")");

        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

        var transform = d3.geo.transform({
            point: projectPoint
        });

        var path = d3.geo.path().projection(transform);

        function setup() {
            g.selectAll("path").remove();

            feature = g.selectAll("path")
                .data(geoJSONData.features)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "trip_" + 0;
                })
                .style("fill", "none")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", pathSettings.pathStrokeWidth)
                .attr("stroke-opacity", function (d) {
                    if (d.properties.joinLine) {
                        return 0;
                    } else {
                        return 0.7;
                    }
                })
                .style("stroke", function (d, i) {
                    return color(i);
//                    return "#ff0022";
                });
        }


        function applyLatLngToLayer(d) {
            var y = d[1];
            var x = d[0];
            return map.latLngToLayerPoint(new L.LatLng(y, x));
        }

        /**
         * 缩放地图reset path
         */
        function reset() {
            if (!geoJSONData)
                return;
            var bounds = path.bounds(geoJSONData),
                topLeft = bounds[0],
                bottomRight = bounds[1];

            svg.attr("width", bottomRight[0] - topLeft[0] + 120)
                .attr("height", bottomRight[1] - topLeft[1] + 120)
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");

//            g.attr("transform", "translate(" + (-topLeft[0] + pathSettings.pathStrokeWidth) + "," + (-topLeft[1] + pathSettings.pathStrokeWidth) + ")");
            g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

            feature.attr("d", path);

            // update stroke-dasharray
            feature.each(function(d, i) {
                var l = d3.select(this).node().getTotalLength();
                //if (i < pathIndex) {
                //    d3.select(this).attr("stroke-dasharray", l + "," + l);
                //}
                //if (i > pathIndex) {
                //    d3.select(this).attr("stroke-dasharray", 0 + "," + l);
                //}
                if (i === pathIndex) {
                    var t = d3.select(this).attr("T");
                    //var startLength = t * l;
                    //d3.select(this).attr("stroke-dasharray", startLength + "," + l);

                    // update marker position
                    var p = d3.select(this).node().getPointAtLength(t * l);
                    marker.attr("transform", "translate(" + p.x + "," + p.y + ")");
                }
            });

            if (!g.selectAll(".c-start").empty()) {
                g.selectAll(".c-start").each(function() {
                    d3.select(this).attr("transform", function(d) {
                        var point = applyLatLngToLayer(d);
                        return "translate(" + point.x + "," + point.y + ")";
                    });
                });
            }

        }

        map.on("viewreset", reset);

        function tweenDash() {
            var that = this;
            var percent = d3.select(this).attr("T");

            return function(t) {
                var l = d3.select(that).node().getTotalLength();
                var startLength = percent ? l * percent : 0;
                var i = d3.interpolateString(startLength + "," + l, l + "," + l); // interpolation of stroke-dasharray style attr

                var p = d3.select(that).node().getPointAtLength(t * (l - startLength) + startLength);
                marker.attr("transform", "translate(" + p.x + "," + p.y + ")");//move marker

                if (tweenToggle % 10 === 0) {

                    if (pathSettings.playPath) { // 终点
                        var newCenter = map.layerPointToLatLng(new L.Point(p.x, p.y));

                        map.setView(newCenter);
                    } else {
                        map.fitBounds(L.latLngBounds(L.geoJson(geoJSONData).getBounds()));
                    }


                }
                tweenToggle++;

                return i(t);
            };
        }

        function resetPath() {
            pathIndex = 0;
            tweenToggle = 0;
//            g.selectAll(".c-start").remove();
        }

        function removeAllMapMarkers() {
            Lmarkers.forEach(function(m) {
                map.removeLayer(m);
            })
        }

        function iterate(pausePercent) {

            removeAllMapMarkers();

            var iPath = svg.select("path.trip_0");

            iPath
                .attr("T", pausePercent ? pausePercent : 0)
                .attr("stroke-dasharray", function(){
                    var l = this.getTotalLength();
                    var startPoint = pausePercent ? l * pausePercent : 0;
                    return startPoint + "," + l;
                })
                .transition()
                .duration(function(d) {
                    var dur;
                    if (d.properties.joinLine) {
                        dur = 10000;
                    } else {
                        if (pathSettings.playPath) {
                            var duration = d.properties.timestamp[d.properties.timestamp.length - 1] - d.properties.timestamp[0]; // 总时间

                            duration = duration / 60000; //convert to minutes

                            dur = duration * (1 / 5) * 1000;
                        } else {
                            dur = pathSettings.pathDuration;
                        }

                    }
                    return pausePercent ? dur - dur * pausePercent : dur;
                })
                .ease("linear")
                .attr("T", 1)
                .attrTween("stroke-dasharray", tweenDash)
                .each("start", function(d) {
                    // 添加起始点 start point
                    if (!d.properties.joinLine && d3.select(".c_" + pathIndex).empty()) {
                        var latlng = d.geometry.coordinates[0];
//                        var smarker = g.append("circle");
//                        smarker
//                            .data([latlng])
//                            .attr("class", "c-start c_" + pathIndex)
//                            .attr("r", startStopMarkerRadius)
//                            .style("fill", themeColor.startMarker)
//                            .attr("transform", "translate(" + applyLatLngToLayer(latlng).x + "," + applyLatLngToLayer(latlng).y + ")");
                        var smarker = L.marker([latlng[1], latlng[0]], {icon: startIcon}).addTo(map);
                        smarker.bindPopup("<b>起点：</b>" + naviInfo.from);
                        Lmarkers.push(smarker);

                    }

                    if (d.properties.joinLine) {
                        marker.transition()
                            .duration(250)
                            .attr("r", 40)
                            .attr("fill-opacity", 0.3);
                    } else {
                        marker.transition()
                            .duration(250)
                            .attr("r", markerMovingRadius)
                            .attr("fill-opacity", 1);
                    }

                })
                .each("end", function(d) {


                    if (!d.properties.joinLine) {
                        var latlng = d.geometry.coordinates[d.geometry.coordinates.length - 1];
//                        var smarker = g.append("circle");
//                        smarker
//                            .data([latlng])
//                            .attr("class", "c-start")
//                            .attr("r", startStopMarkerRadius)
//                            .style("fill", themeColor.endMarker)
//                            .attr("transform", "translate(" + applyLatLngToLayer(latlng).x + "," + applyLatLngToLayer(latlng).y + ")");
                        var smarker = L.marker([latlng[1], latlng[0]], {icon: endIcon}).addTo(map);
                        smarker.bindPopup("<b>终点：</b>" + naviInfo.to);
                        Lmarkers.push(smarker);

                    }

                    pathIndex++;

                    var nextPath = svg.select("path.trip_" + pathIndex);
                    if (nextPath[0][0] != null) {
                        iterate();
                    } else {
                        resetPath();
                    }

                    var dashPath = d3.select(this);
                    dashPath.attr('stroke-dasharray', '5,5');

                    (function rpeat() { // 变成蚂蚁线
                        dashPath.attr('stroke-dashoffset', 10)
                            .transition()
                            .duration(1000)
                            .ease("linear")
                            .attr('stroke-dashoffset', 0)
                            .each('end', rpeat);
                    })();
                });

            // 循环到下一个轨迹时更新标签距离图表
            //D3Area.init(gCollection, pathIndex);


        }


        function pausePlayBtnController() {
            // svg animation controller
            $(".timeslider li.controls i").on("click", function() {
                var iPath = svg.select("path.trip_" + pathIndex);
                if ($(this).hasClass("fa-pause")) {

                    iterate(iPath.attr("T"));

                    $(this).removeClass("fa-pause").addClass("fa-play");

                    $(this).data("btnPause", false);
                } else if ($(this).hasClass("fa-play")) {

                    iPath.transition()
                        .duration(0);

                    $(this).removeClass("fa-play").addClass("fa-pause");

                    $(this).data("btnPause", true);
                }

            });

            $("div.control-btn").on("click", function() {
                $(".chart-panel").toggleClass("on");
            });
        }
        pausePlayBtnController();

        var playControl = {
            pause: function() {
                if ($(".timeslider li.controls i").hasClass("fa-play")) {
                    var iPath = svg.select("path.trip_" + pathIndex);
                    iPath.transition()
                        .duration(0);

                    $(".timeslider li.controls i").removeClass("fa-play").addClass("fa-pause");
                }
            },
            resume: function() {
                if (!$(".timeslider li.controls i").data("btnPause") && $(".timeslider li.controls i").hasClass("fa-pause")) {
                    var iPath = svg.select("path.trip_" + pathIndex);
                    iterate(iPath.attr("T"));

                    $(".timeslider li.controls i").removeClass("fa-pause").addClass("fa-play");
                }
            }
        };


        // public
        var self = {
            init: function (collection) {

                geoJSONData = collection;

                setup();

                reset();


                setTimeout(function() {
                    iterate();
                }, 1000);

//                this.chartMarker
//                    .append("circle")
//                    .attr("r", 4.5);
//                this.chartPath
//                    .append("path");

                //D3Area.init(gCollection, pathIndex);
            },
            chartMarker: g.append("g")
                .attr("class", "focus")
                .append("circle")
                .style("display", "none")
                .attr("r", 4.5),
            chartPath: g.append("g")
                .attr("class", "focus-path")
                .append("path")
                .style("display", "none"),
            movingTimer: 0,
            moveMarker: function(i) {
                var that = this;
                var geo = geoJSONData.features[pathIndex];
                var latlng = geo.geometry.coordinates[i];
                that.chartMarker
                    .attr("transform", "translate(" + applyLatLngToLayer(latlng).x + "," + applyLatLngToLayer(latlng).y + ")");

                var geocopy = $.extend(true, {}, geoJSONData);
                geocopy.features = [geocopy.features[pathIndex]];
                geocopy.features[0].geometry.coordinates.splice(i + 1);

                that.chartPath
                    .selectAll("path")
                    .data(geocopy.features)
                    .attr("d", path);

                clearTimeout(that.movingTimer);
                that.movingTimer = setTimeout(function() {
                    map.setView(L.latLng(latlng[1], latlng[0]));
                }, 50);

            },
            pauseTrack: function() {
                playControl.pause();
            },
            resumeTrack: function() {
                playControl.resume();
            }
        };

        return self;
    }));

    var D3Area = (function() {

        var isChartInit = false;
        var chartdata = [];
//        var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S");

        var margin = {top: 20, right: 50, bottom: 30, left: 50},
            width = 840 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
                .range([height, 0])
            ;

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.time.format("%H:%M"));

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(6)
            .tickFormat(function (d) {
                var prefix = d3.formatPrefix(d);
                return prefix.scale(d) + prefix.symbol + "m";
            });

        var area = d3.svg.area()
            .x(function(d) { return x(d.time); })
            .y0(height)
            .y1(function(d) { return y(d.distance); });

        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var prepareData = function(geoJSON, a) {
            chartdata = [];
            var beginPoint;
            if (!geoJSON.features[a].properties.joinLine) {

                beginPoint = L.latLng(geoJSON.features[a].geometry.coordinates[0][1], geoJSON.features[a].geometry.coordinates[0][0]);
                for (var i = 1; i < geoJSON.features[a].geometry.coordinates.length; i++) {
                    var para = {};
                    para.distance = beginPoint.distanceTo(L.latLng(geoJSON.features[a].geometry.coordinates[i][1], geoJSON.features[a].geometry.coordinates[i][0]));
                    para.time = new Date(geoJSON.features[a].properties.timestamp[i]); // new Date(millionseconds)

                    chartdata.push(para);
                }
            }

        };

        var chart = function() {

            x.domain(d3.extent(chartdata, function(d) { return d.time; }));
            y.domain([0, d3.max(chartdata, function(d) { return d.distance; })]);

            svg.append("path")
                .datum(chartdata)
                .attr("class", "area")
                .attr("d", area);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em");

            // Tooltip
            var focus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("circle")
                .attr("r", 4.5);

            focus.append("text")
                .attr("x", 9)
                .attr("transform", "translate(-45,-14)")
                .attr("dy", ".35em");

            svg.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .on("mouseover", function() {
                    focus.style("display", null);
                    D3path.chartMarker.style("display", null);
                    D3path.chartPath.style("display", null);
                    D3path.pauseTrack();
                })
                .on("mouseout", function() {
                    focus.style("display", "none");
                    D3path.chartMarker.style("display", "none");
                    D3path.chartPath.style("display", "none");
                    D3path.resumeTrack();
                })
                .on("mousemove", mousemove);

            //Get the Amount of alerts for tooltip
            var bisectDate = d3.bisector(function(d) {
                return d.time;
            }).left;
            var tooltipDate = d3.time.format("%H:%M");

            function mousemove() {
                if (chartdata.length < 3) {
                    return;
                }
                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectDate(chartdata, x0, 1),
                    d0 = chartdata[i - 1],
                    d1 = chartdata[i],
                    d = x0 - d0.time > d1.time - x0 ? d1 : d0;
                focus.attr("transform", "translate(" + x(d.time) + "," + y(d.distance) + ")");
                focus.select("text").text((Math.floor(d.distance) / 1000).toFixed(2) + "km   " + tooltipDate(d.time));
                D3path.moveMarker(i);
            }
            // End Tooltip
            isChartInit = true;
        };

        var updateChartData = function() {

            x.domain(d3.extent(chartdata, function(d) { return d.time; }));
            y.domain([0, d3.max(chartdata, function(d) { return d.distance; })]);

            svg.select("path")
                .datum(chartdata)
                .attr("class", "area")
                .attr("d", area);

            svg.select("g.x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.select("g.y")
                .call(yAxis)
            ;

        };

        var self = {
            init: function(data, pathIndex) {
                prepareData(data, pathIndex);
                if (isChartInit) {
                    updateChartData()
                } else {
                    chart();
                }
            },
            updateChart: function(data, pathIndex) {
                prepareData(data, pathIndex);
                updateChartData();
            }
        };

        return self;
    })(map);



    $(".media-list").on("click", ".media", function() {
        if (!$(this).hasClass("active")) {
            $(".media-list .media.active").removeClass("active");
            $(this).addClass("active");
        }
    });
//    dataloader.get('00a806a5304165f991430f2608e447f4', datasource.getSource('user_trip'), {
//        source: 'home',
//        type: 'post'
//    }, function(data) {
//        console.log(data);
//    });

});
