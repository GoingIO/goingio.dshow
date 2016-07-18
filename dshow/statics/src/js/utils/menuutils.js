define(function() {
	var menus = {};
	$.ajax({
		url: DSHOW_CONTEXT + "/statics/js/dshow/menu.json?v=" + DSHOW_VERSION,
		async: false,
		cache: true,
		dataType: 'json',
		success: function(data){
			menus = data[0];
		}
	});
	
	
	var getMenus = function(){
		return menus;
	}
	
	var getMenuActive = function() {
		var url = window.location.href;
		url = url.indexOf('?') > -1 ? url.substr(0, url.indexOf('?')) : url;
		if (url.indexOf('/web/m') > 0) {
			url = url.substr(url.indexOf('/web/') + 7);
			return url.split('/');
		} else if (url.indexOf('/web/i') > 0) {
			url = url.substr(url.indexOf('/web/') + 4);
			var u = new Array;
			u.push(url);
			return u;
		}
	}

	return {
		getMenus : getMenus,
		getMenuActive : getMenuActive
	}
});