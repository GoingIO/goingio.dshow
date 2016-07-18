require.config({
    waitSeconds: 200,
    urlArgs: 'v=' + DSHOW_VERSION,
    baseUrl: DSHOW_CONTEXT + "/statics/js/",
    paths: {
        'xenon': DSHOW_CONTEXT + '/statics/js/themes/' + DSHOW_THEME + '/xenon',
        'toastr': DSHOW_CONTEXT + '/statics/js/toastr.min',
        'leaflet': DSHOW_CONTEXT + '/statics/js/leaflet-src',
        'mapbox': DSHOW_CONTEXT + '/statics/js/utils/mapbox/mapbox',
        'dataloader': DSHOW_CONTEXT + '/statics/js/utils/dataloader',
        'datautils': DSHOW_CONTEXT + '/statics/js/utils/datautils',
        'datasource': DSHOW_CONTEXT + '/statics/js/utils/datasource',
        'menu': DSHOW_CONTEXT + '/statics/js/utils/menuutils',
        'utils': DSHOW_CONTEXT + '/statics/js/utils/utils',
        'colornumbermap': DSHOW_CONTEXT + '/statics/js/utils/colornumbermap',
        'opacitynumbermap': DSHOW_CONTEXT + '/statics/js/utils/opacitynumbermap',
        "directives": DSHOW_CONTEXT + '/statics/js/utils/directives',
        "services": DSHOW_CONTEXT + '/statics/js/utils/services',
        'prototype': DSHOW_CONTEXT + '/statics/js/utils/prototype',
        'promise-util': DSHOW_CONTEXT + '/statics/js/utils/promise-util',
        'md5': DSHOW_CONTEXT + '/statics/js/utils/md5',
        'dateutil': DSHOW_CONTEXT + '/statics/js/utils/dateutil',
        'daterange': DSHOW_CONTEXT + '/statics/js/utils/datepicker/date-range',
        'datemonth': DSHOW_CONTEXT + '/statics/js/utils/datepicker/date-month',
        'datepicker': DSHOW_CONTEXT + '/statics/js/utils/datepicker',
        'table_t2': DSHOW_CONTEXT + '/statics/js/utils/table-t2',
        'bootstrap_table': DSHOW_CONTEXT + '/statics/js/utils/bootstrap-table',
        'd3': DSHOW_CONTEXT + '/statics/js/d3.v3',
        'nvd3': DSHOW_CONTEXT + '/statics/js/nv.d3',
        'odometer': DSHOW_CONTEXT + '/statics/js/utils/odometer',
        'socketio': DSHOW_CONTEXT + '/statics/js/socket.io.min',
        'sourceUtils': DSHOW_CONTEXT + '/statics/js/utils/source-utils',
        'TweenLite': DSHOW_CONTEXT + '/statics/js/lib/TweenLite',
        'EasePack': DSHOW_CONTEXT + '/statics/js/lib/EasePack',
        'underscore': DSHOW_CONTEXT + '/statics/js/underscore-min',
        'confetti': DSHOW_CONTEXT + '/statics/js/utils/confetti',
        'firework': DSHOW_CONTEXT + '/statics/js/utils/firework',
        'TweenMax': DSHOW_CONTEXT + '/statics/js/lib/TweenMax',
        'SplitText': DSHOW_CONTEXT + '/statics/js/lib/SplitText',
        'TWEEN': DSHOW_CONTEXT + '/statics/js/lib/Tween',
        'react':DSHOW_CONTEXT+'/statics/js/react',
        'react-dom':DSHOW_CONTEXT+'/statics/js/react-dom',
        'd3cloud':DSHOW_CONTEXT+'/statics/js/d3.layout.cloud',
        'adcodes': DSHOW_CONTEXT + '/statics/js/utils/adcodes',
    },
    shim: {
        d3: {
            exports: 'd3'
        },
        TweenLite: {
            exports: 'TweenLite'
        },
        SplitText: {
            deps : ['TweenMax']
        }
//		'leafletheat': {
//			deps: ['leaflet'],
//			export: 'L.heatLayer'
//		}
    }
});