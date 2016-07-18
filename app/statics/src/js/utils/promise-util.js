define(function (require) {

    /**
     * 为obj的每一个后缀不为Async的函数添加一个异步版本，此函数的返回值为jquery的deferred对象
     * @param obj
     */
    function promisifyAll(obj) {
        for (var prop in obj) {
            (function () {
                var key = prop
                if (typeof obj[key] === "function" && !/Async$/.test(key)) {
                    obj[key + "Async"] = function () {
                        var deferred = $.Deferred();
                        [].push.call(arguments, function () {
                            deferred.resolve.apply(deferred, arguments)
                        })
                        obj[key].apply(obj, arguments)
                        return deferred
                    }
                }
            }())
        }
    }

    /**
     *
     */
    function resolve() {
        var deferred = $.Deferred()
        deferred.resolve.apply(deferred, arguments)
        return deferred
    }

    function reject() {
        var deferred = $.Deferred()
        deferred.reject.apply(deferred, arguments)
        return deferred
    }

    /**
     *
     * @param promiseOrDeferred为$.Deferred()对象或者$.Deferred().promise()对象
     * @private
     */
    function _errorAsRejected(promiseOrDeferred) {
        var then = promiseOrDeferred.then
        promiseOrDeferred.then = function () {
            var wrappedArguments = [];
            [].forEach.call(arguments, function (arg) {
                wrappedArguments.push(function () {
                    try {
                        var result = arg.apply(null, arguments)
                    } catch (e) {
                        console.error(e)
                        return reject(e)
                    }
                    return result
                })
            })
            var thenResult = then.apply(promiseOrDeferred, wrappedArguments)
            return thenResult
        }
    }

    /**
     * var deferred=$.Deferred
     * deferred.then(function(){throw "err"}).then(function(){},function(){console.log("rejected")})
     * 上述例子原生的jquery会报uncaught error
     * 这里改写then方法，使得回调函数发生异常时，then方法返回的promise状态变为rejected
     */
    function errorAsRejected() {
        var Deferred = $.Deferred
        $.Deferred = function () {
            var deferred = Deferred.apply($, arguments)
            _errorAsRejected(deferred)
            _errorAsRejected(deferred.promise())
            return deferred
        }
    }

    return {
        promisifyAll: promisifyAll,
        resolve: resolve,
        reject: reject,
        errorAsRejected: errorAsRejected
    }

})
