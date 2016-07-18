/**
 * Created by telen on 15/5/22.
 */
/*eslint-env browser, jquery, amd */
/*global DSHOW_CONTEXT:false*/

require(["leaflet", "d3", "dataloader", "datasource", "toastr"], function(L, d3, dataloader, datasource) {
    "use strict";

    (function(lib) {
        lib(window, window.jQuery);
    }(function(w, $) {
        function resizeMap() {
            var height = w.innerHeight;
            var naviHeight = $("nav").height();
            $("#map").height(height - naviHeight);
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
    var map = L.map("map").setView(center, 14);

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
//    L.tileLayer("http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", {
    L.tileLayer("http://mapservice.amap.com/mapservice?t=0&c=4&x={x}&y={y}&z={z}&size=0&v=light", {
        maxZoom: 16,
        attribution: null
    }).addTo(map);
//    L.tileLayer("http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png", {
//        maxZoom: 18,
//        attribution: "Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery <a href="http://stamen.com">Stamen</a>"
//    }).addTo(map);

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

            feature = g.selectAll("path")
                .data(geoJSONData.features)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "trip_" + d.properties.index;
                })
                .style("fill", "none")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 5)
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

        function reset() {
            var bounds = path.bounds(geoJSONData),
                topLeft = bounds[0],
                bottomRight = bounds[1];

            svg.attr("width", bottomRight[0] - topLeft[0] + 120)
                .attr("height", bottomRight[1] - topLeft[1] + 120)
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");

            g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

            feature.attr("d", path);

            // update stroke-dasharray
            feature.each(function(d, i) {
                var l = d3.select(this).node().getTotalLength();
                if (i < pathIndex) {
                    d3.select(this).attr("stroke-dasharray", l + "," + l);
                }
                if (i > pathIndex) {
                    d3.select(this).attr("stroke-dasharray", 0 + "," + l);
                }
                if (i === pathIndex) {
                    var t = d3.select(this).attr("T");
                    var startLength = t * l;
                    d3.select(this).attr("stroke-dasharray", startLength + "," + l);

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

                    var newCenter = map.layerPointToLatLng(new L.Point(p.x, p.y));

                    map.setView(newCenter);

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

        function iterate(pausePercent) {

            var iPath = svg.select("path.trip_" + pathIndex);

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
                        var duration = d.properties.timestamp[d.properties.timestamp.length - 1] - d.properties.timestamp[0];

                        duration = duration / 60000; //convert to minutes

                        dur = duration * (1 / 5) * 1000;

                    }
                    return pausePercent ? dur - dur * pausePercent : dur;
                })
                .ease("linear")
                .attr("T", 1)
                .attrTween("stroke-dasharray", tweenDash)
                .each("start", function(d) {
                    // 添加起始点
                    if (!d.properties.joinLine && d3.select(".c_" + pathIndex).empty()) {
                        var latlng = d.geometry.coordinates[0];
                        var smarker = g.append("circle");
                        smarker
                            .data([latlng])
                            .attr("class", "c-start c_" + pathIndex)
                            .attr("r", startStopMarkerRadius)
                            .style("fill", "rgb(118, 150, 113)")
                            .attr("transform", "translate(" + applyLatLngToLayer(latlng).x + "," + applyLatLngToLayer(latlng).y + ")");
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
                        var smarker = g.append("circle");
                        smarker
                            .data([latlng])
                            .attr("class", "c-start")
                            .attr("r", startStopMarkerRadius)
                            .style("fill", "rgb(228, 50, 113)")
                            .attr("transform", "translate(" + applyLatLngToLayer(latlng).x + "," + applyLatLngToLayer(latlng).y + ")");
                    }

                    pathIndex++;

                    var nextPath = svg.select("path.trip_" + pathIndex);
                    if (nextPath[0][0] != null) {
                        iterate();
                    } else {
                        resetPath();
                    }
                });

            // 循环到下一个轨迹时更新标签距离图表
            D3Area.updateChart(gCollection, pathIndex);
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

                if ($("#chart").hasClass("off")) {
                    $("#chart").removeClass("off").addClass("on");
                } else if ($("#chart").hasClass("on")) {
                    $("#chart").removeClass("on").addClass("off");
                }
            });
        }

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
                pausePlayBtnController();

                setTimeout(function() {
                    iterate();
                }, 1000);

                this.chartMarker
                    .append("circle")
                    .attr("r", 4.5);
                this.chartPath
                    .append("path");

                D3Area.init(gCollection, pathIndex);
            },
            chartMarker: g.append("g")
                .attr("class", "focus")
                .style("display", "none"),
            chartPath: g.append("g")
                .attr("class", "focus-path")
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

        var chartdata = [];
//        var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S");

        var margin = {top: 20, right: 80, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
                .range([height, 0])
            ;

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.time.format("%m-%d %H:%M"));

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
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
                chart();
            },
            updateChart: function(data, pathIndex) {
                prepareData(data, pathIndex);
                updateChartData();
            }
        };

        return self;
    })(map);

    $.getJSON(DSHOW_CONTEXT + "/statics/js/dshow/report/spiderkiller/LocationHistory.json", function(data) {
        var feature = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: []
            },
            properties: {
                timestamp: []
            }
        };
        var previousPoint = null;
        var tripIndex = 0;
        var SCALAR_E7 = 0.0000001; // Since Google Takeout stores latlngs as integers
        var locations = data.locations;
        for (var i = locations.length - 1; i >= 0; i--) {
            var time = new Date(+locations[i].timestampMs).format("yyyyMMdd");

            var location = {};
            var position = [];
            position[0] = locations[i].latitudeE7 * SCALAR_E7;
            position[1] = locations[i].longitudeE7 * SCALAR_E7;
            gTrajectory.coordinates.push(position);
            gTrajectory.properties.time.push(locations[i].timestampMs);

            location.timestamp = locations[i].timestampMs;
            location.timeFull = time;
            location.position = position;
            gHistory.push(location);

            if (previousPoint != null && time !== previousPoint.timeFull) {

                feature.properties.index = tripIndex++;
                gCollection.features.push(feature);
                gCollection.features.push({ // 连接线
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [previousPoint.position[1], previousPoint.position[0]],
                            [position[1], position[0]]
                        ]
                    },
                    properties: {
                        index: tripIndex++,
                        timestamp: [previousPoint.timestamp, location.timestamp],
                        joinLine: true
                    }
                });

                feature = {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: []
                    },
                    properties: {
                        timestamp: []
                    }
                };
            }
            feature.geometry.coordinates.push([position[1], position[0]]); // geoJSON 标准[longitude, latitude]
            feature.properties.timestamp.push(+locations[i].timestampMs);
            previousPoint = location;
        }

        D3path.init(gCollection);
//        console.log(gCollection);

    });

    dataloader.get('00a806a5304165f991430f2608e447f4', datasource.getSource('user_travel'), {
        source: 'home',
        type: 'post'
    }, function(data) {
        console.table(data[0]['00a806a5304165f991430f2608e447f4']['u_navi_tracks']);
    });

//    dataloader.get('00a806a5304165f991430f2608e447f4', datasource.getSource('user_trip'), {
//        source: 'home',
//        type: 'post'
//    }, function(data) {
//        console.log(data);
//    });
});
