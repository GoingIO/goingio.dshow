define(function() {
	function DateUtil(obj){
		var self = this;
		
		function preDay(){
			return new Date(obj.getTime() - 24 * 60 * 60 * 1000);
		}
		
		function beforeNowDay(i){
			return new Date(obj.getTime() - i * 24 * 60 * 60 * 1000);
		}
		function getLastSecondOfDay(){
			return new Date(this.format("yyyy-MM-dd")+" 23:59:59")
		}
		function getFirstSecondOfDay(){
			return new Date(this.format("yyyy-MM-dd")+" 00:00:00")
		}
		/*
		//使用方法
	     var now = new Date()
	     var nowStr = now.format("yyyy-MM-dd hh:mm:ss")
	     //使用方法2:
	     var testDate = new Date()
	     var testStr = testDate.format("YYYY年MM月dd日hh小时mm分ss秒")
	     alert(testStr)
	     //示例：
	     alert(new Date().Format("yyyy年MM月dd日"))
	     alert(new Date().Format("MM/dd/yyyy"))
	     alert(new Date().Format("yyyyMMdd"))
	     alert(new Date().Format("yyyy-MM-dd hh:mm:ss"))
	     */
		function format (format) {
	        var o = {
	            "M+": obj.getMonth() + 1, //month
	            "d+": obj.getDate(), //day
	            "h+": obj.getHours(), //hour
	            "m+": obj.getMinutes(), //minute
	            "s+": obj.getSeconds(), //second
	            "q+": Math.floor((obj.getMonth() + 3) / 3), //quarter
	            "S": obj.getMilliseconds() //millisecond
	        };

	        if (/(y+)/.test(format)) {
	            format = format.replace(RegExp.$1, (obj.getFullYear() + "").substr(4 - RegExp.$1.length))
	        }

	        for (var k in o) {
	            if (new RegExp("(" + k + ")").test(format)) {
	                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
	            }
	        }
	        return format
	    }

        /**
         * 获取i个月之后的日期对象
         * @param i {number} 之前i个月
         * @returns {Date}
         */
        function beforeNowMonth(i){
            var temp = new Date(obj.getTime());
            temp.setMonth(temp.getMonth() - i);
            return temp;
        }

		//本月第一天
		function firstDayInM(){
			var tmpDate = new Date(obj);
			tmpDate.setDate(1);
			return tmpDate;
		}

		// 本月最后一天
		function lastDayInM(){
			var tmpDate = new Date(obj);
			tmpDate.setMonth(tmpDate.getMonth() + 1);
			tmpDate.setDate(1);
			return new Date(tmpDate.getTime() - 24 * 60 * 60 * 1000);
		}
		
		//上月的第一天
		function firstDayInPreM(){
			var tmpDate = new Date(obj);
			tmpDate.setDate(1);
			tmpDate.setMonth(tmpDate.getMonth() - 1);
			return tmpDate;
		}
		
		//上月的最后一天
		function lastDayInPreM(){
			var tmpDate = new Date(obj);
			tmpDate.setDate(1);
			return new Date(tmpDate.getTime() - 24 * 60 * 60 * 1000);
		}

        //得到前n周的最后一天(周六)
        function getBeforeWeekend(n){
            var theDate = new Date(obj);
            var lastDateOfWeek;
            var day = theDate.getDay();
            theDate.setDate(theDate.getDate() + 6 - theDate.getDay());
            theDate.setDate(theDate.getDate() - n * 7); 
            lastDateOfWeek = theDate;
            return lastDateOfWeek;
        }

        //到现在为止过了多少个周日
		function getWeekends(){
			var start = firstDayInM();
			var weeks = 0;
			var tmpDate = new Date(obj);
			while(tmpDate > start){
				if(tmpDate.getDay() == 0){
					weeks ++ ;
				}
				tmpDate.setDate(tmpDate.getDate() - 1);
			}
			return weeks;
		}
		
		self.preDay = preDay;
        self.beforeNowMonth = beforeNowMonth;
		self.beforeNowDay = beforeNowDay;
		self.firstDayInM = firstDayInM;
		self.lastDayInM = lastDayInM;
		self.firstDayInPreM = firstDayInPreM;
		self.lastDayInPreM = lastDayInPreM;
		self.getWeekends = getWeekends;
        self.getBeforeWeekend = getBeforeWeekend;
        self.format=format;
        self.getLastSecondOfDay=getLastSecondOfDay;
        self.getFirstSecondOfDay=getFirstSecondOfDay;
	}
	return DateUtil;
});
