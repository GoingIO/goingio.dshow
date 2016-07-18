/**
 * Created by telen on 15/5/5.
 */

require(['leaflet', 'd3', 'toastr'], function(L, d3, toastr) {

    function resizeMap() {
        var _height = window.innerHeight;
        var _naviHeight = $('nav').height();
        $('#map').height(_height - _naviHeight);
    }
    resizeMap();

    var resizeTimer = null;
    window.onresize = function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeMap, 200);
    };
    window.onresize();


    (function() {
        if(typeof(L) !== 'undefined') {
            /**
             * full canvas layer implementation for Leaflet
             */

            L.CanvasLayer = L.Class.extend({

                includes: [L.Mixin.Events, L.Mixin.TileLoader],

                options: {
                    minZoom: 0,
                    maxZoom: 28,
                    tileSize: 256,
                    subdomains: 'abc',
                    errorTileUrl: '',
                    attribution: '',
                    zoomOffset: 0,
                    opacity: 1,
                    unloadInvisibleTiles: L.Browser.mobile,
                    updateWhenIdle: L.Browser.mobile,
                    tileLoader: false, // installs tile loading events
                    isAnimationPaused: false,
                    animationSpeed: 10 // fps, max is 60
                },

                initialize: function (options) {
                    var self = this;
                    options = options || {};
                    //this.project = this._project.bind(this);
                    this.render = this.render.bind(this);
                    L.Util.setOptions(this, options);
                    this._canvas = this._createCanvas();
                    // backCanvas for zoom animation
                    this._backCanvas = this._createCanvas();
                    this._ctx = this._canvas.getContext('2d');
                    this.currentAnimationFrame = -1;
//                    this.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
//                    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
//                        return window.setTimeout(callback, 1000 / 60);
//                    };
//                    this.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame ||
//                    window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || function(id) { clearTimeout(id); };
                    this.requestAnimationFrame = function(callback) {
                        return window.setTimeout(callback, 1000 / self.options.animationSpeed);
                    };
                    this.cancelAnimationFrame = function(id) { clearTimeout(id); };
                },

                _createCanvas: function() {
                    var canvas;
                    canvas = document.createElement('canvas');
                    canvas.style.position = 'absolute';
                    canvas.style.top = 0;
                    canvas.style.left = 0;
                    canvas.style.pointerEvents = "none";
                    canvas.style.zIndex = this.options.zIndex || 0;
                    var className = 'leaflet-tile-container leaflet-zoom-animated';
                    canvas.setAttribute('class', className);
                    return canvas;
                },

                onAdd: function (map) {
                    this._map = map;

                    // add container with the canvas to the tile pane
                    // the container is moved in the oposite direction of the
                    // map pane to keep the canvas always in (0, 0)
                    var tilePane = this._map._panes.tilePane;
                    var _container = L.DomUtil.create('div', 'leaflet-layer');
                    _container.appendChild(this._canvas);
                    _container.appendChild(this._backCanvas);
                    this._backCanvas.style.display = 'none';
                    tilePane.appendChild(_container);

                    this._container = _container;

                    // hack: listen to predrag event launched by dragging to
                    // set container in position (0, 0) in screen coordinates
                    if (map.dragging.enabled()) {
                        map.dragging._draggable.on('predrag', function() {
                            var d = map.dragging._draggable;
                            L.DomUtil.setPosition(this._canvas, { x: -d._newPos.x, y: -d._newPos.y });
                        }, this);
                    }

                    map.on({ 'viewreset': this._reset }, this);
                    map.on('move', this.redraw, this);
//                    map.on('moveend', this.resumeRedraw, this);
//                    map.on('resize', this._reset, this);
                    map.on({
                        'zoomanim': this._animateZoom,
                        'zoomend': this._endZoomAnim
                    }, this);

                    if(this.options.tileLoader) {
                        this._initTileLoader();
                    }

                    this._reset();
                },

                _animateZoom: function (e) {
                    if (!this._animating) {
                        this._animating = true;
                    }
                    var back = this._backCanvas;

                    back.width = this._canvas.width;
                    back.height = this._canvas.height;

                    // paint current canvas in back canvas with trasnformation
                    var pos = this._canvas._leaflet_pos || { x: 0, y: 0 };
                    back.getContext('2d').drawImage(this._canvas, 0, 0);

                    // hide original
                    this._canvas.style.display = 'none';
                    back.style.display = 'block';
                    var map = this._map;
                    var scale = map.getZoomScale(e.zoom);
                    var newCenter = map._latLngToNewLayerPoint(map.getCenter(), e.zoom, e.center);
                    var oldCenter = map._latLngToNewLayerPoint(e.center, e.zoom, e.center);

                    var origin = {
                        x:  newCenter.x - oldCenter.x,
                        y:  newCenter.y - oldCenter.y
                    };

                    var bg = back;
                    var transform = L.DomUtil.TRANSFORM;
                    bg.style[transform] =  L.DomUtil.getTranslateString(origin) + ' scale(' + e.scale + ') ';
                },

                _endZoomAnim: function () {
                    this._animating = false;
                    this._canvas.style.display = 'block';
                    this._backCanvas.style.display = 'none';
                },

                getCanvas: function() {
                    return this._canvas;
                },

                getAttribution: function() {
                    return this.options.attribution;
                },

                draw: function() {
                    return this._reset();
                },

                onRemove: function (map) {
                    this._container.parentNode.removeChild(this._container);
                    map.off({
                        'viewreset': this._reset,
                        'move': this._render,
                        'resize': this._reset,
                        'zoomanim': this._animateZoom,
                        'zoomend': this._endZoomAnim
                    }, this);
                },

                addTo: function (map) {
                    map.addLayer(this);
                    return this;
                },

                setOpacity: function (opacity) {
                    this.options.opacity = opacity;
                    this._updateOpacity();
                    return this;
                },

                setZIndex: function(zIndex) {
                    this._canvas.style.zIndex = zIndex;
                },

                bringToFront: function () {
                    return this;
                },

                bringToBack: function () {
                    return this;
                },

                _reset: function () {
                    var size = this._map.getSize();
                    this._canvas.width = size.x;
                    this._canvas.height = size.y;

                    // fix position
                    var pos = L.DomUtil.getPosition(this._map.getPanes().mapPane);
                    if (pos) {
                        L.DomUtil.setPosition(this._canvas, { x: -pos.x, y: -pos.y });
                    }
                    this.onResize();
                    this._render();
                },

                /*
                 _project: function(x) {
                 var point = this._map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
                 return [point.x, point.y];
                 },
                 */

                _updateOpacity: function () { },

                _render: function() {
//                    if (!this.options.isAnimationPaused) {
                        if (this.currentAnimationFrame >= 0) {
                            this.cancelAnimationFrame.call(window, this.currentAnimationFrame);
                        }
                        this.currentAnimationFrame = this.requestAnimationFrame.call(window, this.render);
//                    }
                },

                // use direct: true if you are inside an animation frame call
                redraw: function(direct) {
                    var domPosition = L.DomUtil.getPosition(this._map.getPanes().mapPane);
                    if (domPosition) {
                        L.DomUtil.setPosition(this._canvas, { x: -domPosition.x, y: -domPosition.y });
                    }
                    if (direct) {
                        this.render();
                    } else {
                        this._render();
                    }
                },

                onResize: function() {
                },

                render: function() {
                    throw new Error('render function should be implemented');
                },

                pauseRedraw: function() {
                    if (!this.options.isAnimationPaused) {
                        if (this.currentAnimationFrame >= 0) {
                            this.cancelAnimationFrame.call(window, this.currentAnimationFrame);
                        }
                        this.options.isAnimationPaused = true;
                    }
                },

                resumeRedraw: function() {
                    if (this.options.isAnimationPaused) {
                        if (this.currentAnimationFrame >= 0) {
                            this.cancelAnimationFrame.call(window, this.currentAnimationFrame);
                        }
                        this.currentAnimationFrame = this.requestAnimationFrame.call(window, this.render);
                        this.options.isAnimationPaused = false;
                    }
                }

            });

        }
    })();

    var center = [39.92, 116.46];
    var map = L.map('map').setView(center, 14);

    // Disable drag and zoom handlers.
//    map.dragging.disable();
//    map.touchZoom.disable();
//    map.doubleClickZoom.disable();
//    map.scrollWheelZoom.disable();

    var maplayer  =  L.tileLayer('http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        attribution: null
    }).addTo(map);
//    L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
//        maxZoom: 18,
//        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery <a href="http://stamen.com">Stamen</a>'
//    }).addTo(map);

    var gHistory = [];
    var gTrajectory = {
        "coordinates":[],
        "properties": {
            "time": []
        }
    };

    var gCollection = {
        type: "FeatureCollection",
        features: []
    };
    var gContext;
    var gTracks; // polyline轨迹

    var MovingPoint = function(position) {
        this.radius = 2;
        this.opaticy = 1.0;
        this.position = position; // [latitude, longitude]

        this.update = function() {
            this.radius = this.radius + 2;
            this.opaticy = this.opaticy - 0.2;
        };
    };

    var CanvasLayer = L.CanvasLayer.extend({
        animateFrameIndex: 0,
        movingPoints: [],
        panTimerId: -1,

        drawTrajectray: function(context) {
            var that = this;

            var r = $.Deferred();

            $.getJSON(DSHOW_CONTEXT + "/statics/js/dshow/report/spiderkiller/LocationHistory.json", function(data) {
                var feature = {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: []
                    }
                };
                var SCALAR_E7 = 0.0000001; // Since Google Takeout stores latlngs as integers
                var locations = data.locations;
                for (var i = locations.length - 1; i >= 0; i--) {
                    var location = {};
                    var position = [];
                    position[0] = locations[i].latitudeE7 * SCALAR_E7;
                    position[1] = locations[i].longitudeE7 * SCALAR_E7;
                    gTrajectory.coordinates.push(position);
                    gTrajectory.properties.time.push(locations[i].timestampMs);

                    feature.geometry.coordinates.push([position[1], position[0]]); // geoJSON 标准[longitude, latitude]

                    location.timestamp = locations[i].timestampMs;
                    location.position = position;
                    gHistory.push(location);
                }

                gCollection.features.push(feature);

                svgPolyline();
                that.timeSlider(gHistory.length-1);
                r.resolve();
            });

            return r;
        },

        drawPoints: function() {
            var that = this;
            var canvas = this.getCanvas();
            var context = canvas.getContext('2d');

            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw gHistory point with animation;
            (function delayLoop(i) {
                 var d       = gHistory[i];
                 var latlong = that._map.latLngToContainerPoint(d.position);
                 context.beginPath();
                 context.fillStyle = "rgba(110, 23, 88, 0.2)";
                 context.arc(latlong.x, latlong.y, 3, 0, Math.PI * 2);
                 context.closePath();
                 context.fill();

                 if (i--) delayLoop(i);
             })(gHistory.length-1);

            var position = gHistory[this.animateFrameIndex].position;

//            context.beginPath();
//            context.fillStyle = "rgba(110, 23, 88, 0.2)";
//            context.arc(latlong.x, latlong.y, 30, 0, Math.PI * 2);
//            context.closePath();
//            context.fill();

            this.movingPoints.unshift(new MovingPoint(position));

//            this._map.panTo(position);


            for (var i = 0; i < this.movingPoints.length; i++) {
                var latLng = this._map.latLngToContainerPoint(this.movingPoints[i].position);

                context.beginPath();
                context.strokeStyle = "rgba(255, 53, 123," + this.movingPoints[i].opaticy + ")";
                context.fillStyle = "rgba(255, 23, 88, " + this.movingPoints[i].opaticy +  ")";
                context.arc(latLng.x, latLng.y, this.movingPoints[i].radius, 0, Math.PI * 2);
                context.fill();
                context.stroke();
                context.closePath();

                this.movingPoints[i].update();
            }

            for (var i = this.movingPoints.length - 1; i >= 0; i--) {
                if (i > 4) {
                    this.movingPoints.splice(i, 1);
                }
            }

        },

        timeSlider: function(max) {
            var that = this;
            var timerSliderTemplate = '<div class="timeslider"><ul><li class="controls"><i class="fa fa-play"></i></li><li class="time"><p class="value"></p></li><li ><div class="slider-wrapper"><div class="slider slider-info"></div></div></li><li class="last tracks"><input type="checkbox" checked/><span>轨迹</span></li></ul></div>';
            $("#timeslider").html(timerSliderTemplate);

            $(".timeslider li.controls i").click(function() {
                if ($(this).hasClass("fa-pause")) {
                    layer.resumeRedraw();
                    $(this).removeClass("fa-pause").addClass("fa-play");
                } else if ($(this).hasClass("fa-play")) {
                    layer.pauseRedraw();
                    $(this).removeClass("fa-play").addClass("fa-pause");
                }
            });

            $("div.slider-wrapper div.slider").slider({
                range: "min",
                value: 1,
                min: 1,
                max: max||100,
                slide: function( event, ui ) {
                    layer.animateFrameIndex = ui.value;
                }
            });

            that.timeSlider.setSliderValue = function(value) {
                $("div.slider-wrapper div.slider").slider("value", value);
                $(".timeslider li.time p").text(new Date(+gHistory[value].timestamp).format("yy/MM/dd hh:mm"));
            };

            /**
             * Tracks display controller
             */
            $("li.tracks input").click(function() {
                if ($(this).is(":checked")) {
                    map.addLayer(gTracks);
                } else {
                    map.removeLayer(gTracks);
                }
            });
        },

        render: function() {
            var that = this;
            var canvas = this.getCanvas();
            var context = canvas.getContext('2d');
            gContext = canvas.getContext('2d');

            // get center from the map (projected)
            var point = this._map.latLngToContainerPoint(center);

            // clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

//            console.log("redraw");
            // render
//            this.drawText(context, point);

//            this.drawTrajectray(context);

//            this.renderCircle(context, point, (1.0 + Math.sin(Date.now()*0.001))*300);

//            this.redraw();

            if (gHistory.length == 0) {
                this.drawTrajectray(context).done(function() {
                    that.redraw();
                });
            } else {
                if (this.animateFrameIndex < gHistory.length-1) {
//                    this.drawPoints();
                    if (!this.options.isAnimationPaused) {
                        this.animateFrameIndex++;
                    } else {
                        this.drawPoints(); // Draw the point when animation is paused
                    }
                } else {
                    this.animateFrameIndex = 0;
                }
                this.redraw();
            }

        }
    });

    var layer = new CanvasLayer();
    layer.addTo(map);

    /**
     * Observe layer.animateFrameIndex to handle timerSlider and animation.
     * @type {*|PathObserver}
     */
    var observer = new PathObserver(layer, "animateFrameIndex");
    observer.open(function(newValue, oldValue) {
        layer.timeSlider.setSliderValue(newValue);
        layer.drawPoints();
    });



    function svgPolyline() {
        console.log(gTrajectory.coordinates.length);
        // create a red polyline from an array of LatLng points
        gTracks = L.polyline(gTrajectory.coordinates, {color: 'red'});

        map.addLayer(gTracks);
        // zoom the map to the polyline
//              map.fitBounds(gTracks.getBounds());
    }

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


            if (previousPoint != null && time != previousPoint.timeFull) {

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
                        timestamp: [],
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

    });


    function timeDimension(gHistory, _map) {
        (function delayLoop(i) {
            setTimeout(function () {
                var d       = gHistory[i];
                var latlong = _map.latLngToContainerPoint(d.position);
                plist.push(new pp(latlong.x, latlong.y));
                if (i--) delayLoop(i);
            }, 16);
         })(gHistory.length-1);
    }


    function loop() {
        gContext.clearRect(0, 0, gContext.canvas.width, gContext.canvas.height);

        for (var i = 0; i < plist.length; i++) {
            if (plist[i].lifetime) {
                plist[i].update();
            } else {
                plist.splice(i, 1);
            }
        }
        requestAnimationFrame(loop);
    }

    /**
     * flashing point
     * @param x
     * @param y
     */
    var pp = function(x, y) {
        this.radius = 3;
        this.lifetime = 10;

        this.draw = function() {

            var alpha = this.lifetime * 0.1;
            gContext.fillStyle = "rgba(223,22,44," + alpha + ")";
            gContext.strokeStyle = "rgba(255, 123, 123," + alpha + ")";
            gContext.beginPath();
            gContext.arc(x, y, this.radius, 0, Math.PI * 2, false);
            gContext.fill();
            gContext.stroke();
            gContext.closePath();
        };

        this.update = function() {
            this.radius++;
            this.lifetime--;
            this.draw();
        };
    };

});