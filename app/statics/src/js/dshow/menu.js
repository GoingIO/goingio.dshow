require(['menu'], function(menu) {
	function _createMenuTree(menus){
		var $ul = $('<ul>');
		if(menus){
			for(var index in menus){
				var $li = $('<li />');
				var $a = $('<a />');
				if(menus[index]['icon']){
					$a.append($('<i />').addClass(menus[index]['icon']));
				}
				
				if(menus[index]['name']){
					$a.append($('<span />').addClass('title').text(menus[index]['name']));
				}
				
				$li.append($a);
				if(menus[index]['children']){
					var $children = _createMenuTree(menus[index]['children']);
					if($children){
						$li.append($children);
					}
					$a.attr('href', '#');
				}else{
					if (menus[index]['path'].indexOf('/r/') >=0 ) {
						$a.attr('href', DSHOW_CONTEXT + '/web' + menus[index]['path']);
					} else {
						$a.attr('href', DSHOW_CONTEXT + '/web/m' + menus[index]['path']);
					}

				}
				$ul.append($li);
			}
		}
		return $ul;
	}
	
	var menus = menu.getMenus();
	var ul = _createMenuTree(menus);
	$('ul.navbar-nav').html(ul.html());
});