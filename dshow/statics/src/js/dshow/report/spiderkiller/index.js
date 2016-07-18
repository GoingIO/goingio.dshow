/**
 * Created by telen on 15/5/18.
 */
require(['d3', 'dataloader', 'blackhole'], function(d3, dataloader) {

    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());

    var projection = d3.geo.mercator()
        .scale(850)
        .translate([-850, 1000]);

    function painting() {
        var w = '100%';
        var h = window.innerHeight - 85;
        var centered;

        var formatC = d3.format(",.0f");
        var formatD = d3.format("+,.0f");

        //Define path generator
        var path = d3.geo.path()
            .projection(projection);

        var colors    = ["#EDF8FB", "#41083e"];
        var theme  = {
            background: 'rgba(43, 38, 96, .9)',
            mapStroke: '#ccc',
            cComing: '#65a89d',
            cComingOpacity: '0.5',
            cGoing: '#a96a46'
        };
        var themeBlue     = {
            background: '#2B2660',
            mapStroke: '#FDFDFD',
            cComing: '#5EDBDF',
            cComingOpacity: '0.8',
            cComingHoverOpacity: '0.8',
            cGoing: '#E6DD39'
        };
        var immdomain = [24431, 537148];
        var emmdomain = [20056, 566986];

        var cricleradius = 4;
        var circleSize   = d3.scale.linear().range([2, 25000]).domain([0, 107175]);

        var lineSize = d3.scale.linear().range([2, 25]).domain([0, 35000]);

        var fillcolor = d3.scale.linear().range(colors).domain(immdomain);

        //Create SVG element
        var svg = d3.select("#map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .style("background", theme.background);

        var g = svg.append("g");
        var layer = svg.append("g");

        d3.json(DSHOW_CONTEXT + "/statics/js/geodata/china.json", function (json) {

            for (var j = 0; j < json.features.length; j++) {
                var jsonAdcode          = json.features[j].properties.AD_CODE;
                json.features[j].id     = jsonAdcode;
                json.features[j].abbrev = jsonAdcode;
                json.features[j].name   = json.features[j].properties.NAME;

            }

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
            ;

        });

        layer
            .append('circle')
            .attr("class", "starter")
            .attr('r', 2)
            .style("fill", theme.cComing)
            .attr("transform", function() {
                return "translate(" + projection([116.46, 39.92]) + ")";
            });

//        layer
//            .append("circle")
//            .attr("class", "end")
//            .attr("r", 2)
//            .style("fill", theme.cGoing)
//            .attr("transform", function() {
//                return "translate(" + projection([106.54, 29.59]) + ")";
//            });

        var pathline = layer.append("path")
            .attr("d", function() {
                return "M" + projection([116.46, 39.92]).join(",") + "L" + projection([106.54, 29.59]).join(",") + "Z";
            })
            .style("stroke", "none")
            .attr("fill", "none");

        /*
        var laser = layer.append("g");
        laser.append("svg:image")
            .attr("xlink:href", DSHOW_CONTEXT + "/statics/images/laser02.png")
            .attr("width", 54)
            .attr("height", 6)
//            .attr("x", function() {
//                return projection([116.46, 39.92])[0];
//            })
//            .attr("y", function() {
//                return projection([116.46, 39.92])[1];
//            })
            .attr("transform", function() {
                return "";
            });

        transition();

        function transition() {
            laser.transition()
                .duration(10000)
                .delay(1000)
                .attrTween("transform", translateAlong(pathline.node()))
                .each("end", transition);
        }
        */
    }

    // Returns an attrTween for translating along the specified path element.
    function translateAlong(path) {
        var l = path.getTotalLength();
        return function(d, i, a) {
            return function(t) {
                var p = path.getPointAtLength(t * l);
                return "translate(" + p.x + "," + p.y + "), rotate(-60)";
            };
        };
    }

    var loadingMask = (function() {
        document.querySelector(".mask").appendChild(document.createElement("canvas"));
        var canvas = document.querySelector(".mask canvas");
        var context;
        if(canvas && canvas.getContext) {
            context = canvas.getContext('2d');

            window.addEventListener('resize', windowResizeHandler, false);
            windowResizeHandler();
        }
        function windowResizeHandler() {
            var SCREEN_WIDTH = window.innerWidth;
            var SCREEN_HEIGHT = window.innerHeight - 85;
            canvas.width = SCREEN_WIDTH;
            canvas.height = SCREEN_HEIGHT;
        }

        var radius = 2, radius2 = 1,
            alpha = .6,
            alpha2 = .2,
            loaded = false,
            timer;

        function circ() {
            timer = requestAnimationFrame(circ);
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.fillStyle = "rgb(9, 9, 25)";
            context.fillRect(0, 0, canvas.width, canvas.height);

            if (loaded) {
                context.globalCompositeOperation = 'xor';

                context.beginPath();
//                context.fillStyle = "rgba(9, 9, 25, 0)";

                context.arc(canvas.width / 2, canvas.height / 2, radius2, 0, Math.PI * 2);
                context.closePath();
                context.stroke();
                context.fill();

                radius2 = radius2 + 0.15 * radius2;

                if (radius2 > canvas.width) {
                    cancelAnimationFrame(timer);
                    document.querySelector(".mask").remove();

                }
            } else {
                context.save();
                context.beginPath();
                context.fillStyle = "rgb(9, 9, 25)";
                context.fillRect(0, 0, canvas.width, canvas.height);

                context.fillStyle = "rgba(0, 196, 223, " + alpha + ")";
                context.strokeStyle = "rgba(0, 196, 223, " + alpha2 + ")";
                context.strokeWidth = 2;
                context.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
                context.closePath();
                context.stroke();
                context.fill();
                context.restore();

                if (alpha2 > -.4) {
                    if (radius <= 50) {
                        radius = radius + 1;
                        alpha = alpha - .01;
                    } else {
                        radius = radius + 1;
                        alpha = alpha - .01;
                        alpha2 = alpha2 - .01;
                    }

                } else {
                    radius = 2;
                    alpha = .6;
                    alpha2 = .2;
                }

                context.save();
                context.beginPath();
                context.fillStyle = "rgb(0, 196, 223)";
                context.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
                context.closePath();
                context.fill();
                context.restore();
            }


        }

        circ();


        function setLoaded() {
            setTimeout(function() {
                loaded = true;
            }, 1000);
        }

        return {
            loaded: setLoaded
        };

    }());


    /**
     * Canvas Module
     * @type {{attack}}
     */
    var canvasLayer = (function(){
        var SCREEN_WIDTH = 900;
        var SCREEN_HEIGHT = 500;

        var particles = [];
        var circles = [];

        var canvas;
        var context;
        canvas = document.getElementById('world');

        if(canvas && canvas.getContext) {
            context = canvas.getContext('2d');
            context.globalCompositeOperation = 'destination-over';
            window.addEventListener('resize', windowResizeHandler, false);
            windowResizeHandler();
        }
        function windowResizeHandler() {
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            canvas.width = SCREEN_WIDTH;
            canvas.height = SCREEN_HEIGHT;
        }

        function randomColor() {
            return {
                r: Math.floor(Math.random() * 255),
                g: Math.floor(Math.random() * 255),
                b: Math.floor(Math.random() * 255)
            };
        }
/* //canvas点击模拟
        canvas.addEventListener("mousedown", function(e) {
            e.preventDefault();
            var mouseX = e.pageX;
            var mouseY = e.pageY;

            mouseX = projection([106.54, 29.59])[0];
            mouseY = projection([106.54, 29.59])[1];
            var step = 5;
//            var x2 = mouseX + Math.random() * 100 * (Math.random() > 0.5 ? 1 : -1);
//            var y2 = mouseY + Math.random() * 100 * (Math.random() > 0.5 ? 1 : -1);

            var dx = projection([116.46, 39.92])[0];
            var dy = projection([116.46, 39.92])[1];
//            console.log([mouseX, mouseY]);
//            console.log(projection([116.46, 39.92]));

            attack(mouseX, mouseY, dx, dy);

        }, false);*/

        function attack(fromX, fromY, toX, toY) {
            // Default Beijing
            var toX = toX || projection([116.46, 39.92])[0];
            var toY = toY || projection([116.46, 39.92])[1];

            var speed = 7;

            var theta = Math.atan2(toY - fromY, toX - fromX);
            var vx = speed * Math.cos(theta);
            var vy = speed * Math.sin(theta);

            // 激光长度终点坐标
            var x2 = 10 * vx + fromX;
            var y2 = 10 * vy + fromY;

            addGradientParticles(fromX, fromY, x2, y2, vx, vy, toX, toY);
            circles.push(new Circle(fromX, fromY));
        }

        /**
         * (x1, y1)--===>(x2, y2) - - - - - - - (dx, dy)
         *              ------>
         *
         * @param x
         * @param y
         * @param x2
         * @param y2
         * @param vx
         * @param vy
         * @constructor
         */
        function GradientParticle(x, y, x2, y2, vx, vy, dx, dy) {
            this.xx = x;
            this.yy = y;

            this.x1 = x;
            this.y1 = y;
            this.x2 = x;
            this.y2 = y;

            this.x0 = x2;
            this.y0 = y2;

            this.vx = vx;
            this.vy = vy;

            this.dx = dx || this.x0 + 60 * this.vx;
            this.dy = dy || this.y0 + 60 * this.vy;

//            this.dx = projection([116.46, 39.92])[0];
//            this.dy = projection([116.46, 39.92])[1];

            this.color = randomColor();

            this.starting = false;
            this.ending = false;
        }

        GradientParticle.prototype.draw = function(context) {
            context.save();

            var gradient = context.createLinearGradient(this.x1, this.y1, this.x2, this.y2);

            gradient.addColorStop(0, "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + ", 0)");
            gradient.addColorStop(1, "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + ", 1)");
            context.beginPath();
            context.lineWidth = 2;
            context.lineJoin = "round";
            context.lineCap = "round";
            context.strokeStyle = gradient;
            context.moveTo(this.x1, this.y1);
            context.lineTo(this.x2, this.y2);

//            context.fillStyle = "rgba(0, 0, 0, 1)";
//            context.arc(this.xx, this.yy, 3, 0, 2 * Math.PI);
//            context.closePath();
            context.stroke();

            context.beginPath();
            context.shadowColor = "white";
            context.shadowBlur = 4;
            context.arc(this.x2, this.y2, 1, 0, Math.PI * 2, false);

            context.stroke();
            context.restore();

        };

        GradientParticle.prototype.update = function() {

            if (Math.abs(this.x2 - this.x1) >= Math.abs(this.x0 - this.x1)) {
                this.starting = true;
            }

            // 尾部移动
            if (this.starting || this.isToDestination()) { // 起止点距离比光线长度短
                this.x1 += this.vx;
                this.y1 += this.vy;
            }

            // 头部移动
            if (this.isToDestination()) {
                this.x2 = this.dx;
                this.y2 = this.dy;
            } else {
                this.x2 += this.vx;
                this.y2 += this.vy;
            }


        };

        GradientParticle.prototype.isOutOfBorder = function(w, h) {
            return this.x1 < 0 || this.y1 < 0 || this.x1 > w || this.y1 > h;
        };

        GradientParticle.prototype.isToDestination = function() {

            return Math.abs(this.x2 - this.xx) >= Math.abs(this.dx - this.xx);
        };

        GradientParticle.prototype.isOutOfDestination = function() {
            return Math.abs(this.x1 - this.xx) >= Math.abs(this.dx - this.xx);
        };

        function addGradientParticles(x, y, x2, y2, vx, vy, dx, dy) {
            particles.push(new GradientParticle(x, y, x2, y2, vx, vy, dx, dy));
//            console.log(particles.length);
        }

        function updateGradientParticle() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < particles.length; i++) {
                particles[i].draw(context);
                if (particles[i].isOutOfBorder(canvas.width, canvas.height) || particles[i].isOutOfDestination()) {

                    circles.push(new Circle(particles[i].dx, particles[i].dy, particles[i].color));
                    particles.splice(i, 1);
                    i--;
                } else {
                    particles[i].update();
                }
            }

            for (var a = 0; a < circles.length; a++) {
                circles[a].draw(context);
                if (circles[a].alpha <= 0) {
                    circles.splice(a, 1);
                    a--;
                } else {
                    circles[a].update();
                }
            }

            requestAnimationFrame(updateGradientParticle);
//            setTimeout(updateGradientParticle, 500)
        }

        function Circle(x, y, color) {
            this.x = x;
            this.y = y;

            this.radius = 1;
            this.alpha = 1;
            this.fade = 0.01;
            this.grow = 0.4;

            this.color = color || randomColor();

        }

        Circle.prototype.update = function() {
            this.alpha -= this.fade;
            this.radius += this.grow;
        };

        Circle.prototype.draw = function(context) {
            context.save();
            context.beginPath();
            context.shadowColor = "white";
            context.shadowBlur = 10;
            context.fillStyle = "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + "," + this.alpha + ")";
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            context.fill();
            context.closePath();

            context.beginPath();
            context.fillStyle = "rgba(255, 255, 255, 0.8)";
            context.arc(this.x, this.y, 1, 0, 2 * Math.PI, false);
            context.fill();

            context.restore();
        };

        setTimeout(function () {
            updateGradientParticle();
        }, 1000);

        return {
            attack: attack
        };
    }());



    /**
     * 数据
     */
    var dataController = (function(cl) {

        var data = [];
        var i = 0;
        var timer,
            intervalTimer;

        d3.json(DSHOW_CONTEXT + "/statics/js/dshow/report/spiderkiller/areaLocationMapping.json", function(location) {

            var format = d3.time.format("%Y-%m-%d");
            var format2 = d3.time.format("%Y-%m-%d %H:%M");
            var yesterDayFMD = format(new Date(new Date().getTime() - 24*60*60*1000));
            var startDate = format2.parse(yesterDayFMD + " 00:00");
            var endDate = format2.parse(format(new Date()) + " 00:00");

            dataloader.load(startDate, endDate, '/log/post/nocache/s_amap_aos_anticrawler_visual', {
                source: 'rds',
                type: 'post',
                dateformat: 'yyyy-MM-dd hh:mm',
                params: {
                    sort: 'd_datebuf:asc'
                }
            }, function(d) {
                var reg = /省|自治区|市|区|朝鲜族自治州/g;
                var temp = [];

                for (var i = 0; i < d.length; i++) {

                    var province = d[i].log_from_province ? d[i].log_from_province.replace(reg, '') : '';
                    var city = d[i].log_from_city ? d[i].log_from_city.replace(reg, '') : '';

                    var latLng = undefined;
                    if (province && location[province]) {
                        var p = location[province];
                        if (city && p[city]) {
                            latLng = p[city];
                        } else {
                            latLng = p[city];
                        }
                    }

                    temp.push(
                        {
                            ip: d[i].log_fromip,
                            country: d[i].log_from_country,
                            province: province,
                            city: city,
                            location: latLng,
                            servname: d[i].log_servicetype,
                            time: d[i].d_datebuf,
                            isblock: d[i].log_isblock,
                            pv: d[i].pv
                        }
                    );
                }
                data = temp;
                loadingMask.loaded();

                loop();

//                console.log(data);
            });

/* //本地数据
            d3.csv(DSHOW_CONTEXT + "/statics/js/dshow/report/spiderkiller/s_amap_aos_anticrawler_visual_temp_wenlong.csv", function(d) {
                var reg = /省|自治区|市|区|朝鲜族自治州/g;
//                var formatter = d3.time.format("%Y-%m-%d %H:%M:%S");
                var formatter = d3.time.format("%Y%m%d %H:%M");

                var province = d.province ? d.province.replace(reg, '') : '';
                var city = d.city ? d.city.replace(reg, '') : '';
                var district = d.district ? d.district.replace(reg, '') : '';

                var latLng = undefined;
                if (province && location[province]) {
                    var p = location[province];
                    if (city && p[city]) {
                        latLng = p[city];
                    } else if (district && p[district]) {
                        latLng = p[district];
                    } else {
                        latLng = p[city];
                    }
                }

                return {
                    ip: d.log_fromip,
                    country: d.country,
                    province: province,
                    city: city,
                    district: district,
                    location: latLng,
                    servname: d.log_servicetype,
                    time: d.mi,
                    isblock: d.isblock,
                    pv: d.pv
                };
            }, function(error, d) {
                if (error) throw error;

                data = d;
                loop();

            });
            */
        });



        function loop() {

            do {
                if (data[i] && data[i].location) {
                    var fromX = projection([data[i].location.x, data[i].location.y])[0];
                    var fromY = projection([data[i].location.x, data[i].location.y])[1];

                    cl.attack(fromX, fromY);
                    consoleTable(data[i]);
                    updateData(data[i]);
                }
                i++;
            } while(i <= (data.length - 1) && data[i-1].time == data[i].time); // 同一分钟的数据同时压入

            timer = setTimeout(loop, 1500);
        }


        // play controller
        function pause() {
            clearTimeout(timer);
            clearInterval(intervalTimer);

            $(".timeslider li.controls i").removeClass("fa-pause").addClass("fa-play");

            $(".timeslider li.controls i").data("btnPause", false);

        }

        function resume() {
            timer = setTimeout(loop, 1500);
            intervalTimer = setInterval(rePaint, 3000);

            $(".timeslider li.controls i").removeClass("fa-play").addClass("fa-pause");

            $(".timeslider li.controls i").data("btnPause", true);

        }

        $(".timeslider li.controls i").on("click", function() {
            if ($(this).hasClass("fa-pause")) {

                pause();
            } else if ($(this).hasClass("fa-play")) {

                resume();
            }

        });


        function consoleTable(d) {
            if (!d) return;
            if ($(".liveAttacks tr.row").length > 5) {
                $(".liveAttacks tr.row")[1].remove();
            }

            var location = "";
            if (d.country == "中国") {
                if (d.province !== "NULL") {
                    location += d.province;
                }
                if (d.city !== "NULL") {
                    location += "," + d.city;
                }
//                if (d.district !== "NULL") {
//                    location += "," + d.district;
//                }
            } else {
                location = d.country;
            }

            var template = "<tr class='row'><td class='number'>" + d.time + "</td><td class='number'>" + d.ip + "</td><td>" + location + "</td><td>" + d.servname + "</td></tr>";
            $(".liveAttacks table").append(template);
        }

        var areaArray = [],
            serviceArray = [],
            blockAttack = {
                block: 0,
                attack: 0
            };

        function areaTable() {



            /*d3.csv(DSHOW_CONTEXT + "/statics/js/dshow/report/spiderkiller/s_amap_aos_anticrawler_visual_temp_area.csv", function(d) {
                return {
                    item: d.province + "," + d.city,
                    pv: d.pv
                }
            }, function(data) {

                areaArray = data;
                appendTable(".area-rank", areaArray);
            });

            // -----------------------
            d3.csv(DSHOW_CONTEXT + "/statics/js/dshow/report/spiderkiller/s_amap_aos_anticrawler_visual_temp_service.csv", function(d) {
                return {
                    item: d.log_servicetype,
                    pv: d.pv
                }
            }, function(data) {

                serviceArray = data;
                appendTable(".service-rank", serviceArray);
            });*/
        }

        function areaTableSort(selector) {
            var target = d3.select(selector);

            target.selectAll("div.tr")
                .sort(function (a, b) {
                    return b.pv - a.pv;
                })
                .transition()
                .duration(500)
                .style({
                    top: function(d, i) {
                        return 105 + (i * 20) + "px";
                    }
                });
        }

        function rePaint() {
            updateTable(".area-rank", areaArray);
            updateTable(".service-rank", serviceArray);

            areaTableSort(".area-rank");
            areaTableSort(".service-rank");

            updateBlockAttack(blockAttack);
        }
        intervalTimer = setInterval(rePaint, 3000);


        function updateData(data) {
            var f1 = false,
                f2 = false;

            if (data) {
                // 地域数据
                for (var i = 0; i < areaArray.length; i++) {
                    if (areaArray[i].item.indexOf(data.city) >= 0) {
                        areaArray[i].pv = parseInt(areaArray[i].pv, 10) + parseInt(data.pv, 10);
                        f1 = true;
                    }
                }
                if (!f1) {
                    areaArray.push({
                        item: data.province + "," + data.city,
                        pv: data.pv
                    })
                }

                // 接口数据
                for (var i = 0; i < serviceArray.length; i++) {
                    if (serviceArray[i].item === data.servname) {
                        serviceArray[i].pv = parseInt(serviceArray[i].pv, 10) + parseInt(data.pv, 10);
                        f2 = true;
                    }
                }

                if (!f2) {
                    serviceArray.push({
                        item: data.servname,
                        pv: data.pv
                    })
                }

                // 总体
                if (data.isblock) {
                    blockAttack.block = blockAttack.block + parseInt(data.pv, 10)
                }
                blockAttack.attack = blockAttack.attack + parseInt(data.pv, 10);

            }
        }


        function updateTable(selector, data) {

            var target = d3.select(selector);

            var divs = target.selectAll("div.tr")
                .data(data, function(d) { return d.item; })
                ;

            divs.selectAll("span.pv")
                .text(function(d) {
                    return d.pv;
                });

            // append those not exists.
            var divIn = divs.enter().append("div")
                .attr({"class" : "tr"})
                .style({
                    top: function(d, i) {
                        return 105 + (i * 20) + "px";
                    }
                });

            divIn
                .append("span")
                .attr({"class" : "pv number"})
                .html(function(d) {
                    return d.pv;
                });

            divIn
                .append("span")
                .attr({"class" : "item"})
                .html(function(d) {
                    return d.item;
                });

        }

        function updateBlockAttack(ba) {
            $("div.count span.block").text(ba.block);
            $("div.count span.attack").text(ba.attack);
        }


        return {
            updateData: updateData,
            pause: pause,
            resume: resume
        };
    }(canvasLayer));

    function init() {
        painting();
    }

    init();

    window.addEventListener("focus", function(e) {
        console.log("focus");
        dataController.resume();
    }, false);
    window.addEventListener("blur", function(e) {
        console.log("blur");
        dataController.pause();
    });
});
