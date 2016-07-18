define(['toastr'], function (toastr) {
    var commonUrl = DSHOW_CONTEXT + '/req/common';

    var NOT_LOGIN = "14"


    function query(source, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6) {
        var url = commonUrl + (source.indexOf('/') == 0 ? source : '/' + source );
        return _request(url, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6);
    }

    function load(startDate, endDate, url, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6) {
        if (url.indexOf('/') > 0) {
            url = '/' + url;
        }
        var format = (opt.dateformat == undefined ? 'yyyyMMdd' : opt.dateformat);
        if (opt.source == undefined) {
            url = commonUrl + _format(url, startDate.format(format), endDate.format(format));
        } else {
            url = commonUrl + url + "/" + startDate.format(format) + '/' + endDate.format(format);
        }
        return _request(url, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6);
    }

    function get(rowkey, source, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6) {
        if (rowkey == undefined) {
            throw 'rowkey must be specified';
        }

        if (source == undefined) {
            throw 'source must be specified';
        }

        var url = commonUrl + '/log/get' + source;
        if (opt.params == undefined) {
            opt['params'] = {rowkey: rowkey}
        } else if (opt.params.append) {
            opt.params.append('rowkey', rowkey)
        } else {
            opt.params['rowkey'] = rowkey
        }
        return _request(url, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6);
    }


    function put(rowkey, source, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6) {
        if (rowkey == undefined) {
            throw 'rowkey must be specified';
        }

        if (source == undefined) {
            throw 'source must be specified';
        }

        var url = commonUrl + '/log/put' + source;
        opt.params == undefined ? opt['params'] = {rowkey: rowkey} : opt.params['rowkey'] = rowkey;
        return _request(url, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6);
    }

    function originQuery(url, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6) {
        return _request(url, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6);
    }


    function _isFunction(fn) {
        return !!fn && !fn.nodeName && fn.constructor != String && fn.constructor != RegExp && fn.constructor != Array && /function/i.test(fn + "");
    }


    function _format() {
        if (arguments.length == 0) {
            return null;
        }
        var str = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(re, arguments[i]);
        }
        return str;
    }

    /**
     *
     * @param url
     * @param opt
     * @param opt.disableErrCallback 如果为true,则请求失败时，不执行回调，包括500，status===failed情况
     * @param callback
     * @param opt1
     * @param opt2
     * @param opt3
     * @param opt4
     * @param opt5
     * @param opt6
     * @returns {*}
     * @private
     */
    function _request(url, opt, callback, opt1, opt2, opt3, opt4, opt5, opt6) {
        if (!_isFunction(callback)) {
            callback = function () {
            }
        }
        try {
            if (opt.debug == 'true') {
                console.info(' ————————————————————————————————————————————————————————————————————————————————————————————');
                console.info('| 目前opt支持参数如下 																		   ');
                console.info('| source:[数据来源,与url联合使用,amap,lbs或者不设定(不设定参数时url需要指定完整的url路径)]			       ');
                console.info('| type: 请求类型[get, post], 默认为get														   ');
                console.info('| params: json格式，请求要传递的参数, 只在type=post的时候起作用									   ');
                console.info('| async: 是否同步请求,默认false																   ');
                console.info('| debug: 是否调试模式， 默认false																   ');
                console.info(' ————————————————————————————————————————————————————————————————————————————————————————————');
                console.info(url);
            }

            var params = opt.params == undefined ? {} : opt.params;

            if (params instanceof FormData) {
                params.append('request-source', opt.source);
                params.append('request-type', opt.type ? opt.type : 'get');
                console.debug(params)
            } else if (params instanceof Object) {
                params['request-source'] = opt.source;
                params['request-type'] = opt.type ? opt.type : 'get';
            } else {
                var para = {};
                para['request-stream'] = params;
                para['request-source'] = opt.source;
                para['request-type'] = 'post';
                params = para;
            }

            var ajaxObject = $.ajax({
                url: url,
                beforeSend: function (request) {
                    request.setRequestHeader("uri", window.location.href);
                },
                type: opt.type ? opt.type : 'get',
                data: params,
                dataType: 'json',
                async: opt.async == undefined ? true : opt.async,
                global: opt.global == undefined ? true : opt.global,
                contentType: opt.contentType == undefined ? 'application/x-www-form-urlencoded; charset=UTF-8' : opt.contentType,
                processData: opt.processData == undefined ? true : opt.processData,
                error: function (err) {
                    callback([{'status': 'error', 'info': err}], opt1, opt2, opt3, opt4, opt5, opt6);
                },
                success: function (result) {
                    if (result['status'] === 'success') {
                        if (result.code == NOT_LOGIN) {
                            location.reload()
                            return
                        }
                        if (opt.orign == undefined || opt.orign == false) {
                            callback(result['result'], opt1, opt2, opt3, opt4, opt5, opt6);
                        } else {
                            callback(result, opt1, opt2, opt3, opt4, opt5, opt6);
                        }
                    } else {
                        if (!opt.disableErrCallback) {
                            callback(result, opt1, opt2, opt3, opt4, opt5, opt6);
                        }
                    }
                }
            });
        } catch (e) {
            console.info(e);
        }
        return ajaxObject;
    }

    /**
     * 监听所有的ajax请求，在请求失败时给予提示
     */
    function ajaxFailHint() {
        $(document).ajaxComplete(function (event, jqxhr) {
            if (jqxhr.responseJSON.status === "failed") {
                toastr.warning("请求出现错误")
            }
        })
    }

    return {
        get: get,
        put: put,
        query: query,
        load: load,
        originQuery: originQuery,
        ajaxFailHint: ajaxFailHint,
        request: _request
    }

});