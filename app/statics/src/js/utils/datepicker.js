define(['daterange', 'datemonth', 'dateutil'], function(Daterange, Datemonth, DateUtil){

	function DatePicker(target, options, func){
		var _self = this;
		
		var dateUtil = new DateUtil(new Date());
		
		var _format = options.format == undefined ? 'yyyy-mm-dd~yyyy-mm-dd' : options.format.toLowerCase();
		var _id = options.id == undefined ? new Date().getTime() : options.id;
		var _shortOpt = options.shortOpt == undefined ? true : options.shortOpt;
		var _shortArray = options.shortArray == undefined ? true : options.shortArray;
		var markedDates = options.markCertainDate == undefined ? {} : options.markCertainDate;
		var markedAllDisabled = options.markedAllDisabled == undefined ? false : options.markedAllDisabled;
		
		var opt = this.init(target, _id, _shortOpt, _shortArray);
		
		var _startDate = options.startDate, _endDate = options.endDate;
		_format == 'yyyy-mm-dd' ? function() {
			_startDate = _startDate == undefined ? dateUtil.beforeNowDay(1).format('yyyy-MM-dd') : _startDate;
			_endDate = _endDate == undefined ? _startDate : _endDate;
			var datePicker = new Daterange(opt.dateInput, {
				isTodayValid : opt.isTodayValid,
				isSingleDay : true,
				startDate : _startDate,
				endDate : _endDate,
				needCompare : false,
				defaultText : ' 至 ',
				calendars : 1,
				inputTrigger:  opt.dateTrigger,
				theme : 'ta',
				shortOpr : true,
				autoCommit : true,
				markCertainDate: markedDates, // {9:[4,6,7], 8:[2,3,12]}
				markedAllDisabled: options.markedAllDisabled,
				success : function(obj) {
					var date = {};
					date['startDate'] = new Date(obj.startDate);
					date['endDate'] = new Date(obj.endDate);
					func(date);
				}
			});
			
		}() : function() {
			_format == 'yyyy-mm-dd~yyyy-mm-dd' ? function(){
				_startDate = _startDate == undefined ? dateUtil.beforeNowDay(30).format('yyyy-MM-dd') : _startDate;
				_endDate = _endDate == undefined ? dateUtil.beforeNowDay(1).format('yyyy-MM-dd') : _endDate;
				var datePicker = new Daterange(opt.dateInput, {
					isTodayValid : false,
					isSingleDay : false,
					startDate : _startDate,
					endDate : _endDate,
					needCompare : false,
					defaultText : ' 至 ',
					calendars : 2,
					inputTrigger:  opt.dateTrigger,
					theme : 'ta',
					shortOpr : false,
					autoCommit : true,
					success : function(obj) {
						var date = {};
						date['startDate'] = new Date(obj.startDate);
						date['endDate'] = new Date(obj.endDate);
						func(date);
					}
				});
				
			}() : function(){
				_startDate = _startDate == undefined ? dateUtil.firstDayInPreM().format('yyyy-MM') : _startDate;
				_endDate = _endDate == undefined ? dateUtil.firstDayInPreM().format('yyyy-MM') : _endDate;
				
				Datemonth.create(opt.dateInput, {
			  		trigger : opt.dateTrigger,
			  		autoCommit : true,
			  		lastMonth: true,
			  		callback : function(obj){
			  			var result = new Date(obj);
			  			var date = {};
			  			var util = new DateUtil(result);
			  			date['startDate'] = util.firstDayInM();
			  			date['endDate'] = util.lastDayInM();
			 			func(date);
			  		}
			  	});
			}()
		}();
	}
	
	
	var shortOptArray = {'aToday': '今天', 'aYesterday': '昨天', 'aRecent7Days': '7天', 'aRecent14Days': '14天', 'aRecent30Days': '30天'};
	DatePicker.prototype.init = function(target, id, shortOpt, shortArray){
		var toolDiv = $('<div class="tool_date cf" />');
		var dateDiv = $('<div class="ta_date" />').attr('id', id + '_div');
		var dateSpan = $('<span class="date_title" />').attr('id', id + '_span');
		var dateTrigger = $('<a class="opt_sel" href="#">').attr('id', id + '_trigger').append('<i class="i_orderd"></i>');
		
		dateDiv.append(dateSpan);
		dateDiv.append(dateTrigger);
		toolDiv.append(dateDiv);
		
		if(shortOpt) {
			var showOptDiv = $('<div class="date-section cf" />');
			var ul = $('<ul id="toolbar" class="select cf" />');
			for(var index in shortArray){
				var li = $('<li />').append($('<a id="' + shortArray[index] + '"/>').text(shortOptArray[shortArray[index]]));
				ul.append(li);
			}
			showOptDiv.append(ul);
			toolDiv.append(showOptDiv);
		}
		$(target).append(toolDiv);
		
		return {
			dateInput: id + '_span',
			dateTrigger: id + '_trigger'
		}
	}
	
	return DatePicker;
	
});