define(function() {
	var minColor = -255
	var maxColor = -50
	/**
	 * 如果str.length<number，在左侧填充字符char直至str.length===number
	 * @param str
	 * @param {number} number
	 * @param {string} char1
	 */
	function fill(str,number,char1){
		for(var i=str.length;i<number;++i){
			str=char1+str
		}
		return str
	}
	function ColorNumberMap(min, max) {
		this.min = min
		this.max = max
	}
	function getColor(number) {
		var rate = (number - this.min) / (this.max - this.min)
		var color = (maxColor - minColor) * rate + minColor
		color=parseInt(-color)
		return "#" + fill(color.toString(16),2,"0") + fill(color.toString(16),2,"0") + "FF"
	}
	ColorNumberMap.prototype = {
		getColor : getColor,
		getMin:function(){
			return this.min
		},
		getMax:function(){
			return this.max
		},
		getMinColor:function(){
			return this.getColor(this.getMin())
		},
		getMaxColor:function(){
			return this.getColor(this.getMax())
		}
	}
	return ColorNumberMap
})
