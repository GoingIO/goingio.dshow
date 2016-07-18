var dragging = false
var HeatmapOverlay = L.Class.extend({

    initialize: function (config) {
        this.cfg = config || {};
        this.cfg.valueField = this.cfg.valueField || "value";
        this._el = L.DomUtil.create('div', 'leaflet-zoom-hide');
        this._data = [];
        this._max = 1;
        this.cfg.container = this._el;
    },
    getRadius: function () {
        var zoom = this._map.getZoom();
        return zoom - 1
    },
    onAdd: function (map) {
        var size = map.getSize();
        var self = this;

        this._map = map;

        this._width = size.x;
        this._height = size.y;

        this._el.style.width = size.x + 'px';
        this._el.style.height = size.y + 'px';

        this._resetOrigin();

        map.getPanes().overlayPane.appendChild(this._el);

        if (!this._heatmap) {
            this._heatmap = h337.create(this.cfg);
        }
        this.cfg.viewreset = this.cfg.viewreset || this._resetOrigin
        this.cfg.dragend = this.cfg.dragend || this._draw
        this.cfg.resize = this.cfg.resize || function () {
            }
        this.dragend = function () {
            dragging = false
        }
        this.dragstart = function () {
            dragging = true
        }
        map.on('viewreset', this.cfg.viewreset, this);
        map.on('dragend', this.cfg.dragend, this);
        map.on('resize', this.cfg.resize, this)
        map.on('dragend', this.dragend, this)
        map.on('dragstart', this.dragstart, this)

        this._draw();
    },

    onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._el);

        map.off('viewreset', this.cfg.viewreset, this);
        map.off('dragend', this.cfg.dragend, this);
        map.off('resize', this.cfg.resize, this);
        map.off('dragend', this.dragend, this);
        map.off('dragstart', this.dragstart, this);
    },
    _draw: function () {
        if (!this._map) {
            return;
        }

        var point = this._map.latLngToContainerPoint(this._origin);

        // reposition the layer
        this._el.style[HeatmapOverlay.CSS_TRANSFORM] = 'translate(' + -Math.round(point.x) + 'px,' + -Math.round(point.y) + 'px)';

        this._update();

    },
    _update: function () {
        var bounds, zoom, scale;

        zoom = this._map.getZoom();

        if (this._data.length == 0) {
            return;
        }

        var generatedData = {max: this._max};
        var latLngPoints = [];
        var radiusMultiplier = this.cfg.scaleRadius ? scale : 1;
        var localMax = 0;
        var valueField = this.cfg.valueField;
        var len = this._data.length;
        while (len > 0) {
            len--
            var entry = this._data[len];
            var value = entry[valueField];
            var latlng = entry.latlng;

            // we don't wanna render points that are not even on the map ;-)
            // local max is the maximum within current bounds
            if (value > localMax) {
                localMax = value;
            }

            var point = this._map.latLngToContainerPoint(latlng);
            var latlngPoint = {x: Math.round(point.x), y: Math.round(point.y)};
            latlngPoint[valueField] = value;

            var radius;

            latlngPoint.radius = this.getRadius();
            latLngPoints.push(latlngPoint);
        }
        if (this.cfg.useLocalExtrema) {
            generatedData.max = localMax;
        }

        generatedData.data = latLngPoints;

        this._heatmap.setData(generatedData);
    },
    setData: function (data) {
        if (this._heatmap) {
            this._heatmap.clear()
        }
        this._max = data.max || this._max;
        var latField = this.cfg.latField || 'lat';
        var lngField = this.cfg.lngField || 'lng';
        var valueField = this.cfg.valueField || 'value';

        // transform data to latlngs
        var data = data.data;
        var len = data.length;
        var d = [];

        while (len--) {
            var entry = data[len];
            var latlng = new L.LatLng(entry[latField], entry[lngField]);
            var dataObj = {latlng: latlng};
            dataObj[valueField] = entry[valueField];
            if (entry.radius) {
                dataObj.radius = entry.radius;
            }
            d.push(dataObj);
        }
        this._data = d;

        this._draw();
    },
    addData: function (data) {
        var latlng = new L.LatLng(data.lat, data.lng);
        this._data.push({
            latlng: latlng,
            value: data.value
        })
        if (!dragging) {
            var point = this._map.latLngToContainerPoint(latlng)
            this._heatmap.addData({
                x: Math.round(point.x),
                y: Math.round(point.y),
                value: data.value,
                radius: this.getRadius()
            })
        }
    },
    multiply: function (value) {
        if (dragging) {
            return
        }
        var data = []
        for (var i = 0; i < this._data.length; ++i) {
            var point = this._data[i]
            var decayValue = point.value * value
            if (decayValue > this.cfg.minValue) {
                data.push({
                    latlng: point.latlng,
                    value: decayValue
                })
            }
        }
        this._data = data
        this._heatmap.multiply(value)
    },
    _resetOrigin: function () {
        this._origin = this._map.layerPointToLatLng(new L.Point(0, 0));
        this._draw();
    }
});

HeatmapOverlay.CSS_TRANSFORM = (function () {
    var div = document.createElement('div');
    var props = [
        'transform',
        'WebkitTransform',
        'MozTransform',
        'OTransform',
        'msTransform'
    ];

    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (div.style[prop] !== undefined) {
            return prop;
        }
    }

    return props[0];
})();