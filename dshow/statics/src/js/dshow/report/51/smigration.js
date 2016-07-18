/**
 * Created by telen on 15/5/5.
 */

require(['dataloader', 'datepicker', 'dateutil', 'toastr', 'd3', 'bootstrap_table'], function(dataloader, Datepicker, DateUtil, toastr, d3) {

    var w = '100%';
    var h = 800;
    var centered;

    var formatC = d3.format(",.0f");
    var formatD = d3.format("+,.0f");

    var immin, immax, exmin, exmax;

    var projection = d3.geo.mercator()
        .scale(700)
        .translate([-800, 800]);

    //Define path generator
    var path = d3.geo.path()
        .projection(projection);

    var colors = ["#EDF8FB", "#41083e"];
    var themeOri = {
        background: '#FFF',
        mapStroke: '#666',
        cComing: '#65a89d',
        cComingOpacity: '0.5',
        cGoing: '#a96a46'
    };
    var theme = {
        background: '#2B2660',
        mapStroke: '#FDFDFD',
        cComing: '#5EDBDF',
        cComingOpacity: '0.8',
        cComingHoverOpacity: '0.8',
        cGoing: '#E6DD39'
    };
    var immdomain = [24431, 537148];
    var emmdomain = [20056, 566986];

    var cricleradius =  4;
    var circleSize = d3.scale.linear().range([2, 25000]).domain([0, 107175]);

    var lineSize = d3.scale.linear().range([2, 25]).domain([0, 35000]);

    var fillcolor = d3.scale.linear().range(colors).domain(immdomain);


    //Create SVG element
    var svg = d3.select("#map")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .style("background", theme.background);


    //initialize html tooltip
    var tooltip = d3.select("#maincontainer")
        .append("div")
        .attr("id", "tt")
        .style("z-index", "10")
        .style("position", "absolute")
        .style("visibility", "hidden");

    var tooltip2 = d3.select("#maincontainer")
        .append("div")
        .attr("id", "tt2")
        .style("z-index", "10")
        .style("position", "absolute")
        .style("visibility", "hidden");

    var g = svg.append("g");


    var coming = {}, going = {},
        comingObj = {}, goingObj = {},
        adcodeMapping = {};

    var startDate = new Date(2015,4,1);
    var todayUtil = new DateUtil(startDate);
    var datepicker = new Datepicker('#datepicker', {
        target: 'date',
        startDate: startDate.format('yyyy-MM-dd'),
        format: 'yyyy-mm-dd'
    }, function(obj) {
        g.remove();
        g = svg.append("g"); // 重新刷新svg
        var endDate = new DateUtil(obj.startDate).beforeNowDay(-1);

        init(obj.startDate.format('yyyyMMdd'), endDate.format('yyyyMMdd'));

    });

    /**
     *
     * @param startDateStr [yyyyMMdd]
     * @param endDateStr [yyyyMMdd]
     */
    function init(startDateStr, endDateStr) {
        dataloader.query('/log/post/nocache/s_amap_dm_user_migrate_city', {
            source: 'rds',
            type: 'post',
            dateformat: 'yyyyMMddhh',
            params: {
                project: 'd_fromadcode,d_fromadname,d_toadcode,d_toadname,m_pv',
                match: 'd_fromdate:' + startDateStr + ',d_todate:' + endDateStr,
                group: 'substr(d_fromadcode,1,2),substr(d_toadcode,1,2)'
            }

        }, function(data) {
            if (!data.length) {
                toastr.error('无数据');
                $('.maincontent').addClass('start');

                $('#cityBoard1').bootstrapTable('destroy');
                $('#cityBoard2').bootstrapTable('destroy');
                return;
            }
            $("#back-btn").trigger('click');

            // 重置变量
            coming = {};
            going = {};
            comingObj = {};
            goingObj = {};
            adcodeMapping = {};

            data.forEach(function(item) {
                if (going[item.d_fromadcode.substr(0,2)+'0000'] == undefined) {
                    going[item.d_fromadcode.substr(0,2)+'0000'] = {};
                }
                if (item.d_fromadcode.substr(0,2) != item.d_toadcode.substr(0,2)) { // 排除与自己相同的地方
                    going[item.d_fromadcode.substr(0, 2) + '0000'][item.d_toadcode.substr(0, 2) + '0000'] = item.m_pv;
                }

                if (coming[item.d_toadcode.substr(0,2)+'0000'] == undefined) {
                    coming[item.d_toadcode.substr(0,2)+'0000'] = {};
                }
                if (item.d_toadcode.substr(0,2) != item.d_fromadcode.substr(0, 2)) {
                    coming[item.d_toadcode.substr(0, 2) + '0000'][item.d_fromadcode.substr(0, 2) + '0000'] = item.m_pv;
                }
            });

            $.extend(comingObj, coming);
            $.extend(goingObj, going);

            d3.json(DSHOW_CONTEXT + "/statics/js/dshow/report/51/china.json", function (json) {

                for (var j = 0; j < json.features.length; j++) {
                    var jsonAdcode = json.features[j].properties.AD_CODE;
                    $.extend(json.features[j].properties, going[jsonAdcode]);
                    var total_out = 0,
                        total_in = 0;
                    $.each(going[jsonAdcode], function(v) {
                        total_out += going[jsonAdcode][v];
                    });
                    $.each(coming[jsonAdcode], function(v) {
                        total_in += coming[jsonAdcode][v];
                    });
                    json.features[j].properties.total_out = total_out;
                    json.features[j].properties.total_in = total_in;

                    if (!coming[jsonAdcode].name) {
                        coming[jsonAdcode].name = json.features[j].properties.NAME;
                    }
                    if (!going[jsonAdcode].name) {
                        going[jsonAdcode].name = json.features[j].properties.NAME;
                    }

                    if (!coming[jsonAdcode].total) {
                        coming[jsonAdcode].total = total_in;
                    }
                    if (!going[jsonAdcode].total) {
                        going[jsonAdcode].total = total_out;
                    }

                    json.features[j].id = jsonAdcode;
                    json.features[j].abbrev = jsonAdcode;
                    json.features[j].name = json.features[j].properties.NAME;

                    adcodeMapping[jsonAdcode] = json.features[j].properties.NAME;
                }

//                console.log(adcodeMapping);
                // 迁出迁入排序
                coming = pairs(coming);
                going = pairs(going);


                // 排序子集
                $.each(comingObj, function(k) {
                    var cPro = comingObj[k];
                    var cKeys = Object.keys(cPro);
                    var sortArray = [];
                    cKeys.forEach(function(e) {
                        if (e == 'abbrev' || e == 'name' || e == 'total'){

                        } else {
                            sortArray.push({
                                adcode: e,
                                count: cPro[e]
                            });
                        }
                    });
                    sortArray.sort(function(a,b) {
                        return b.count - a.count;
                    });
                    comingObj[k] = sortArray;
                });
                $.each(goingObj, function(k) {
                    var cPro = goingObj[k];
                    var cKeys = Object.keys(cPro);
                    var sortArray = [];
                    cKeys.forEach(function(e) {
                        if (e == 'abbrev' || e == 'name' || e == 'total'){

                        } else {
                            sortArray.push({
                                adcode: e,
                                count: cPro[e]
                            });
                        }
                    });
                    sortArray.sort(function(a,b) {
                        return b.count - a.count;
                    });
                    goingObj[k] = sortArray;
                });
//                console.log(coming, going);
//                console.log(comingObj, goingObj);

                drawTable('#cityBoard');

                g.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("class", "state")
                    .attr("id", function (d) {
                        return "S" + d.properties.AD_CODE;
                    })
                    .attr("d", path)
                    .attr("stroke-width", 0.5)
                    .style("stroke", theme.mapStroke)
                    .style("fill", theme.background)
                    .attr('stroke-dasharray', function(d){
                        return this.getTotalLength() + ' ' + this.getTotalLength();
                    })
                    .attr('stroke-dashoffset', function() {
                        return this.getTotalLength();
                    })

                    .transition()
                    .duration(1000)
                    .attr('stroke-dashoffset', 0);

                g.selectAll("circle")
                    .data(json.features)
                    .enter().append("circle")
                    .attr("cx", function (d) {
                        var centname = d.properties.NAME;
                        var ctroid;
                        ctroid       = path.centroid(d)[0];
                        return ctroid;
                    })
                    .attr("cy", function (d) {
                        var centname = d.properties.NAME;
                        var ctroid;
                        ctroid       = path.centroid(d)[1];
                        return ctroid;
                    })
                    .attr("r", 0)
                    .attr("class", "circ")
                    .attr("id", function (d) {
                        return "C" + d.abbrev;
                    })
                    .attr("fill", function (d) {
                        var diff = d.properties.total_in - d.properties.total_out;
                        if (diff > 0) {
                            return theme.cComing;
                        } else {
                            return theme.cGoing;
                        }

                    })
                    .attr("fill-opacity", theme.cComingOpacity)
                    .attr("stroke", "#fff")
                    .attr("stroke-weight", "0.5")
                    .on("mouseover", function (d) {
                        return toolOver(d, this);
                    })
                    .on("mousemove", function (d) {
                        var m  = d3.mouse(this);
                        var mx = m[0];
                        var my = m[1];
                        return toolMove(mx, my, d);
                    })
                    .on("mouseout", function (d) {
                        return toolOut(d, this);
                    })
                    .on("click", function (d) {
                        clicked(d)
                    })

                    .transition()
                    .duration(1000)
                    .delay(1000)
                    .attr('r', function (d) {
                        var diff = d.properties.total_in - d.properties.total_out;
                        return circleSize(Math.sqrt(Math.abs(diff * cricleradius) / Math.PI));
                    });
            });
        });
    }


    /**
     * 将子集数组转换为对象
     * @param obj
     * @returns {*}
     */
    var pairs = function(obj) {
        var keys = Object.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
//            pairs[i] = [keys[i], obj[keys[i]]];
            pairs[i] = obj[keys[i]];
        }
        for (var i = 0; i < length; i++) {
            pairs[i].abbrev = keys[i];
        }
        return pairs;
    };

    function toolOver(v, thepath) {

        d3.select(thepath).style({
            "fill-opacity": theme.cComingHoverOpacity,
            "cursor": "pointer"
        });
        return tooltip.style("visibility", "visible");
    }

    function toolOut(m, thepath) {
        d3.select(thepath).style({
            "fill-opacity": theme.cComingOpacity,
            "cursor": ""
        });
        return tooltip.style("visibility", "hidden");
    }


    function toolMove(mx, my, data) {

        if (mx < 120) {
            mx = 120
        }

        if (my < 40) {
            my = 40
        }
        return tooltip.style("top", my + -50 + "px").style("left", mx - 120 + "px").html("<div id='tipContainer'><div id='tipLocation'><b>" + data.name + "</b></div><div id='tipKey'>迁入: <b>" + formatC(data.properties.total_in) + "</b><br>迁出: <b>" + formatC(data.properties.total_out) + "</b><br>净增: <b>" + formatC((data.properties.total_in - data.properties.total_out)) + "</b></div><div class='tipClear'></div> </div>");
    }

    function toolOver2(v, thepath) {

        d3.select(thepath).style({
            "opacity": "1",
            "cursor": "pointer"
        });
        return tooltip2.style("visibility", "visible");
    }

    function toolOut2(m, thepath) {
        d3.select(thepath).style({
            "opacity": "0.5",
            "cursor": ""
        });
        return tooltip2.style("visibility", "hidden");
    }

    function toolMove2(mx, my, home, end, v1, v2) {
        var diff = v1 - v2;

        if (mx < 120) {
            mx = 120
        }

        if (my < 40) {
            my = 40
        }
        return tooltip2.style("top", my + -50 + "px").style("left", mx - 120 + "px").html("<div id='tipContainer2'><div id='tipLocation'><b>" + home + "/" + end + "</b></div><div id='tipKey2'>从 " + home + " 到 " + end + ": <b>" + formatC(v2) + "</b><br>从 " + end + " 到 " + home + ": <b>" + formatC(v1) + "</b><br>净增 " + home + ": <b>" + formatD(v1 - v2) + "</b></div><div class='tipClear'></div> </div>");
    }


    /**
     * !!coming 和 going 省份顺序要一致
     * @param selected
     */
    function clicked(selected) {

        //var coming = selected.properties;
        var selname = selected.properties.AD_CODE;
        var statename = selected.name;

        comingGoingTable(selname);
        var comingTop10 = comingObj[selname].slice(0,10),
            goingTop10 = goingObj[selname].slice(0,10);
        /*
         d3.selectAll(".circ")
         .attr("fill-opacity", "0.2");
         */

        var homex = path.centroid(selected)[0];
        var homey = path.centroid(selected)[1];

        g.selectAll(".goingline")
//                .attr("stroke-dasharray", 0)
            .attr("stroke-dasharray", function() {
                return this.getTotalLength() + "," + this.getTotalLength();
            })
            .attr('stroke-dashoffset', function() {
                return this.getTotalLength();
            })
            .remove();
        g.selectAll('.goingline').transition().remove();


        g.selectAll(".goingline")
            .data(going)
            .enter().append("path")
            .filter(function(d, i) {
                // 过滤前10地区，并保存原顺序index
                var cFlag = comingTop10.some(function(e) {
                    if (e.adcode == coming[i].abbrev) {
                        coming[i].index = i;
                        going[i].index = i;
                        return true;
                    } else {
                        return false;
                    }
                });
                var gFlag = goingTop10.some(function(e) {
                    if (e.adcode == going[i].abbrev) {
                        coming[i].index = i;
                        going[i].index = i;
                        return true;
                    } else {
                        return false;
                    }
                });
                return cFlag || gFlag;
            })
            .attr("class", "goingline")
            .attr("d", function (d) {
                var i = d.index;
                var abb      = d.abbrev;
                var finalval = coming[i][selname] - going[i][selname];
//                console.log(i, coming[i][selname], going[i][selname]);
                var theState = d3.select("#S" + abb);

                if (!isNaN(finalval)) {
                    var startx = path.centroid(theState[0][0].__data__)[0];
                    var starty = path.centroid(theState[0][0].__data__)[1];

                    if (finalval > 0) {
                        return "M" + startx + "," + starty + " Q" + (startx + homex) / 2 + " " + (starty + homey) / 1.5 + " " + homex + " " + homey;

                    } else {
                        return "M" + homex + "," + homey + " Q" + (startx + homex) / 2 + " " + (starty + homey) / 2.5 + " " + startx + " " + starty;
                    }
                }
            })
            .call(transition)
            .attr("stroke-width", function (d) {
                var i = d.index;
                var finalval = coming[i][selname] - going[i][selname];

                return lineSize(parseFloat(Math.abs(finalval)));
            })
            .attr("stroke", function (d) {
                var i = d.index;
                var finalval = coming[i][selname] - going[i][selname];
                if (finalval > 0) {

                    return theme.cComing;
                } else {
                    return theme.cGoing;
                }

            })
            .attr("fill", "none")
            .attr("opacity", theme.cComingOpacity)
            .attr("stroke-linecap", "round")
            .on("mouseover", function (d) {
                return toolOver2(d, this);
            })
            .on("mousemove", function (d) {
                var i = d.index;
                var m  = d3.mouse(this);
                var mx = m[0];
                var my = m[1];
                return toolMove2(mx, my, statename, d.name, coming[i][selname], going[i][selname]);
            })
            .on("mouseout", function (d) {
                return toolOut2(d, this);
            });

    }


    function transition(path) {
        path
            .attr('stroke-dasharray', function(){
                var l = this.getTotalLength();
                return l + "," + l;
            })
            .attr('stroke-dashoffset', function() {
                return this.getTotalLength();
            })
            .transition()
            .duration(200)
//                .ease('linear')
            .attr('stroke-dashoffset', 0)
//                .attrTween("stroke-dasharray", tweenDash)
            .each("end", dashEase)
    }

    function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) {
            return i(t);
        };
    }

    function dashEase() {
        var goingLine = d3.selectAll('path.goingline');
        goingLine.transition().remove(); // cancel all transitions
        (function repeat(){
            goingLine.each(function(){
                var line = d3.select(this);
                var strokeWidth = line.attr('stroke-width');

                (function rrpeat() {
                    line
                        .attr('stroke-dasharray', function () {
                            var l = this.getTotalLength();
                            return "-10," + 10 + "," + l;
                        })
                        .transition()
                        .duration(function () {
                            var l = this.getTotalLength();
                            var t = 1000 * (l / 100);
                            return t;
                        })
                        .ease("sin")
                        .attr("stroke-dasharray", function () {
                            var l = this.getTotalLength();

                            return l + "," + 8 + "," + l;
                        })
                        .each("end", rrpeat);
                })();
            });

//            goingLine
//                    .attr('stroke-dasharray', function(){
//                        var l = this.getTotalLength();
//                        return "0,10," + l;
//                    })
//                    .transition()
//                    .duration(2000)
//                    .ease("sin")
//                    .attr("stroke-dasharray", function () {
//                        var l = this.getTotalLength();
//                        return l + ",2," + l;
//                    })
//                    .each("end", repeat);

        })();

    }

//    d3.select(self.frameElement).style("height", "700px");


    function openCircle(adcode) {
        d3.select('circle#C' + adcode).on('click')(d3.select('circle#C' + adcode).data()[0]);
    }

    //*****************************************************

    function drawTable(target) {

        var _coming = [],
            _going = [];
        $.extend(_coming, coming);
        $.extend(_going, going);
        _coming.sort(function(a, b) {
            return b.total - a.total;
        });
        _going.sort(function(a, b) {
            return b.total - a.total;
        });

        var hotComing = [],
            hotGoing = [];
        _coming.forEach(function(e) {
            hotComing.push({
                col: {
                    adcode: e.abbrev,
                    name: e.name,
                    count: e.total
                }
            });
        });
        _going.forEach(function(e) {
            hotGoing.push({
                col: {
                    adcode: e.abbrev,
                    name: e.name,
                    count: e.total
                }
            });
        });
        hotComing.splice(10);
        hotGoing.splice(10);
        $('#cityBoard1').bootstrapTable('destroy');
        $('#cityBoard1').bootstrapTable({
            sidePagination: 'client',
            columns: [
                {
                    title:'',
                    width: '10%',
                    formatter: function(value, row, index) {
                        return index + 1;
                    }
                },
                {
                    title: '迁入排名',
                    field: 'col',
                    formatter: function(value, row, index) {
                        return "<a href='javascript:;' data-adcode='" + value.adcode + "'>" + value.name + "</a>";
                    },
                    events: {
                        'click a': function (e, row, $element) {
                            openCircle(row.adcode);
                            $('#totalMig').hide();
                            $('#detailMig').show();
                            $("#back-btn").show();
                            comingGoingTable(row.adcode);
                        }
                    }
                }
            ],
            data: hotComing
        });
        $('#cityBoard1').bootstrapTable('hideLoading');

        $('#cityBoard2').bootstrapTable('destroy');
        $('#cityBoard2').bootstrapTable({
            sidePagination: 'client',
            columns: [
                {
                    title:'',
                    width: '10%',
                    formatter: function(value, row, index) {
                        return index + 1;
                    }
                },
                {
                    title: '迁出排名',
                    field: 'col',
                    formatter: function(value, row, index) {
                        return "<a href='#' data-adcode='" + value.adcode + "'>" + value.name + "</a>";
                    },
                    events: {
                        'click a': function(value, row, index) {
                            openCircle(row.adcode);
                            comingGoingTable(row.adcode);
                        }
                    }
                }
            ],
            data: hotGoing
        });
        $('#cityBoard2').bootstrapTable('hideLoading');

        $('.maincontent').addClass('start');
    }

    function comingGoingTable(adcode) {
        $('#totalMig').hide();
        $('#detailMig').show();
        $("#back-btn").show();

        var cPro = comingObj[adcode];
        var cMod = [];
        cPro.forEach(function(e) {
            cMod.push({
                col: {
                    ori: adcode,
                    adcode: e.adcode,
                    count: e.count
                }
            });
        });

        var gPro = goingObj[adcode];
        var gMod = [];
        gPro.forEach(function(e) {
            gMod.push({
                col: {
                    ori: adcode,
                    adcode: e.adcode,
                    count: e.count
                }
            });
        });
        cMod.splice(10);
        gMod.splice(10);

        $('#comingTable').bootstrapTable('destroy');
        $('#comingTable').bootstrapTable({
            showHeader: false,
            columns: [
                {
                    title: '',
                    width: '5%',
                    formatter: function(v, r, i) {
                        return i + 1;
                    }
                },
                {
                    title: '迁出',
                    field: 'col',
                    width: '25%',
                    formatter: function(value) {
                        return "<a href='javascript:;' data-adcode='" + value.adcode + "'>" + adcodeMapping[value.adcode] + "</a>";
                    },
                    events: {
                        'click a': function(value, row, index) {
//                            console.log(row);
                            comingGoingTable(row.adcode);
                            openCircle(row.adcode);
                        }
                    }
                },
                {
                    title: '迁入',
                    field: 'col',
                    width: '25%',
                    formatter: function(value) {
                        return "<a href='javascript:;' data-adcode='" + value.ori + "'>" + adcodeMapping[value.ori] + "</a>";
                    }
                }
            ],
            data: cMod
        });
        $('#comingTable').bootstrapTable('hideLoading');

        $('#goingTable').bootstrapTable('destroy');
        $('#goingTable').bootstrapTable({
            showHeader: false,
            columns: [
                {
                    title: '',
                    width: '5%',
                    formatter: function(v, r, i) {
                        return i + 1;
                    }
                },
                {
                    title: '迁出',
                    field: 'col',
                    width: '25%',
                    formatter: function(value) {
                        return "<a href='javascript:;' data-adcode='" + value.ori + "'>" + adcodeMapping[value.ori] + "</a>";
                    }
                },
                {
                    title: '迁入',
                    field: 'col',
                    width: '25%',
                    formatter: function(value) {
                        return "<a href='javascript:;' data-adcode='" + value.adcode + "'>" + adcodeMapping[value.adcode] + "</a>";
                    },
                    events: {
                        'click a': function(value, row, index) {
//                            console.log(row);
                            comingGoingTable(row.adcode);
                            openCircle(row.adcode);
                        }
                    }
                }
            ],
            data: gMod
        });
        $('#goingTable').bootstrapTable('hideLoading');

    }

    $("#back-btn").hide();
    $("#back-btn").click(function() {
        $('#totalMig').show();
        $('#detailMig').hide();
        g.selectAll('.goingline').transition().remove();
        $("#back-btn").hide();
    });
});