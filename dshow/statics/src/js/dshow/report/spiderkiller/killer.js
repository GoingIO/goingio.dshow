/**
 * Created by telen on 15/5/5.
 */

require(['leaflet', 'd3', 'GUI', 'toastr', 'blackhole'], function(L, d3, GUI, toastr) {
    var _height = window.innerHeight;
    var _naviHeight = $('nav').height();
    $('#map').height(_height - _naviHeight);

    /**
     * adding wrapper for blackhole.js layer for map
     */
    !function(){
        L.BlackHoleLayer = L.Class.extend({
            // выполняется при инициализации слоя
            initialize: function () {
            },

            // когда слой добавляется на карту то вызывается данный метод
            onAdd: function (map) {
                //
                if (this._el) {
                    this._el.style('display', null);
                    if (this._bh.IsPaused())
                        this._bh.resume();
                    return;
                }


                this._map = map;

                //выбираем текущий контейнер для слоев и создаем в нем наш div,
                //в котором будет визуализация
                this._el = d3.select(map.getPanes().overlayPane).append('div');

                // создаем объект blackHole
                this._bh = d3.blackHole(this._el);

                //задаем класс для div
                var animated = map.options.zoomAnimation && L.Browser.any3d;
                this._el.classed('leaflet-zoom-' + (animated ? 'animated' : 'hide'), true);
                this._el.classed('leaflet-blackhole-layer', true);

                // определяем обработчики для событии
                map.on('viewreset', this._reset, this)
                    .on('resize', this._resize, this)
                    .on('move', this._reset, this)
                    .on('moveend', this._reset, this)
                ;

                this._reset();
            },

            // соответственно при удалении слоя leaflet вызывает данный метод
            onRemove: function (map) {
                if (this.onHide && typeof this.onHide === 'function')
                    this.onHide();

                this._el.style('display', 'none');
                if (this._bh.IsRun())
                    this._bh.pause();
            },

            // вызывается для того чтоб добывать данный слой на выбранную карту.
            addTo: function (map) {
                map.addLayer(this);
                return this;
            },

            // внутренний метод используется для события resize
            _resize : function() {
                // выполняем масштабирование визуализации согласно новых размеров.
                this._bh.size([this._map._size.x, this._map._size.y]);
                this._reset();
            },

            // внутренний метод используется для позиционирования слоя с визуализацией корректно на экране
            _reset: function () {
                var topLeft = this._map.containerPointToLayerPoint([0, 0]);

                var arr = [-topLeft.x, -topLeft.y];

                var t3d = 'translate3d(' + topLeft.x + 'px, ' + topLeft.y + 'px, 0px)';

                this._bh.style({
                    "-webkit-transform" : t3d,
                    "-moz-transform" : t3d,
                    "-ms-transform" : t3d,
                    "-o-transform" : t3d,
                    "transform" : t3d
                });
                this._bh.translate(arr);
            }
        });


        L.blackHoleLayer = function() {
            return new L.BlackHoleLayer();
        };
    }();

//    var center = [37.1024, 108.8964];
    var center = [41.03912, 116.691288];
    var map = L.map('map').setView(center, 6);
    var osm  =  L.tileLayer('http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        attribution: null
    }).addTo(map);

    var visLayer = L.blackHoleLayer()
//        , heat = L.heatLayer( [], {
//            opacity: 1,
//            radius: 25,
//            blur: 15
//        }).addTo( map )
        ;
    visLayer.addTo(map);

    var bh = visLayer._bh
        , parentHash
        , locations
        , cur
        , all
        , stepDate = 864e5
        , df = d3.time.format('%d-%m-%Y')
        , dn = d3.time.format(',.2f')
        , progress = {
            state: 'init',
            process : 0
        };

    var SCALAR_E7 = 0.0000001 // Since Google Takeout stores latlngs as integers
        ;


    bh.setting.realtime = true;
    bh.setting.increaseChild = false;
    bh.setting.createNearParent = false;
    bh.setting.speed = 100;
    bh.setting.skipEmptyDate = true;
    bh.setting.zoomAndDrag = true;
    bh.setting.drawParent = true;
    bh.setting.drawParentLabel = false;
    bh.setting.padding = 0;
    bh.setting.parentLife = 0;
    bh.setting.blendingLighter = true;
    bh.setting.drawAsPlasma = true;
    bh.setting.drawTrack = true;

    !function() {
        var gui = new dat.GUI({
            load : JSON
            , preset : 'Default'
            , autoPlace: false
        });

        d3.select('#gui-cont').node().appendChild(gui.domElement);

        var f = gui.addFolder('Items');
        f.add(bh.setting, 'alpha', 0.001, .1).step(.0001).listen();
        f.add(bh.setting, 'childLife', 0, 1000).step(5).listen();
        f.add(bh.setting, 'parentLife', 0, 1000).step(5).listen();
        f.add(bh.setting, 'rateOpacity', .01, 10).step(.1).listen();
        f.add(bh.setting, 'rateFlash', .01, 10).step(.1).listen();
        f.add(bh.setting, 'padding', 0, 100).step(5).listen();

        f = gui.addFolder('Behavior');
        f.add(bh.setting, 'skipEmptyDate').listen();
        f.add(bh.setting, 'asyncParsing').listen();
        f.add(bh.setting, 'increaseChildWhenCreated').listen();
        f.add(bh.setting, 'createNearParent').listen();
        f.add(bh.setting, 'speed', 0, 1000).step(5).listen();


        f = gui.addFolder('Drawing');
        f.add(bh.setting, 'blendingLighter').listen();
        f.add(bh.setting, 'drawTrack').listen();
        f.add(bh.setting, 'drawEdge').listen();
        f.add(bh.setting, 'drawChild').listen();
        f.add(bh.setting, 'drawChildLabel').listen();
        f.add(bh.setting, 'drawParent').listen();
        f.add(bh.setting, 'drawParentLabel').listen();
        f.add(bh.setting, 'drawPaddingCircle').listen();
        f.add(bh.setting, 'drawHalo').listen();
        f.add(bh.setting, 'drawAsPlasma').listen();
        f.add(bh.setting, 'drawParentImg').listen();
        f.add(bh.setting, 'hasLabelMaxWidth').listen();

        gui.add(progress, 'state').listen();
        gui.add(progress, 'process', 0, 100).name('state %').listen();

//        gui.add(window, 'pause').name('pause/resume');
//        gui.add(window, 'restart');

        gui.remember(bh.setting);
    }();

    function restart() {
        bh.stop();
        cur = 0;

        if ( !locations || !locations.length)
            return;

//        heat.setLatLngs([]);

        all = locations.length;
        progress.process = 0;
        progress.state = 'parsing';
        bh.start(locations, map._size.x, map._size.y, true);
        visLayer._resize();
    }

    d3.json(DSHOW_CONTEXT + "/statics/js/dshow/report/spiderkiller/LocationHistory.json", function(json) {
        locations = json.locations;

        parentHash = {};

        var last;

        var sw = [-Infinity, -Infinity]
            , se = [Infinity, Infinity];

        locations.forEach(function(d, i) {
            d._id = i;
            d.timestampMs = +d.timestampMs;

            d.lat = d.latitudeE7 * SCALAR_E7;
            d.lon = d.longitudeE7 * SCALAR_E7;
            d.pkey = d.latitudeE7 + "_" + d.longitudeE7;

            sw[0] = Math.max(d.lat, sw[0]);
            sw[1] = Math.max(d.lon, sw[1]);
            se[0] = Math.min(d.lat, se[0]);
            se[1] = Math.min(d.lon, se[1]);

            d.parent = parentHash[d.pkey] || makeParent(d);
        });

        locations.sort(function(a, b) {
            return a.timestampMs - b.timestampMs;
        });

        locations.forEach(function(d, i) {
            d._id = i;
        });
        map.fitBounds([sw, se]);

        console.log(locations);
        restart();
    });


    function makeParent(d) {
        var that = {_id : d.pkey};
        that.latlng = new L.LatLng(d.lat, d.lon);

        //getting always actual coordinates
        that.x = {
            valueOf : function() {
                var pos = map.latLngToLayerPoint(that.latlng);
                return pos.x;
            }
        };

        that.y = {
            valueOf : function() {
                var pos = map.latLngToLayerPoint(that.latlng);
                return pos.y;
            }
        };

        return parentHash[that.id] = that;
    }


    // realtime append array
//    bh.append(array)

    stepDate = 1;
//bh.setting.asyncParsing = true;
    bh.on('getGroupBy', function (d) {
        return d._id; //d.timestampMs;
    })
        .on('getParentKey', function (d) {
            return d._id;
        })
        .on('getChildKey', function (d) {
            return 'me';
        })
        .on('getCategoryKey', function (d) {
            return 'me';
        })
        .on('getCategoryName', function (d) {
            return 'location';
        })
        .on('getParentLabel', function (d) {
            return '';
        })
        .on('getChildLabel', function (d) {
            return 'me';
        })
        .on('calcRightBound', function (l) {
            return l + stepDate;
        })
        .on('getVisibleByStep', function (d) {
            return true;
        })
        .on('getCreateNearParent', function (d) {
            return true;
        })
        .on('getParentRadius', function (d) {
            return 1;
        })
        .on('getChildRadius', function (d) {
            return 10;
        })
        .on('getValue', function (d) {
            return 1;
        })
        .on('getParentPosition', function (d) {
            return [d.x, d.y];
        })
        .on('getParentFixed', function (d) {
            return true;
        })
        .on('started', function() {
            progress.state = "Run...";
            progress.process = 0;
            cur = 0;
        })
        .on('processing', function(items, l, r) {
            cur += items ? items.length : 0;

            var m = d3.mean(items, function(d) {
                return d.timestampMs;
            });

            progress.state = df(new Date(m));
            progress.process = (cur / all) * 100;
//            setTimeout(setMarkers(items), 10);
        })
        .on('parsing', function() {
            progress.state = cur++ + ' of ' + all;
            progress.process = (cur / all) * 100;
        })
        .sort(null)
    ;

    function setMarkers(arr) {
        return function() {
            arr.forEach(function (d) {
                var tp = d.parentNode.nodeValue;
//                heat.addLatLng(tp.latlng);
            });
        }
    }

    // resize the map
    var resizeTimer = null;
    window.onresize = function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            var _height = window.innerHeight;
            var _naviHeight = $('nav').height();
            $('#map').height(_height - _naviHeight);
        }, 200);
    };
    window.onresize();
});