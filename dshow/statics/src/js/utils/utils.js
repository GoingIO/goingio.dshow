/**
 * functions:
 * getQueryStringArgs   获得页面参数对象
 * transByte    将byte转化为合适的单位，返回字符串
 *  getDataMap(keyArr, data, key, value, formatFunc)   根据对象数组以及key值数组，得到kvmap
 *  AggregateData(data, key, value, type, fields)
 */
define(function () {

    //地图上俩点之间的粗略的球面距离
    var EARTH_RADIUS_METER = 6378137.0;

    function spherical_distance(f, t) {
        var flat = deg2rad(f[1]);
        var flon = deg2rad(f[0]);
        var tlat = deg2rad(t[1]);
        var tlon = deg2rad(t[0]);
        var con = Math.sin(flat) * Math.sin(tlat);
        con += Math.cos(flat) * Math.cos(tlat) * Math.cos(flon - tlon);
        return Math.acos(con) * EARTH_RADIUS_METER
    }

    function deg2rad(d) {
        return d * Math.PI / 180.0;
    }


    // 打印信息到控制台
    function log(message) {
        if (typeof  console == 'object') {
            console.log(message);
        } else if (typeof opera == 'object') {
            opera.postError(message);
        } else if (typeof java == 'object' && typeof java.lang == 'object') {
            java.lang.System.out.println(message);
        }
    }

    var getDateArray = function (startDate, endDate, offset, formatstr) {
        if (offset == undefined) {
            offset = 0;
        }
        if (formatstr == undefined) {
            formatstr = 'yyyy-MM-dd';
        }
        var dates = [];
        var start = new Date(startDate.getTime() + offset);
        var end = new Date(endDate.getTime() + offset);
        while (start <= end) {
            dates.push(start.format(formatstr));
            start = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        }
        return dates;
    }


    var formatNumber = function (str) {
        var endplace = 0;
        if (isNaN(str)) {
            return str;
        }
        str += "";
        endplace = str.indexOf('.');
        if (endplace == -1) {
            if (str.length <= 3) {
                return str;
            } else {
                return formatNumber(str.substr(0, str.length - 3)) + ',' + str.substr(str.length - 3);
            }
        } else {
            if (str.length <= 3 + str.substr(endplace).length) {
                return str;
            } else {
                return formatNumber(str.substr(0, endplace - 3)) + ',' + str.substr(endplace - 3);
            }
        }
    };


    /**
     * 将byte转化为合适的单位，返回字符串
     * @param byte
     * @returns {string}
     */
    var transByte = function (parameter) {
        var unitList = ['B', 'KB', 'MB', 'GB', 'TB'];
        var temp = 0;
        if (typeof parameter != 'number') {
            parameter = Number(parameter);
        }
        if (isNaN(parameter)) {
            return '';
        } else {
            while (parameter >= 1024) {
                parameter = parameter / 1024;
                temp++;
            }
            if (Number.isInteger(parameter)) {
                return parameter + unitList[temp];
            } else {
                return parameter.toFixed(2) + unitList[temp];
            }
        }

    }

    /**
     * number转为带百分号的字符串
     * @param number
     */
    function transNumToPercent(number) {
        if (typeof number === 'number') {
            return (number * 100).toFixed(2) + '%';
        } else {
            return 0;
        }
    }

    var transNum = function (num) {
        str = "" + num;
        if (num > 100000000) {
            str = formatNumber("" + decimal(num / 100000000, 2)).replace(',.', '.') + " 亿";
        } else if (num > 10000) {
            //if (num > 10000){
            str = formatNumber("" + Math.ceil(num / 10000)).replace(',.', '.') + " 万";
        }
        return formatNumber(str);
    };

    var avg = function (val) {
        var sum = 0;
        for (var index in val) {
            sum += parseInt(val[index].value);
        }
        return val.length > 0 ? sum / val.length : 0;
    };

    var sum = function () {
        for (var i = 0, sum = 0; i < this.length; sum += this[i++]);
        return sum;
    };

    var max = function () {
        return Math.max.apply({}, this);
    };

    var min = function () {
        return Math.min.apply({}, this);
    };

    var avg = function (val) {
        var sum = 0;
        for (var index in val) {
            sum += parseInt(val[index].value);
        }
        return val.length > 0 ? sum / val.length : 0;
    };

    var distanceByDates = function (date1, date2, unit) {
        unit = unit == null ? 24 * 60 * 60 * 1000 : unit;
        return (date2.getTime() - date1.getTime()) / unit;
    };

    var mappingUrl = function (url, index, max) {
        return "https://cache" + ((index % max) + 1) + ".qmx.amap.com" + url;
    };

    var fillTotalDatas = function (val) {
        var datas = {};
        for (var index in val) {
            datas[val[index][global_date_field]] = val[index].value;
        }
        return datas;
    }

    var fillDetailDatas = function (val, isavg) {
        var datas = {};
        $.each(val, function (date, data) {
            if (data.map) {
                $.each(data.map, function (key, value) {
                    if (datas[key] == undefined) {
                        datas[key] = 0;
                    }
                    datas[key] += value;
                });
            }
        });
        if (isavg) {
            $.each(datas, function (key, value) {
                datas[key] = parseInt(value / val.length);
            });
        }
        return datas;
    }

    function mergeObject(defaults, userDefined) {
        var returnObj = {};
        for (var attrname in defaults) {
            returnObj[attrname] = defaults[attrname];
        }
        for (var attrname in userDefined) {
            returnObj[attrname] = userDefined[attrname];
        }
        return returnObj;
    }

    /*
     * 根据维度参数转换成url请求
     * para 参数数组{key1:['a','b','c'],key2:['3'],key3:[]}
     * return key1:a,key1:b,key1:c,key2:3
     */
    function getParaArray(para) {
        var newPara = '';
        for (var key in para) {
            if (para[key] != null) {
                if (para[key] instanceof Array) {
                    for (var j in para[key]) {
                        if (para[key][j] != null) {
                            newPara = newPara + key + ':' + para[key][j] + ',';
                        }
                    }
                } else {
                    newPara = newPara + key + ':' + para[key] + ',';
                }
            }
        }
        newPara = newPara.length > 1 ? newPara.substring(0, newPara.length - 1) : newPara;
        return newPara;
    }

    // 得到两日期之间的天数
    function getNumberBetween2Date(date1, date2) {
        if (typeof date1 == 'string') {
            date1 = new Date(date1);
        }

        if (typeof date2 == 'string') {
            date2 = new Date(date2);
        }

        //相差的long值
        var resTime = date2 - date1;
        //相差的天数
        var days = Math.floor(resTime / (24 * 3600 * 1000));
        return days + 1;
    }

    /**
     *
     * @param valueArr {Array} value数组
     * @param keyStr
     * ex: [a,b,c] key
     * return key:a,key:b,key:c
     */
    function getKeyValueStr(valueArr, keyStr) {
        var valueStr = '';
        if (valueArr.length === 0) {
            return keyStr + ':' + 'all';
        } else {
            valueArr.forEach(function (value) {
                valueStr += keyStr + ':' + value + ',';
            });
            return valueStr.substring(0, -1);
        }
    }

    /**
     * 根据起始日期得到日期数组
     * @param startDate
     * @param endDate
     * @param formatStr 格式字符串 ex:yyyyMMdd
     * @returns {Array}
     */
    function getDayArr(startDate, endDate, formatStr) {
        var start = new Date(startDate),
            dayArr = [],
            end = new Date(endDate);

        for (var i = 0; start <= end; i++) {
            dayArr.push(start.format(formatStr));
            start.setDate(start.getDate() + 1);
        }
        return dayArr;
    }

    /**
     * 根据起始日期得到这段时间中的周六
     * @param startDate
     * @param endDate
     * @param formatStr 格式字符串 ex:yyyyMMdd
     * @returns {Array}
     */
    function getWeekArr(startDate, endDate, formatStr) {
        var start = new Date(startDate),
            weekArr = [],
            end = new Date(endDate);

        start.setDate(start.getDate() + 6 - start.getDay());
        if (end.getDay() !== 6) {
            end.setDate(end.getDate() - end.getDay() - 1);
        }
        for (var i = 0; start <= end; i++) {
            weekArr.push(start.format(formatStr));
            start.setDate(start.getDate() + 7);
        }
        return weekArr;
    }

    /**
     * 根据起始日期得到月份数组
     * @param startDate
     * @param endDate
     * @param formatStr 格式字符串 ex:yyyyMM
     * @returns {Array}
     */
    function getMonthArr(startDate, endDate, formatStr) {
        var start = new Date(startDate),
            monthArr = [],
            end = new Date(endDate);

        for (var i = 0; start <= end; i++) {
            start.setDate(1);
            monthArr.push(start.format(formatStr));
            start.setMonth(start.getMonth() + 1);
        }
        return monthArr;
    }

    /**
     * 根据日期数组 以及dataloader得到的数据，得到kvmap
     * @param keyArr { [] } key数组
     * @param data { [{}] } object数组
     * @param key 作为key的字段名
     * @param value 作为值的字段名
     * @returns {{}} key value map
     * @param formatFunc data key值格式化函数
     */
    function getDataMap(keyArr, data, key, value, formatFunc) {
        var kvMap = {};
        if (keyArr instanceof Array && data instanceof Array) {
            keyArr.forEach(function (item) {
                kvMap[item] = null;
            });
            data.forEach(function (item) {
                var dataKey = typeof formatFunc === 'function' ? formatFunc(item[key]) : item[key];
                if (keyArr.indexOf(dataKey) > -1 && dataKey != null && item[value] != null) {
                    kvMap[dataKey] = item[value];
                }
            });
        } else {
            data.forEach(function (item) {
                var dataKey = typeof formatFunc === 'function' ? formatFunc(item[key]) : item[key];
                if (dataKey != null && item[value] != null) {
                    kvMap[dataKey] = item[value];
                }
            });
        }

        return kvMap;
    }

    /**
     * 将map转化为对象数组
     * @param map {} map对象
     * @param keyStr
     * @param valueStr
     * @param keyFormatFunc
     * @param top
     * @param isDesc {boolean}
     */
    function mapToObjArr(map, keyStr, valueStr, keyFormatFunc, isDesc, top) {
        var arr = [];
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                var str = (typeof keyFormatFunc === 'function' ? keyFormatFunc(key) : key);
                var temp = {};
                temp[keyStr] = str;
                temp[valueStr] = map[key];
                arr.push(temp);
            }
        }

        if (typeof isDesc === 'boolean') {
            arr.sort(function (a, b) {
                if (isDesc) {
                    return b[valueStr] - a[valueStr];
                } else {
                    return a[valueStr] - b[valueStr];
                }
            });
        }

        if (typeof top === 'number') {
            arr = arr.splice(0, top);
        }
        return arr;
    }

    /**
     * 更改obj arr中的 key 值
     * @param dataArr 原object array
     * @param relationMap 转换映射关系
     * ex: {
     *  a: '1',
     *  b: '2',
     *  c: '3'
     * }
     */
    function changeObjArrKey(dataArr, relationMap) {
        if (!dataArr instanceof Array || dataArr.length === 0) {
            return [];
        } else if (relationMap === undefined) {
            return dataArr;
        } else if (relationMap instanceof Object) {
            var newArr = dataArr.map(function (obj) {
                var newObj = {};
                for (var key in relationMap) {
                    newObj[relationMap[key]] = obj[key];   // 修改key值后保存到新对象
                }
                return newObj;
            });
            return newArr;
        }
    }

    /**
     * 遍历对象数组 按key聚合得到结果
     * @param data dataloader输出数据
     * @param key 聚合key值
     * @param value
     * @param type  total,max,min 聚合方式
     * @returns {{}} key value map
     * @param fields 当type 为detail时聚合的字段。
     */
    function AggregateData(data, key, value, type, fields) {
        var kvMap = {};
        if (data == undefined || !data instanceof Array || data.length === 0) {
            return {};
        }
        try {
            data.forEach(function (item) {
                var itemKey = item[key],
                    itemValue = item[value];
                if (itemKey != null && itemValue != null) {
                    if (type === 'total') {
                        kvMap[itemKey] = kvMap[itemKey] ? kvMap[itemKey] + itemValue : itemValue;
                    } else if (type === 'max') {
                        if (kvMap[itemKey] < itemValue) {
                            kvMap[itemKey] = itemValue;
                        }
                    } else if (type === 'min') {
                        if (kvMap[itemKey] > itemValue) {
                            kvMap[itemKey] = itemValue;
                        }
                    } else if (type === 'detail' && typeof fields === 'string') {
                        var fieldValue = item[fields];
                        if (typeof kvMap[itemKey] !== 'object') {
                            kvMap[itemKey] = {};
                        }
                        if (fieldValue != undefined) {
                            kvMap[String(itemKey)][fieldValue] = itemValue;
                        }

                    }
                }
            });
            return kvMap;
        } catch (e) {
            return {};
        }
    }

    /**
     *
     * @param collection
     * @param keyStr
     * @param valueStr
     * @param type
     * @constructor
     */
    function AggregateCollection(collection, keyStr, valueStr, type) {
        var resultMap = {};
        var isArrayKey = keyStr instanceof Array,
            isArrayValue = valueStr instanceof Array;

        collection && collection.length && collection.forEach(function (item) {
            var value;

            // 得到value值
            if (isArrayValue) {
                value = {};
                valueStr.forEach(function (v) {
                    value[v] = item[v] || null;
                });
            } else {
                value = item[valueStr];
            }

            if (!isArrayKey) {
                resultMap[item[keyStr]] = value;
            } else {
                var temp = resultMap;
                keyStr.forEach(function (k, index) {
                    if (index < keyStr.length - 1) {
                        if (temp[item[k]] == undefined)
                            temp[item[k]] = {};
                        temp = temp[item[k]];
                    } else {
                        temp[item[k]] = value;
                    }
                });
            }
        });
        return resultMap;
    }


    /* 根据父节点的值获取子集合
     * chlidmap 子列表的集合名称（DICT中名称）
     * chlidparent 父子对应关系名称（DICT中名称）
     */
    function getChlidByPid(pids, chlidmap, chlidparent) {
        var a2b = '';
        var result = {};
        if (pids instanceof Array) {
            for (var index in pids) {
                a2b = a2b + (chlidparent[pids[index]] && chlidparent[pids[index]] != undefined ? chlidparent[pids[index]] : '') + ',';
            }
        } else {
            for (var index in pids) {
                a2b = a2b + (chlidparent[index] && chlidparent[index] != undefined ? chlidparent[index] : '') + ',';
            }
        }
        var a2bs = a2b.split(',');
        for (var index in a2bs) {
            var key = a2bs[index];
            if (key && key != undefined) {
                result[key] = chlidmap[key] && chlidmap[key] != undefined ? chlidmap[key] : key;
            }
        }
        return result;
    }

    // 第一行为label，根据第一行返回collection
    function conventCsvToMap(csv) {
        var lines = csv.split('\n');
        var labelArr = lines[0].split(',');
        var result = [];

        for (var i = 1; i < lines.length; i++) {
            var object = {};
            var temp = lines[i].split(',');
            for (var j = 0; j < temp.length; j++) {
                object[labelArr[j] + ''] = temp[j];
            }
            result.push(object);
        }
        return result;
    }

    //默认前景色为白色
    function rgba2rgb(r, g, b, a) {
        return 'rgb(' + ((1 - a) * 255 + a * r) + ',' + ((1 - a) * 255 + a * g) + ',' + ((1 - a) * 255 + a * b) + ')';
    }

    function isEmpty(obj) {

        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    }


    /**
     * 将对象数组排序， 默认正序
     * @param arr
     * @param key
     * @param options
     */
    function sortObjectArr(arr, key, options) {
        if (arr instanceof Array && typeof key === 'string' && options instanceof Object) {
            var defalut = {
                isDesc: false,
                valueType: 'string'
            };

            // 设置可选项
            $.each(options, function (key, value) {
                defalut[key] = value;
            });

            arr.sort(function (a, b) {
                var firstVal = a[key],
                    secVal = b[key];
                if (firstVal > secVal) {
                    return 1;
                } else if (firstVal < secVal) {
                    return -1;
                } else {
                    return 0;
                }
            });

            if (defalut.isDesc === true) {
                arr.reverse();
            }
        } else {
            throw new Error('sortObjectArr 传入正确参数');
        }
    }

    /**
     * 将Url以及Url中的para进行url编码并组装
     * @param url {string}
     * @param para {Object}
     * @returns {string}
     */
    function getUrlByPara(url, para) {
        var name, value;
        var paraStrArr = [];

        for (var key in para) {
            if (para[key]) {
                name = encodeURIComponent(key);
                value = encodeURIComponent(para[key]);
                paraStrArr.push(name + '=' + value);
            }
        }
        return url + '?' + paraStrArr.join('&');
    }

    // 获得页面参数对象
    function getQueryStringArgs() {
        // 取得查询字符串并去掉开头的问号
        var qs = (location.search.length > 0 ? location.search.substring(1) : "");
        var args = {};
        var items = qs.length ? qs.split('&') : [],
            item = null,
            name = null,
            value = null,
            i = 0,
            len = items.length;
        for (i = 0; i < len; i++) {
            item = items[i].split('=');
            name = decodeURIComponent(item[0]);
            value = decodeURIComponent(item[1]);

            if (name.length) {
                args[name] = value;
            }
        }

        return args;
    }

    /*
     * 全部替换
     */
    function replaceall(str, sptr, sptr1) {
        while (str.indexOf(sptr) >= 0) {
            str = str.replace(sptr, sptr1);
        }
        return str;
    }

    // 得到距离浏览器左边缘的距离
    function getElementViewLeft(element) {
        var actualLeft = element.offsetLeft;
        var current = element.offsetParent;
        var elementScrollLeft = null;
        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        if (document.compatMode == "BackCompat") {
            elementScrollLeft = document.body.scrollLeft;
        } else {
            elementScrollLeft = document.documentElement.scrollLeft;
        }
        return actualLeft - elementScrollLeft;
    }

    /**
     *
     * @param stringList {Array}
     * @param type {string} ex: 'text/csv'
     * @param filename {string}
     */
    function downloadFile(stringList, type, filename) {
        var aLink = document.createElement('a');
        var blob = new Blob(['\ufeff'].concat(stringList), {type: type});
        var evt = document.createEvent("HTMLEvents");

        evt.initEvent('click');

        aLink.download = filename;
        aLink.href = URL.createObjectURL(blob);
        aLink.dispatchEvent(evt);
    }

    // 得到浏览器宽度
    function getViewPortWith() {
        var pageWidth = null;
        if (document.compatMode == 'BackCompat') {
            pageWidth = document.body.clientWidth;
        } else {
            pageWidth = document.documentElement.clientWidth;
        }
        return pageWidth;
    }

    /*
     * 判断是否在数组中
     */
    function in_array(arrays, e) {
        if (!isEmpty(arrays) && !isEmpty(e)) {
            for (i = 0; i < arrays.length; i++) {
                if (arrays[i] == e)
                    return true;
            }
        }
        return false;
    }

    /**
     * 将一个对象序列化为a=a1&b=b1的形式
     * @param {Object} obj
     * @return string
     */
    function serialize(obj) {
        var result = ""
        $.each(obj, function (key, value) {
            result += "&" + key + "=" + value
        })
        return result.substring(1)

    }

    /**
     * 返回一个保留了v位的小数
     * @param num
     * @param v
     * @returns {number}
     */
    var decimal = function (num, v) {
        var vv = Math.pow(10, v);
        return Math.round(num * vv) / vv;
    };
    /**
     * 返回一个保留了v位小数的百分数
     * 比如percent(10.344534,4)返回 1034.45%
     * @param num
     * @param v
     */
    var percent = function (num, v) {
        if (!num) return num
        var result = decimal(num, v) * 100 + ""
        var dotIndex = result.indexOf(".")
        result = result.substring(0, dotIndex + 3)
        return result + "%"
    }

    /**
     * 调用返回函数多次时，也只会调用fn一次,同时在返回值上添加一个targetFn=fn
     * @example
     *  var fn=function(){
     *      console.log("call")
     *  }
     *  var callOneFn=callOne(fn)
     *  callOneFn()
     *  callOneFn()
     *  只会打印一次”call“
     *  同时callOneFn.targetFn=fn
     *  note:如果同一个函数调用callOne两次，那么分别调用返回值，fn会被调用两次
     * @param {function} fn
     * @return {function}
     */
    function callOne(fn) {
        var called = false
        var result = undefined
        var callOneFn = function () {
            if (called) return result
            called = true
            result = fn.apply(this, arguments)
            return result
        }
        callOneFn.targetFn = fn
        return callOneFn
    }

    /**
     *  得到表示date那天第一秒的日期
     * @param {Date} date
     * @return {Date}
     */
    function getFirstSecond(date) {
        return new Date(date.format("yyyy/MM/dd") + " 00:00:00")
    }

    /**
     *  得到表示date那天最后一秒的日期
     * @param {Date} date
     * @return {Date}
     */
    function getLastSecond(date) {
        return new Date(date.format("yyyy/MM/dd") + " 23:59:59")
    }

    /**
     *
     * @param {string} date 如："20150910121329"
     * @returns {Date}
     */
    function parseDateWithSeconds(date) {
        return Date.UTC(+date.substr(0, 4), +date.substr(4, 2) - 1, +date.substr(6, 2), +date.substr(8, 2), +date.substr(10, 2), +date.substr(12, 2))
    }

    return {
        avg: avg,
        sum: sum,
        min: min,
        max: max,
        log: log,
        transByte: transByte,
        percent: percent,
        decimal: decimal,
        distanceByDates: distanceByDates,
        formatNumber: formatNumber,
        transNum: transNum,
        mappingUrl: mappingUrl,
        fillTotalDatas: fillTotalDatas,
        fillDetailDatas: fillDetailDatas,
        mergeObject: mergeObject,
        getDateArray: getDateArray,
        getParaArray: getParaArray,
        getDayArr: getDayArr,
        getMonthArr: getMonthArr,
        getWeekArr: getWeekArr,
        getDataMap: getDataMap,
        AggregateData: AggregateData,
        AggregateCollection: AggregateCollection,
        mapToObjArr: mapToObjArr,
        getKeyValueStr: getKeyValueStr,
        transNumToPercent: transNumToPercent,
        getNumberBetween2Date: getNumberBetween2Date,
        getChlidByPid: getChlidByPid,
        changeObjArrKey: changeObjArrKey,
        rgba2rgb: rgba2rgb,
        isEmpty: isEmpty,
        sortObjectArr: sortObjectArr,
        replaceall: replaceall,
        getUrlByPara: getUrlByPara,
        getQueryStringArgs: getQueryStringArgs,
        getElementViewLeft: getElementViewLeft,
        getViewPortWith: getViewPortWith,
        conventCsvToMap: conventCsvToMap,
        downloadFile: downloadFile,
        in_array: in_array,
        spherical_distance: spherical_distance,
        serialize: serialize,
        callOne: callOne,
        getFirstSecond: getFirstSecond,
        getLastSecond: getLastSecond,
        parseDateWithSeconds: parseDateWithSeconds
    };
});