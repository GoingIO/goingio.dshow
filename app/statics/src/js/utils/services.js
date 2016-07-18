define(['prototype'], function (prototype) {
    var rawDeferred = $.Deferred
    angular.module("services", []).service("applyService", ["$rootScope", function ($rootScope) {
        /**
         *
         * @param promiseOrDeferred为$.Deferred()对象或者$.Deferred().promise()对象
         * @private
         */
        function _wrapApply(promiseOrDeferred) {
            if (!$rootScope.$$phase) $rootScope.$apply()
            var then = promiseOrDeferred.then
            promiseOrDeferred.then = function () {
                var wrappedArguments = [];
                [].forEach.call(arguments, function (arg) {
                    wrappedArguments.push(arg.after(function () {
                        if (!$rootScope.$$phase) $rootScope.$apply()
                    }))
                })
                var thenResult = then.apply(promiseOrDeferred, wrappedArguments)
                return thenResult
            }
        }

        return {
            $apply: function () {
                if (!$rootScope.$$phase) $rootScope.$apply()
            },
            /**
             * $.Deferred().then、always的回调函数执行完后$rootScope.$apply()
             */
            wrapApply: function () {
                var Deferred = rawDeferred
                $.Deferred = function () {
                    var deferred = Deferred.apply($, arguments)
                    _wrapApply(deferred)
                    _wrapApply(deferred.promise())
                    return deferred
                }
            }
        }
    }])
})

