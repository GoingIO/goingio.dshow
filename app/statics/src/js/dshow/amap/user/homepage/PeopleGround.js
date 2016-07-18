define(['react', 'react-dom', 'datautils', 'd3', 'adcodes'], function (React, ReactDom, datautils, d3, Adcodes) {

    var width = 500,
        height = 320;
    var projection = d3.geo.mercator()
        .scale(400)
        .translate([(0.62 * width - 806), 450]);

    var category20 = d3.scale.category20();

    var If = React.createClass({
        render: function() {
            if (this.props.test) {
                return this.props.children;
            }
            else {
                return null;
            }
        }
    });

    var MapBg = React.createClass({

        componentWillReceiveProps(nextProps) {

            var hc = [nextProps.home, nextProps.company];

            d3.selectAll(".hc").remove();
            d3.select(this.refs.map).select("svg g").append("g").attr("class", "hc").selectAll("circle").data(hc).enter().append("circle")
                .attr("r", 2)
                .attr("class", function(d, index) {
                    return index == 0 ? 'home' : 'company';
                })
                .attr("transform", function(d) {
                    return "translate(" + projection([
                            d[0],
                            d[1]
                        ]) + ")";
                });
        },

        componentDidMount() {


            var path = d3.geo.path()
                .projection(projection);

            var zoom = d3.behavior.zoom()
                .translate(projection.translate())
                .scale(projection.scale())
                .scaleExtent([200, 11 * height])
                //.on("zoom", zoomed);

            var svg = d3.select(this.refs.map).append("svg")
                .attr("width", width)
                .attr("height", height);

            var g = svg.append("g")
                .call(zoom);

            g.append("rect")
                .attr("class", "background")
                .attr("width", width)
                .attr("height", height);

            d3.json(DSHOW_CONTEXT + '/statics/js/geodata/china.json', function(error, china) {
                if (error) throw error;

                g.append("g")
                    .attr("id", "states")
                    .selectAll("path")
                    .data(china.features)
                    .enter().append("path")
                    .attr("d", path);

            });

            function zoomed() {
                projection.translate(d3.event.translate).scale(d3.event.scale);
                g.selectAll("path").attr("d", path);
                console.log(g.selectAll("circle"));
                console.log(this.props);
                $(g).trigger('zoom');
                //console.log(d3.event.translate, window.innerWidth);
            }

            g.on('mousemove', function() {
                //console.log(d3.mouse(this), projection.invert(d3.mouse(this)));
            });
        },

        render() {
            return <div id="map" ref="map"></div>;
        }
    });

    var MapBgStatic = React.createClass({

        getInitialState() {
            return {
                home: "0,0",
                company: "0,0"
            }
        },
        componentWillReceiveProps(nextProps) {

            var that = this;
            $.when(nextProps.deferredH, nextProps.deferredC).done(function(home, comp) {
                that.setState({
                    home: home,
                    company: comp
                });
            });
        },

        render() {
            let marks = '', las = '';
            if (this.state.home[0] != 0) {
                marks += 'large,0xff7f0e,家:' + this.state.home.join(',');
                las = '|'
            }
            if (this.state.company[0] != 0) {
                marks += las + 'large,0x8DB7D4,司:' + this.state.company.join(',');
            }
            if (marks == '') {
                marks = 'small,,:0,0';
            }
            return (<div id="map">
                <a className="animate" href={location.origin + '/dshow-web/web/m/amap/user/homecompany?diu=' + this.props.diu} title="家和公司">
                <img src={'http://restapi.amap.com/v3/staticmap?size=500*320&markers=' + marks + '&key=ee95e52bf08006f63fd29bcfbcf21df0'} alt="家和公司" />
            </a>
            </div>);
        }

    });

    let gMarker,gMap;
    var VisitArea = React.createClass({

        getDefaultProps() {
            return {
                width: 500,
                height: 400
            }
        },

        getInitialState() {
            return {
                coor: [],
                names: []
            }
        },
        // area "coordinate;coordinate..."
        componentWillReceiveProps(nextProps) {
            if (nextProps.area) {

                var coordinates = nextProps.area.split(';').map(
                    (val, index) => {
                        let cor = val.split(',');
                        return cor;
                    }
                );

                this.setState({
                    names: nextProps.names.split(','),
                    coor: coordinates,
                });

                gMap = new AMap.Map(this.refs.mapContainer, {
                    resizeEnable: true,
                    rotateEnable: true,
                    dragEnable: true,
                    zoomEnable: true,
                    view: new AMap.View2D({
                        center: new AMap.LngLat(116.397428, 39.90923),
                        zoom: 12
                    })
                });

                var markers = [];
                coordinates.forEach(function(latlng) {

                    markers.push(new AMap.Marker({
                        map: gMap,
                        icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                        position: latlng,
                        offset: new AMap.Pixel(-12, -36)
                    }));
                });

                gMap.setFitView();
                if (markers.length == 1) {
                    gMap.setZoom(10);
                }

            } else {
                this.setState({
                    names: [],
                    coor: [],
                });
                gMap.destroy();
            }



        },

        handleMouseEnter(index) {
            gMarker = new AMap.Marker({
                icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
                position: this.state.coor[index],
                offset: new AMap.Pixel(-12, -36)
            });
            gMarker.setMap(gMap);

            gMap.panTo(this.state.coor[index]);
        },

        handleMouseLeave(e) {
            gMarker.setMap(null);
            gMarker = null;
        },

        render() {
            if (this.state.coor) {

            }
            return <div id="map2" className="row map2" key="map2">
                <div className="col-sm-12" ref="mapContainer">

                </div>
                <div className="col-sm-12">

                        {this.state.names.map(
                            (val, index) => <span className="city-label" key={index + Math.random()} onMouseEnter={this.handleMouseEnter.bind(this, index)} onMouseLeave={this.handleMouseLeave}>
                                <span className="letter-label">{(index + 1) < 10 ? "0" + (index + 1) : (index + 1)}</span>
                                <span className="city-label-name">{val}</span>
                            </span>
                        )}

                </div>

            </div>
        }
    });

    var ActiveArea = React.createClass({

        getInitialState() {
            return {
                coor: "0,0",
                coordinates: []
            }
        },
        componentWillReceiveProps(nextProps) {
            if (nextProps.area) {
                var coordinates = nextProps.area.split(';').map(
                        val => val.split(',').reverse()
                );

                var coordinatesStr = nextProps.area.split(';').map(
                    (val, index) => {
                        let cor = val.split(',').reverse().join(',');
                        let base = index > 25 ? 97 : 65;
                        return 'mid,0x' + category20(index).substr(1) + ',' + String.fromCharCode(base + index) + ':' + cor;
                    }
                );

                this.setState({
                    coordinates: coordinates,
                    coor: coordinatesStr.join('|'),
                });
            } else {
                this.setState({
                    coordinates: [],
                    coor: "mid,,:0,0",
                });
            }



        },
        render() {

            return <div id="map2" className="row map2">
                <div className="col-sm-6">
                    <a className="animate" href={location.origin + '/dshow-web/web/m/amap/user/permanentsite?diu=' + this.props.diu} title="活跃区域">
                    <img src={'http://restapi.amap.com/v3/staticmap?size=320*320&markers=' + this.state.coor + '&key=ee95e52bf08006f63fd29bcfbcf21df0'} alt="活跃区域" />
                    </a>
                </div>
                <div className="col-sm-6">
                    <ul className="list-group">
                        {this.state.coordinates.map(
                            (val, index) => <li className="list-group-item" key={index + Math.random()}>
                                <span className="letter-label" style={{backgroundColor: category20(index)}}>{String.fromCharCode(65 + index)}</span>
                                <AnsyncSpan
                                deferred={datautils.getGD(val[0], val[1])}
                                key={index + Math.random()}></AnsyncSpan>
                                </li>
                        )}
                    </ul>
                </div>

            </div>
        }
    });

    var AnsyncSpan = React.createClass({

        getInitialState() {
            return {
                value: '[无]'
            }
        },

        getAddress(x, y) {
            var deferred = $.Deferred();
            AMap.service(["AMap.Geocoder"], function () {
                var MGeocoder = new AMap.Geocoder({
                    radius: 1000,
                    extensions: "all"
                });
                //逆地理编码
                MGeocoder.getAddress(new AMap.LngLat(x, y), function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        deferred.resolve(result);
                    }
                });
            });
            return deferred;
        },

        componentDidMount() {
            var that = this;
            this.props.deferred
                .then(function(gdx, gdy) {
                    return that.getAddress(gdx, gdy);
                })
                .done(function(data) {
                    that.setState({
                        value: data.regeocode.formattedAddress
                    });
                });
        },

        render() {
            return (<span key={this.props.key}>{this.state.value}</span>)
        }
    });

    var PeopleGround = React.createClass({
        getDefaultProps: function() {
            return {};
        },

        getInitialState() {
            return {
                u_permanent_y:  0,
                u_permanent_x:  0,
                u_home_y:  0,
                u_home_x:  0,
                u_company_y:  0,
                u_company_x:  0,
                u_visit_cities: ['', '']
            };
        },

        componentWillReceiveProps(nextProps) {

            this.setState({
                u_diu: nextProps.u_diu,
                u_permanent_adcode: nextProps.u_permanent_adcode,
                u_permanent_city: nextProps.u_permanent_city,
                u_permanent_y: Number.parseFloat(nextProps.u_permanent_y) || 0,
                u_permanent_x: Number.parseFloat(nextProps.u_permanent_x) || 0,
                u_home_adcode: nextProps.u_home_adcode,
                u_home_city: nextProps.u_home_city,
                u_home_y: Number.parseFloat(nextProps.u_home_y) || 0,
                u_home_x: Number.parseFloat(nextProps.u_home_x) || 0,
                u_company_adcode: nextProps.u_company_adcode,
                u_company_city: nextProps.u_company_city,
                u_company_y: Number.parseFloat(nextProps.u_company_y) || 0,
                u_company_x: Number.parseFloat(nextProps.u_company_x) || 0,
                u_areas_actives: nextProps.u_areas_actives,
                u_permanent_adcodes: (()=>{
                    let adcodes = nextProps.u_permanent_adcodes;
                    if (adcodes) {

                        let arr = adcodes.split(';').sort((a, b) => a.split(':')[1] < b.split(':')[1]);
                        let adArr = arr.filter(val => {
                            let m = val.split(':')[0];
                            //if (nextProps.u_home_adcode == m || nextProps.u_company_adcode == m || !Adcodes[m]) { //过滤未翻译的adcode
                            if (nextProps.u_home_adcode == m || nextProps.u_company_adcode == m ) { // 不过滤未翻译的adcode
                                return false;
                            } else {
                                return true;
                            }
                        }).map(val => Adcodes[val.split(':')[0]] ? Adcodes[val.split(':')[0]].adname : val.split(':')[0]);
                        if (adArr.length == 0) {
                            adArr = undefined;
                        }
                        return adArr
                    } else {
                        return undefined;
                    }

                })(),
                u_access_cities: nextProps.u_access_cities || 0,
                u_navi_autos: nextProps.u_navi_autos,
                u_navi_firsttime: nextProps.u_navi_firsttime,
                u_navi_lasttime: nextProps.u_navi_lasttime,
                u_navi_weeks: nextProps.u_navi_weeks,
                u_navi_days: nextProps.u_navi_days,
                u_navi_duration: nextProps.u_navi_duration,
                u_navi_duration_max: nextProps.u_navi_duration_max,
                u_navi_distance: Number.parseFloat((nextProps.u_navi_distance ? nextProps.u_navi_distance : 0.0)/1000).toFixed(2),
                u_navi_distance_max: nextProps.u_navi_distance_max,
                u_navi_speed_avg: Number.parseFloat((nextProps.u_navi_speed_avg ? nextProps.u_navi_speed_avg: 0)).toFixed(2),
                u_navi_speed_max: nextProps.u_navi_speed_max,
                u_navi_coords: nextProps.u_navi_coords,
                u_navi_geohashs: nextProps.u_navi_geohashs,
                u_navi_drifts: nextProps.u_navi_drifts,
                u_navi_drifts_max: nextProps.u_navi_drifts_max,
                u_navi_drifts_min: nextProps.u_navi_drifts_min,
                u_navi_servpv: nextProps.u_navi_servpv,
                u_navi_apspv: nextProps.u_navi_apspv,
                u_navi_rttpv: nextProps.u_navi_rttpv,
                u_navi_trafficpv: nextProps.u_navi_trafficpv,
                u_navi_vmappv: nextProps.u_navi_vmappv,
                u_navi_rgeopv: nextProps.u_navi_rgeopv,
                u_travel_drive: nextProps.u_travel_drive,
                u_travel_bus: nextProps.u_travel_bus,
                u_travel_others: nextProps.u_travel_others,

                u_visit_cities: (() => {
                    if (nextProps.u_visit_cities) {
                        let cities = nextProps.u_visit_cities;

                        let adcodeArrObj = cities.split(',').map(val => Adcodes[val]);
                        adcodeArrObj = adcodeArrObj.filter(val => val);
                        let names = adcodeArrObj.map(val => val.adname).join(',');
                        let coordinaes = adcodeArrObj.map(val => val.coordinate).join(';')

                        return [names, coordinaes];
                    } else {
                        return [undefined, undefined];
                    }

                })()
            });
        },

        render() {
            let actOthers = undefined;

            if (this.state.u_permanent_adcodes) {
                actOthers = this.state.u_permanent_adcodes.map((val,i) => <span className="label-act-city" key={i}>{val}</span>)
            }

            return (
                <div>
                    <div id="gd-location" className="panel panel-default figure-type habit">
                        <div className="panel-heading">
                            <h4>人地关系</h4>
                        </div>
                        <div className="panel-body">

                            <div style={{margin: 'auto', width: '80%'}}>
                                <div className="row">
                                    <div className="home-company">
                                        <div style={{flex: 2}}>

                                            <MapBgStatic deferredH={datautils.getGD(this.state.u_home_x, this.state.u_home_y)}
                                                         deferredC={datautils.getGD(this.state.u_company_x, this.state.u_company_y)}
                                                diu={this.state.u_diu}>
                                            </MapBgStatic>
                                            <dl className="dl-horizontal">

                                                <dt style={{color: '#ff7f0e'}}>家:</dt>
                                                <dd>
                                                    <AnsyncSpan
                                                        deferred={datautils.getGD(this.state.u_home_x, this.state.u_home_y)}
                                                        key={new Date().getTime()+Math.random()}></AnsyncSpan>
                                                </dd>

                                                <dt style={{color: '#1f77b4'}}>公司:</dt>
                                                <dd>
                                                    <AnsyncSpan
                                                        deferred={datautils.getGD(this.state.u_company_x, this.state.u_company_y)}
                                                        key={new Date().getTime()+Math.random()}></AnsyncSpan>
                                                </dd>
                                            </dl>
                                        </div>
                                        <div className="bt-span">
                                            <div style={{flex: 1}}>
                                                <dl>
                                                <dt>工作城市:</dt>
                                                <dd><span className="label-act-city">{this.props.u_company_city ? this.props.u_company_city : '[无]'}</span></dd>
                                                </dl>
                                            </div>
                                            <div style={{flex: 1}}>
                                                <dl>
                                                <dt>居住城市:</dt>
                                                <dd><span className="label-act-city">{this.props.u_home_city ? this.props.u_home_city : '[无]'}</span></dd>
                                                </dl>
                                            </div>
                                            <div style={{flex: 1}}>
                                                <dl>
                                                <dt>其他常活跃城市:</dt>
                                                <dd>{actOthers ? actOthers : '[无]'}</dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="animate subject-link">
                            <a className="animate"
                               href={location.origin + '/dshow-web/web/m/amap/user/homecompany?diu=' + this.state.u_diu}
                               title="家和公司"><i className="fa fa-arrow-right"></i></a>
                        </div>
                    </div>

                    <div id="gd-footprint" className="panel panel-default figure-type">
                        <div className="panel-heading">
                            <h4>我的脚印</h4>
                        </div>
                        <div className="panel-body">

                            <div style={{margin: 'auto', width: '80%'}}>
                                <div className="row">
                                    <div style={{display:"flex",flexDirection:"column",flex:1}} className="dl-print">
                                        <dl className="dl-horizontal">

                                            <dt>导航总里程:</dt>
                                            <dd>{this.state.u_navi_distance} km</dd>

                                            <dt>平均速度:</dt>
                                            <dd>{this.state.u_navi_speed_avg} km/h</dd>

                                        </dl>

                                    </div>
                                </div>

                                <div className="row act-container">
                                    <h5>常去地点:</h5>
                                    <ActiveArea area={this.state.u_areas_actives} diu={this.state.u_diu}/>
                                </div>

                                <div className="row act-container">
                                    <h5 className="cover">走过 <span className="value">{this.state.u_access_cities}</span> 个城市:</h5>
                                    <VisitArea names={this.state.u_visit_cities[0]} area={this.state.u_visit_cities[1]}></VisitArea>
                                </div>


                            </div>
                        </div>
                        <div className="animate subject-link track-link">
                            <a className="animate "
                               href={location.origin + '/dshow-web/web/m/report/track/index?diu=' + this.state.u_diu}
                               title="用户轨迹"><i className="fa fa-arrow-right"></i></a>
                        </div>
                        <div className="animate subject-link act-link">
                            <a className="animate "
                               href={location.origin + '/dshow-web/web/m/amap/user/permanentsite?diu=' + this.state.u_diu}
                               title="活跃区域"><i className="fa fa-arrow-right"></i></a>
                        </div>
                    </div>
                </div>
            );
        }
    });
    return PeopleGround
})
