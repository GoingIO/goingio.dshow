/**
 * Created by telen on 15/12/11.
 */

require(['leaflet', 'd3', 'adcodes', 'dataloader'], function(L, d3, adcodes, dataloader) {

    (function(lib) {
        lib(window, window.jQuery);
    }(function(w, $) {
        function resizeMap() {
            var height = w.innerHeight;
            var naviHeight = $("nav").height();
            $("#map").height(height - naviHeight - $("footer").outerHeight());
        }
        resizeMap();

        var resizeTimer = null;
        w.onresize = function(){
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeMap, 200);
        };
        w.onresize();
    }));


    var center = [39.92, 116.46];

    var map = (function() {

        var map = L.map("map", { zoomControl: false } ).setView(center, 10);

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
        L.tileLayer("http://mapservice.amap.com/mapservice?t=0&c=3&x={x}&y={y}&z={z}&size=0&v=dark", {
            maxZoom: 16,
            minZoom: 2
        }).addTo(map);

        new L.Control.Zoom({ position: 'topright' }).addTo(map);

        return map;
    })();


    function strokeColor(score) {
        //if (score == 'NULL') {
        //    return 'rgb(51, 137, 212)';
        //}
        //if (score <= 15) {
        //    return '#98df8a';
        //}
        //if (score <= 30) {
        //        return '#ff7f0e';
        //}
        //if (score > 30) {
        //    return '#d62728';
        //}
        if (score == 4) {
            return '#d62728';
        }
        if (score == 3) {
            return '#ff7f0e';
        }
        if (score == 2) {
            return '#3389D4';
        }
        if (score == 1) {
            return '#2ca02c';
        }
    }


    let geoJSONDay = [],
        geoJSONNight = [];
    let geoJSONLayer;
    let gTimeArea = true; // default 热门时段

    //d3.csv(DSHOW_CONTEXT + '/statics/js/dshow/report/fulldaytrack/beijing_uv_score.csv', function(d) {
    //        return {
    //            aoiid: d.aoiid,
    //            aoiname: d.aoiname,
    //            timeArea: d['time_area'], // 0:晚上10点至第二天早6点,1:早上7点-晚上10点
    //            adcode: d.adcode,
    //            adname: d.adname,
    //            totalUV: d['total_uv'],
    //            score: d.score == 'NULL' ? 'NULL' : Number.parseFloat(d.score),
    //            wkt: '[' + d.wkt + ']'
    //        };
    //    },
    //    function(data) {
    //        let csvdata = data
    //        csvdata.sort((a, b) => parseFloat(a.score) < parseFloat(b.score));
    //
    //        for (let i = 0; i < csvdata.length; i++) {
    //
    //            if (!Number.isNaN(csvdata[i].score)) {
    //                let feature = {
    //                    type: 'Feature',
    //                    id: csvdata[i].aoiid,
    //                    geometry: {
    //                        type: 'LineString',
    //                        coordinates: JSON.parse(csvdata[i].wkt)
    //                    },
    //                    properties: {
    //                        stroke: strokeColor(csvdata[i].score),
    //                        weight: 1,
    //                        aoiname: csvdata[i].aoiname,
    //                        score: csvdata[i].score
    //                    }
    //                };
    //
    //                //if (i > 1000) break;
    //
    //                if (csvdata[i].timeArea == 1) {
    //                    geoJSONDay.push(feature);
    //                } else {
    //                    geoJSONNight.push(feature);
    //                }
    //            }
    //
    //        }
    //
    //        console.log("aoi number day:" + geoJSONDay.length + " night: " + geoJSONNight.length);
    //
    //        //updateGeoJSONLayer(geoJSONDay);
    //    }
    //);

    /**
     * Remove layer, add layer.
     * @param geoJSON
     */
    function updateGeoJSONLayer() {
        // remote previous layer first
        if (geoJSONLayer) {
            map.removeLayer(geoJSONLayer);
        }

        let usingJSON;
        if (gTimeArea) {
            usingJSON = geoJSONDay
        } else {
            usingJSON = geoJSONNight;
        }

        geoJSONLayer = L.geoJson(usingJSON, {
            style: function (feature) {
                return {
                    opacity: 1,
                    color: feature.properties.stroke,
                    weight: feature.properties.weight,
                    fill: true,
                    fillColor: feature.properties.stroke
                };
            },
            onEachFeature: function (feature, layer) {
                layer._leaflet_id = feature.id;
                let score = !!feature.properties.score ? feature.properties.score : '';
                layer.bindPopup(feature.properties.aoiname + ' ' + score);
            }
        }).addTo(map);

        return usingJSON;
    }

    function maskOn() {
        $('#mask').show();
        $('#outer').removeClass('blurout').addClass('blur');
    }

    function maskOff() {
        $('#mask').hide();
        $('#outer').removeClass('blur').addClass('blurout');
    }


    var app = angular.module('MyApp', ['ngSanitize', 'ui.select']);
    app.config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);
    app.controller('appCtrl', ['$scope', '$location', function($scope, $location){

        $scope.adcode = {};
        $scope.adcode.selected = {"adcode": "110100", "adname": "北京市市辖区", "coordinate":"116.399042,39.903586"};
        $scope.period = true;

        $scope.rank = [];

        let lastAdcode = "110100";

        $scope.adcodes = _.values(adcodes);

        let usingArray = [];

        /**
         * 选择 adcode
         * @param item
         * @param model
         */
        $scope.selectAdcode = function(item, model) {

            if (item.adcode == lastAdcode) return;

            geoJSONDay = [];
            geoJSONNight = [];
            $scope.rank = [];

            map.panTo(item.coordinate.split(',').reverse());

            dataloaderQuery(item.adcode);

            lastAdcode = item.adcode;
        };

        /**
         * click 热门时段
         */
        $scope.periodChange = function() {
            console.time('rank time');
            gTimeArea = $scope.period;
            usingArray = updateGeoJSONLayer();
            displayRank(usingArray);
            console.timeEnd('rank');
        };

        /**
         * click one item of rank
         * @param index
         */
        $scope.aoiClick = function(index) {

            let bound = usingArray[index].geometry.coordinates;
            let latlangBound = bound.map(function(d) {
                return _.clone(d).reverse();
            });

            map.panTo(L.latLngBounds(latlangBound).getCenter(), {
                animate: true
            });

            let aoilayer = geoJSONLayer.getLayer(usingArray[index].id);
            aoilayer.openPopup();
        };

        function displayRank(temp) {

            let reduce = _.values(temp).filter(d => !Number.isNaN(Number.parseFloat(d.properties.score)));
            console.log('reduce length:', reduce.length);
            $scope.rank = _.values(reduce);
            maskOff();
        }

        /**
         *
         * @param adcode
         */
        function dataloaderQuery(adcode) {
            maskOn();
            console.time('query data');

            dataloader.query('/log/post/nocache/s_amap_dm_tracks_aoi_city_uv_score', {
                source: 'visual',
                type: 'post',
                dateformat: 'yyyyMMdd hh:mm:ss',
                params: {
                    project: 'max(d_datebuf)'
                }
            }, function(data) {
                var latestDate = new Date(data[0]['max(d_datebuf)']).format('yyyy-MM-dd hh:mm:ss');

                dataloader.query('/log/post/nocache/s_amap_dm_tracks_aoi_city_uv_score', {
                    source: 'visual',
                    type: 'post',
                    dateformat: 'yyyyMMdd hh:mm:ss',
                    params: {
                        project: 'aoiid,aoiname,time_area,score,wkt,levels',
                        match: 'adcode:' + adcode + ',d_datebuf:' + latestDate,
                        sort: 'score:desc'
                    }
                }, function(data) {
                    let csvdata = data;

                    for (let i = 0; i < csvdata.length; i++) {

                        if (!Number.isNaN(csvdata[i].score)) {
                            let feature = {
                                type: 'Feature',
                                id: csvdata[i].aoiid,
                                geometry: {
                                    type: 'LineString',
                                    coordinates: JSON.parse(csvdata[i].wkt)
                                },
                                properties: {
                                    stroke: strokeColor(csvdata[i].levels),
                                    weight: 1,
                                    aoiname: csvdata[i].aoiname,
                                    score: csvdata[i].score,
                                    level: csvdata[i].levels
                                }
                            };

                            if (csvdata[i]['time_area'] == 1) {
                                geoJSONDay.push(feature);
                            } else {
                                geoJSONNight.push(feature);
                            }
                        }

                    }

                    console.log("aoi number day:" + geoJSONDay.length + " night: " + geoJSONNight.length);

                    usingArray = updateGeoJSONLayer();

                    $scope.$apply(function() {
                        displayRank(usingArray);
                    });

                    console.timeEnd('query data');
                });

            });


        }

        // init from beijing
        dataloaderQuery('110100');
    }]);

    angular.bootstrap(document.getElementById("left-container"), [app.name]);

});