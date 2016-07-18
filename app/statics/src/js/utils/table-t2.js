/**
 * 按列展现数据
 */
define(['utils'],function(utils){
	function Table(options){
		var self = this;
		
		var _id = (options ==  undefined || options.id == undefined) ? 'bootstrapTable' : options.id;
		var _pagenation =  (options == undefined || options.pagenation == undefined) ? true : options.pagenation;
		var _render = (options == undefined || options.render == undefined || !_isFunction(options.render)) ? function(){} : options.render; 
		var _pageSize = (options == undefined || options.pageSize == undefined) ? 10 : options.pageSize;
		var _title = (options == undefined || options.title == undefined) ? '' : options.title;
		var _exportable = (options == undefined || options.exportable == undefined) ? true : options.exportable;
		var _border = (options == undefined || options.border == undefined) ? true : options.border;  
		
		var _panel = $('<div class="panel panel-default" />');
		var _panelheading = $('<div class="panel-heading"><div class="form-horizontal" ></div></div>');
		var _panelbody = $('<div class="panel-body"/>');
		
		var _responsiveDiv = $('<div class="table-responsive" style="width: 100%"></div>');
		var _tableCanvas = $('<table class="table table-bordered table-hover" id="' + _id + '_js_table"/>');
		var _thead = $('<thead><tr class="table-header"/></thead>');
		var _tbody = $('<tbody />');
		var _pageCanvas = $('<div class="qmx_table pagenation"/>');
		var _exportBtn = $('<a href="javascript:;" class="qmx-btn-export pull-right"></a>');
		var exportStr = '';
		var _allDatas = [];
		var _snapShot = [];
		var _pageFlag = 1;
		var _fieldFormaters = {};
		var _sortEvent = function(){};

		function bind($target){
			_tableCanvas.addClass($target.attr('id'));
			_tableCanvas.append(_thead);
			_tableCanvas.append(_tbody);
			_panel.append(_panelheading);
			_panel.append(_panelbody);
			_responsiveDiv.append(_tableCanvas);
			_panelbody.append(_responsiveDiv);
			$target.empty();
			$target.append(_panel);
			
			if(!_border){
				_panel.removeClass('panel');
				_panel.removeClass('panel-default');
				_panelheading.addClass('border-panel-heading');
				_panelbody.addClass('border-panel-body');
			}
			
			
			if(_title != ''){
				_panelheading.find('.form-horizontal').append($('<label/>').append(_title));
			}
			
			
			if(_exportable){
				_panelheading.find('.form-horizontal').append(_exportBtn);
				_exportBtn.click(function(e) {
					e.preventDefault = true;
					utils.downloadFile([exportStr], 'text/csv', "report_" + new Date().valueOf() + '.csv');
				});
			}
			
			if(_pagenation){
				_panelbody.append(_pageCanvas);
			}
		}

        /**
         *
         * @param options {Object} [{ doFilter:'key' }] 'key'为过滤的字段
         * 如果options为空，且_exportable==false，_title为空，则去除heading
         */
		function plugs(options){
            if ($.isEmptyObject(options)) {
                if (_exportable || _title != '') {
                } else {
                    _panelheading.remove();
                }
            } else {
                _doFilter(options);
            }
		}
		
		function _doFilter(options){
			var doFilter = options.doFilter;
			var isMd5 = options.isMd5;
            // 单列过滤使用字符串 doFilter = "column"
            // 多列过滤使用数组 doFilter = ["column1", "column2"]
			if(doFilter != undefined){
				var filterInput = $('<input id="' + _id + '_filterValue" placeholder="请输入要查询的内容" style="margin-right:10px; height:30px;">');
				_panelheading.find('.form-horizontal').append('<span style="margin-right:5px;margin-top:3px;">搜索：</span>').append(filterInput);
				
				filterInput.keypress(function(event){
					if(event.keyCode == 13){
						_allDatas = null;
						_pageFlag = 1;
						doFilter = options.doFilter;
                        var isMultipleColumn = Object.prototype.toString.call(doFilter) == "[object Array]";

						var filterValue = $('#' + _id + '_filterValue').val();
						if(isMd5&&filterValue!=''){filterValue=hex_md5(filterValue);}
						var data = [];
						for(var index in _snapShot){
							var keyFieldValue = "";

                            if (isMultipleColumn) {
                                keyFieldValue = doFilter.reduce(function(previousValue, currentValue) {
                                    return _fieldFormaters[previousValue](_snapShot[index][previousValue]) +
                                        _fieldFormaters[currentValue](_snapShot[index][currentValue]);
                                });
                            } else {
                                keyFieldValue = _fieldFormaters[doFilter](_snapShot[index][doFilter]);
                            }

							if(typeof keyFieldValue == 'number'){
								if(keyFieldValue == filterValue || filterValue == ''){
									data.push(_snapShot[index]);
								}
							}else if(typeof keyFieldValue == 'string'){
								if(keyFieldValue.toLowerCase().indexOf(filterValue.toLowerCase()) > -1){
									data.push(_snapShot[index]);
								}
							}
						}
						_allDatas = data;
						
						var doSelect = options.doSelect;
						if(doSelect != undefined){
							var data = [];
							var selectValue = $('#' + _id + '_selectValue').val();
							for(var index in _allDatas){
								var keyFieldValue = _allDatas[index][doSelect.key];
								if(typeof keyFieldValue == 'number'){
									if(keyFieldValue == selectValue || selectValue == ''){
										data.push(_allDatas[index]);
									}
								}else if(typeof keyFieldValue == 'string'){
									if(keyFieldValue.toLowerCase().indexOf(selectValue.toLowerCase()) > -1){
										data.push(_allDatas[index]);
									}
								}
							}
							_allDatas = data;
						}
						reloadDatas();
					}
				});
			}
			
			var doSelect = options.doSelect;
			if(doSelect != undefined){
				var select = $('<select style="height:30px; width: 100px;" id="' + _id + '_selectValue"/>');
				select.append('<option value="">全部</option>');
				for(var index in doSelect.value){
					select.append('<option value="' + index + '">' +  doSelect.value[index] + '</option>');
				}
				
				_panelheading.find('.form-horizontal').append(select);
				select.change(function(){
					_allDatas = null;
					_pageFlag = 1;
					var selectValue = $('#' + _id + '_selectValue').val();
					var data = [];
					for(var index in _snapShot){
						var keyFieldValue = _snapShot[index][doSelect.key];
						if(typeof keyFieldValue == 'number'){
							if(keyFieldValue == selectValue || selectValue == ''){
								data.push(_snapShot[index]);
							}
						}else if(typeof keyFieldValue == 'string'){
							if(keyFieldValue.toLowerCase().indexOf(selectValue.toLowerCase()) > -1){
								data.push(_snapShot[index]);
							}
						}
					}
					_allDatas = data;
					
					var doFilter = options.doFilter;
					if(doFilter != undefined){
						var filterValue = $('#' + _id + '_filterValue').val();
						if(isMd5&&filterValue!=''){filterValue=hex_md5(filterValue);}
						var data = [];
						for(var index in _allDatas){
							var keyFieldValue = _fieldFormaters[doFilter](_allDatas[index][doFilter]);
							if(typeof keyFieldValue == 'number'){
								if(keyFieldValue == filterValue || filterValue == ''){
									data.push(_allDatas[index]);
								}
							}else if(typeof keyFieldValue == 'string'){
								if(keyFieldValue.toLowerCase().indexOf(filterValue.toLowerCase()) > -1){
									data.push(_allDatas[index]);
								}
							}
						}
						_allDatas = data;
					}
					
					reloadDatas();
				});
			}
			
			var doRadio = options.doRadio;
			if(doRadio != undefined){
				var radio = $('<div class="btn-group" data-toggle="buttons">');
				for(var index in doRadio.value){
					radio.append('<label class="btn btn-primary"> <input type="radio" id="radioValue" name="radioValue" value="' + index + '" autocomplete="off"> '+  doRadio.value[index] +'</label>');
				}
				radio.append('</div>');
				_panelheading.find('.form-horizontal').append(radio);
				radio.change(function(){
					_allDatas = null;
					_pageFlag = 1;
					var radioValue =$("input[name='radioValue']:checked").val();
					
					//$('#radioValue').val();  $('input:radio:checked').val();
					
					options.doFilter=radioValue.toString();
					var doFilter = options.doFilter;
					if(doFilter != undefined){
						var filterValue = $('#' + _id + '_filterValue').val();
						if(isMd5&&filterValue!=''){filterValue=hex_md5(filterValue);}
						var data = [];
						for(var index in _allDatas){
							var keyFieldValue = _fieldFormaters[doFilter](_allDatas[index][doFilter]);
							if(typeof keyFieldValue == 'number'){
								if(keyFieldValue == filterValue || filterValue == ''){
									data.push(_allDatas[index]);
								}
							}else if(typeof keyFieldValue == 'string'){
								if(keyFieldValue.toLowerCase().indexOf(filterValue.toLowerCase()) > -1){
									data.push(_allDatas[index]);
								}
							}
						}
						_allDatas = data;
					}
				});
			}
			
		}

        /**
         * 点击搜索后的回调函数
         * @param callback
         * @example function(title, field {列id}, datas{数据}) { } )
         */
		function bindSortEvent(callback){
			_sortEvent = callback;
		}

        /**
         * 添加主键列
         * @param title 显示在表头
         * @param datas {array} dic字典数组
         * @param fieldFormater value值格式化方法
         * @param defSort 是否倒排
         * @param hide
         * @param orign
         * @param style
         * @param attr
         * @returns {*}
         */
		function addKeyRow(title, datas, fieldFormater, defSort, hide, orign, style, attr){
			return addRow(title, 'key', datas, fieldFormater, defSort, 1, hide, orign, style, attr);
		}

        /**
         *
         * @param title
         * @param field
         * @param datas {Object} [rowKey:value] key需要和keyRow里的一致
         * @param fieldFormater
         * @param defSort
         * @param sort
         * @param hide
         * @param orign {boolean} 是否格式化数字
         * @param style
         * @param attr
         * @returns {*|jQuery|HTMLElement}
         */
		function addRow(title, field, datas, fieldFormater, defSort, sort, hide, orign, style, attr){
			_fieldFormaters[field] = _isFunction(fieldFormater) ? fieldFormater : function(val){return val==undefined?"":val;};
			var th = $('<th style="padding-left:20px;cursor: pointer; font-weight:normal;' + (hide?'display: none;':'display: display;') + '" ' + attr  + ' data-style="' + style + '" ' + ' data-field="' + field + '" data-defSort="' + defSort + '" data-orign="' + (orign ? 'true' : 'false') + '"  data-hide=' + (hide != undefined && hide == true ? true : false)  + ' data-active="false">' + title +  (defSort? '<span class="pull-right frontend-table-sort"></span>' : '') + '</th>');
			
			th.click(function(){
				var field = $(this).attr('data-field');
				var defSort = $(this).attr('data-defSort') == 'true' ? true : false;
				var datastyle = $(this).attr('data-style') ? $(this).attr('data-style') : '';
				if(defSort){
					_pageFlag = 1;
					var val = $(this).attr('data-sortval');
					val = val == undefined ? -1 : val;
					$(this).parent().find('span').each(function(){
						$(this).removeClass();
						$(this).addClass('pull-right');
						$(this).addClass('frontend-table-sort');
					});
					$(this).find('span').removeClass('frontend-table-sort');
					$(this).find('span').addClass(val == 1 ? 'frontend-table-up':'frontend-table-down');
					val = val == 1 ? -1 : 1;
					$(this).attr('data-sortval', val);
					
					_allDatas.sort(function(a, b){
						if (a[field] == undefined){
							return 1 * (sort == undefined ? 1 : sort);
						}
						if (b[field] == undefined){
							return -1 * (sort == undefined ? 1 : sort);
						}
						return val * ((""+b[field]).replace(/[-|%]/g, '') - (""+a[field]).replace(/[-|%]/g, '')) * (sort == undefined ? 1 : sort);
					});
					
					_snapShot.sort(function(a, b){
						if (a[field] == undefined){
							return 1 * (sort == undefined ? 1 : sort);
						}
						if (b[field] == undefined){
							return -1 * (sort == undefined ? 1 : sort);
						}
						return val * ((""+b[field]).replace(/[-|%]/g, '') - (""+a[field]).replace(/[-|%]/g, '')) * (sort == undefined ? 1 : sort);
					});
				}
				reloadDatas();
				_thead.find('th').each(function(){
					$(this).attr('data-active', 'false');
				})
				$(this).attr('data-active', 'true');
				_tbody.find('td').each(function(){
					$(this).removeClass();
				});
				_tbody.find('td[data-field="' + field + '"]').each(function(){
					$(this).addClass('active');
				});
				var datas = [];
				for (var index in _allDatas){
					datas[_allDatas[index].key] = _allDatas[index][field];
					datas.length ++;
				}
				_sortEvent(title, field, datas, datas.slice(0, _pageSize));
			});
			_thead.find('tr').append(th);
			
			if (field == 'key'){
				for (var index in datas){
					var tbody_tr = $('<tr data-key="' + datas[index] + '"/>');
					tbody_tr.append($('<td style="padding-left:10px; ' + (hide?'display: none;' : 'display: display;') + style + '" data-key="' + datas[index] + '" data-field="' + field + '">' + _fieldFormaters[field](datas[index]) + '</td>'));
					_tbody.append(tbody_tr);
					_allDatas.push({key: datas[index]});
					_snapShot.push({key: datas[index]});
				}
			}else{
				_tbody.find('tr').each(function(index){
					var key = $(this).attr('data-key');
					$(this).append($('<td style="padding-left:10px; ' + (hide?'display: none;' : 'display: display;') + style + '" data-key="' + key + '" data-field="' + field + '"  >' + (orign == 'true' ? _fieldFormaters[field](datas[key], key) : utils.formatNumber(_fieldFormaters[field](datas[key], key))) + '</td>'));
				});
				
				$.each(_allDatas, function(index, kv){
					_allDatas[index][field] = datas[kv.key];
					_snapShot[index][field] = datas[kv.key];
				});
			}
			
			if(sort != undefined){
				th.click();
			}
			
			if(_pagenation){
				flushPageNavi();
			}

			if(_exportable) {
				_export();
			}

			return th;
		}
		
		function _isFunction( fn ) {
			return !!fn && !fn.nodeName && fn.constructor != String &&  fn.constructor != RegExp && fn.constructor != Array && /function/i.test( fn + "" ); 
		} 
		
		function flushPageNavi(){
			var paginationDiv = $('<div />');
			
			var pageSizeSelect = $('<span>每页显示：</span>');
			var defaultPageSize = [10, 20, 30];
			for(var i in defaultPageSize){
				if(defaultPageSize[i] == _pageSize){
					pageSizeSelect.append('<span style="margin-right:10px;">' + defaultPageSize[i] + '</span>');
				}else{
					pageSizeSelect.append('<span style="margin-right:10px;"><a href="javascript:void(0);" data-value=' + defaultPageSize[i] + '>' + defaultPageSize[i] + '</a></span>');
				}
			}
			
			if($.inArray(_pageSize, defaultPageSize) < 0){
				pageSizeSelect.append('<span style="margin-right:10px;"><a href="javascript:void(0);" data-value=' + _pageSize + '>' + _pageSize + '</a></span>');
			}
			
			pageSizeSelect.find('span>a').click(function(){
				_pageSize = parseInt($(this).attr('data-value'));
				_pageFlag = 1;
				reloadDatas();
			});
			
		
			
			_pageCanvas.empty();
			var totalPanel = $('<div class="col-md-2"><span>' + _allDatas.length + '条记录</span><span>/</span></div>');
			var totalPage = Math.ceil(_allDatas.length / _pageSize);
			var pagePanel = $('<span>共' + totalPage + '页</span>');
			totalPanel.append(pagePanel)
			
			var nav = $('<nav class="table-nav"/>');
			var ul = $('<ul class="pagination"/>');
			
			var firstBtn = $('<li><a href="javascript:void(0);">首页</a></li>');
			if(_pageFlag == 1){
				firstBtn.addClass('disabled');
			}else{
				firstBtn.click(function(){
					_pageFlag = 1;
					reloadDatas();
				});
			};
			
			var preBtn = $('<li><a href="javascript:void(0);">上一页</a></li>');
			if (_pageFlag < 2){
				preBtn.addClass('disabled');
			}else{
				preBtn.click(function(){
					_pageFlag--;
					reloadDatas();
				});
			}
			
			var showBtn = $('<li class="disabled">').append($('<a href="javascript:void(0);">').append(_pageFlag));
			
			
			var nextBtn = $('<li><a href="javascript:void(0);">下一页</a></li>');
			if (_pageFlag > totalPage-1){
				nextBtn.addClass('disabled');
			}else{
				nextBtn.click(function(){
					_pageFlag++;
					reloadDatas();
				});
			}
			
			var lastBtn = $('<li><a href="javascript:void(0);">尾页</a></li>');
			if(_pageFlag == totalPage){
				lastBtn.addClass('disabled');
			}else{
				lastBtn.click(function(){
					_pageFlag = totalPage;
					reloadDatas();
				});
			};
			ul.append(firstBtn).append(preBtn).append(showBtn).append(nextBtn).append(lastBtn);
			paginationDiv.append(totalPanel);
			paginationDiv.append($('<div class="col-md-3">').append(pageSizeSelect));
			paginationDiv.append($('<div class="col-md-7"></div>').append(nav.append(ul)));
			_pageCanvas.append(paginationDiv);
		}
		
		function _export(){
			var newExcelData = [];
			var _allDatas_ref =  _allDatas;

            // 当数据为空时csv内容
            if(_allDatas_ref.length == 0) {
                exportStr = '无数据';
                return;
            }

			for(var i in _allDatas_ref){
				var newRow =[];
				for(var j in _allDatas_ref[i]){
					if(_allDatas_ref[i][j]){
						newRow.push((_fieldFormaters[j](_allDatas_ref[i][j], _allDatas_ref[i].key) + "").replace("</a>","").replace(/<\/?[^>]*>/g, "").replace(/[<\^>]+/, "")) ;
					} else{
                        newRow.push('');
                    }
				}
				newExcelData[i] = (newRow.join(','));
			}

			if(_allDatas_ref.length > 0) {
				var labelArr = [];
				for(var name in _allDatas_ref[0]) {
					labelArr.push(name);
				}
			}
			newExcelData.unshift(labelArr.join(','));

			exportStr = newExcelData.join(('\n'));
		}
		
		function reloadDatas(){
			var datas = [];
			if(_pagenation){
				var startIndex = (_pageFlag - 1) * _pageSize;
				var endIndex = _pageFlag * _pageSize < _allDatas.length ? _pageFlag * _pageSize : _allDatas.length;
				datas = _allDatas.slice(startIndex, endIndex);
				flushPageNavi();
			}else{
				datas = _allDatas;
			}
			_tbody.empty();
			$.each(datas, function(index, data){
				var tbody_tr = $('<tr data-key="' + data.key + '"/>');
				$.each(data, function(field, value){
					var orign = $('th[data-field="' + field + '"]').attr('data-orign');
					var hide = $('th[data-field="' + field + '"]').attr('data-hide');
					var datastyle = $('th[data-field="' + field + '"]').attr('data-style');
					var active = $('th[data-field="' + field + '"]').attr('data-active');
					tbody_tr.append($('<td style="padding-left:10px; '+ (hide == 'true'? 'display: none;': 'display: display;') + datastyle + '" data-key="' + data.key + '" data-field="' + field + '" '+ (active == 'true' ? 'class="active"' : '') + '>' + (orign == 'true' ?  _fieldFormaters[field](value, data.key) : utils.formatNumber(_fieldFormaters[field](value, data.key))) + '</td>'));
				});
				_tbody.append(tbody_tr);
			});
			_render();
		}
		
		self.bind = bind;
		self.bindSortEvent = bindSortEvent;
		self.plugs = plugs;
		self.addKeyRow = addKeyRow;
		self.addRow = addRow;
		self.flushPageNavi = flushPageNavi;
		self.reloadDatas = reloadDatas;
	}

	return Table;
	
});