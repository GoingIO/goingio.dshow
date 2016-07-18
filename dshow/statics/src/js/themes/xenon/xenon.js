require.config({
	waitSeconds : 200,
	baseUrl : DSHOW_CONTEXT + '/statics/js/themes/' + DSHOW_THEME,
	urlArgs : 'v=' + DSHOW_VERSION,
	paths : {
		'resizeable': 'resizeable',
/*		'joinable': 'joinable',
*/		'TweenMax': 'TweenMax',
		'xenon-api': 'xenon-api',
		'xenon-custom': 'xenon-custom',
		'xenon-notes': 'xenon-notes',
		'xenon-toggles': 'xenon-toggles',
		'xenon-widgets': 'xenon-widgets',
	}
});

define(['resizeable', 'TweenMax', 'xenon-api', 'xenon-custom', 'xenon-notes', 'xenon-toggles', 'xenon-widgets'], function(){
	
});