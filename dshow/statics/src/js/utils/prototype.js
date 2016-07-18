"use strict"

define(function (require) {
    Function.prototype.curryThis = function () {
        var self = this
        return function () {
            [].unshift.call(arguments, this)
            return self.apply(null, arguments)
        }
    }
    Function.prototype.unCurryThis = function () {
        var self = this
        return function () {
            return self.apply(arguments[0], arguments.slice(1))
        }
    }
    Function.prototype.before = function (self, fun) {
        return function () {
            fun.apply(this, arguments)
            var result = self.apply(this, arguments)
            return result
        }
    }.curryThis()
    Function.prototype.after = function (self, fun) {
        return function () {
            var result = self.apply(this, arguments)
            fun.lastResult = result
            fun.apply(this, arguments)
            return result
        }
    }.curryThis()
})