define(function () {
    /**
     * @param config
     * @param config.minNumber
     * @param config.maxNumber
     * @param config.minOpacity
     * @param config.maxOpacity
     * @constructor
     */
    function OpacityNumberMap(config) {
        this._config = config
    }

    function getOpacity(number) {
        var config = this._config
        var rate = (number - config.minNumber) / (config.maxNumber - config.minNumber)
        var opacity = (config.maxOpacity - config.minOpacity) * rate + config.minOpacity
        return opacity
    }

    OpacityNumberMap.prototype = {
        getOpacity: getOpacity,
        getMinNumber: function () {
            return this._config.minNumber
        },
        getMaxNumber: function () {
            return this._config.maxNumber
        },
        getMinOpacity: function () {
            return this.getOpacity(this.getMinNumber())
        },
        getMaxOpacity: function () {
            return this.getOpacity(this.getMaxNumber())
        }
    }
    return OpacityNumberMap
})
