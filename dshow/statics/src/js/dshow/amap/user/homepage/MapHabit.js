define(['react', 'react-dom', 'd3', 'd3cloud'], function (React, ReactDom, d3, d3cloud) {
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

    var Tspan = React.createClass({

        getInitialState() {
            return {
                name: ''
            };
        },
        componentDidMount() {
            this.props.promise.then(
                    value => {
                    if (value.pois.length) {
                        this.setState({
                            name: value.pois[0].name,
                            type: value.pois[0].type
                        });
                    }

                },
                    error => {}
            );
        },
        render() {
            return (
                <text textAnchor={this.props.textAnchor} transform={this.props.transform} style={this.props.style} key={new Date().getTime()}>{this.state.name}</text>
            );
        }
    });

    var Cloud = React.createClass({

        getDefaultProps() {
            return {
                fill: d3.scale.category20()
            }
        },

        getInitialState() {
            return {
                words: []
            }
        },

        componentWillReceiveProps(nextProps) {

            var that = this;

            if (nextProps.words) {
                var layout = d3cloud()
                    .size([300, 100])
                    .words(nextProps.words)
                    .padding(2)
                    .rotate(0)
                    .font("Impact")
                    .fontSize(function(d) { return d.size; })
                    .on("end", draw);

                layout.start();

                function draw(words) {
                    //console.log(words);
                    that.setState({
                        words: words
                    });

                }

            }
        },

        componentWillMount() {

        },
        componentDidMount() {

        },

        render() {

            return (
                <svg width={this.props.size[0]} height={this.props.size[1]}>
                    <g transform={"translate(" + this.props.size[0]/2 +"," + this.props.size[1]/2 + ")"}>
                        {this.state.words.map((word, index) => {
                            return <text textAnchor="middle" transform={"translate(" + word.x + "," + word.y +")rotate(" + word.rotate +")"} style={{fontSize:word.size+"px", fontFamily: word.font, fill: this.props.fill(index)}} key={index}>{word.text}</text>;
                        })}
                    </g>
                </svg>
            );
        }
    });


    var LiBang = React.createClass({

        getInitialState() {
            return {};
        },
        componentDidMount() {
            var poi = this.props.poi;
            this.props.promise.then(
                value => {
                    if (value.pois.length) {
                        this.setState({
                            name: value.pois[0].name,
                            type: value.pois[0].type
                        });
                    } else {
                        this.setState({
                            name: (<span className="unknown-place">这个地点好像不存在了-{poi}</span>)
                        });
                    }

                },
                error => {
                    this.setState({
                        name: (<span className="unknown-place">[查询出错]-{poi}</span>)
                    });
                }
            );
        },
        render() {
            return (
            <tr>
                <td><span className={"label " + (this.props.index < 3 ? "label-danger": "label-info")}>{this.props.index+1}</span></td>
                <td dataPoi={this.props.poi}>{this.state.name}</td>
                <td>{this.props.size}</td>
            </tr>
            );
        }
    });

    var MapHabit = React.createClass({

        splitCat(pois) {

            if (!pois) {
                return null;
            }

            let poiArray = pois.split('|').map(function(item, index) {
                let one = item.split(':');

                return (<LiBang poi={one[0]} promise={$.getJSON('/restpoi?id=' + one[0])} size={one[1]} index={index} key={new Date().getTime()+Math.random()}></LiBang>);

            });
            return poiArray;
        },



        getInitialState() {
            return {
                u_app_rate_search: 0.00
            };
        },

        serveRate(given) {
            return given / (this.state.u_app_rate_search+this.state.u_app_rate_auto+this.state.u_app_rate_bus+this.state.u_app_rate_foot);
        },

        componentDidMount() {


        },

        componentWillReceiveProps(nextProps) {

            this.setState({


                u_app_category_all: nextProps.u_app_category_all,
                u_app_category_auto: nextProps.u_app_category_auto,
                u_app_category_bus: nextProps.u_app_category_bus,
                u_app_category_favor: nextProps.u_app_category_favor,
                u_app_category_foot: nextProps.u_app_category_foot,
                u_app_category_search: nextProps.u_app_category_search,
                u_app_duration: nextProps.u_app_duration,
                u_app_duration_day: nextProps.u_app_duration_day,
                u_app_duration_month: nextProps.u_app_duration_month,
                u_app_duration_week: nextProps.u_app_duration_week,
                u_app_freq_aps: nextProps.u_app_freq_aps,
                u_app_freq_rgeo: nextProps.u_app_freq_rgeo,
                u_app_freq_rtt: nextProps.u_app_freq_rtt,
                u_app_freq_traffic: nextProps.u_app_freq_traffic,
                u_app_freq_vmap: nextProps.u_app_freq_vmap,
                u_app_poi_all: nextProps.u_app_poi_all,
                u_app_poi_auto: nextProps.u_app_poi_auto,
                u_app_poi_bus: nextProps.u_app_poi_bus,
                u_app_poi_favor: nextProps.u_app_poi_favor,
                u_app_poi_foot: nextProps.u_app_poi_foot,
                u_app_poi_search: nextProps.u_app_poi_search,
                u_app_rate_auto: Number.parseFloat(nextProps.u_app_rate_auto),
                u_app_rate_bus: Number.parseFloat(nextProps.u_app_rate_bus),
                u_app_rate_foot: Number.parseFloat(nextProps.u_app_rate_foot),
                u_app_rate_others: Number.parseFloat(nextProps.u_app_rate_others),
                u_app_rate_search: Number.parseFloat(nextProps.u_app_rate_search),
                u_app_servpv: nextProps.u_app_servpv,
                u_app_starts: nextProps.u_app_starts,
                u_app_startups: nextProps.u_app_startups,
                u_app_stepids: nextProps.u_app_stepids,
                u_app_swithcitys: nextProps.u_app_swithcitys,

                poiAll: this.splitCat(nextProps.u_app_poi_all),
                searchPoi: this.splitCat(nextProps.u_app_poi_search),
            });

            var that = this;
            setTimeout(function() {
                // 没有办法，因为[Cloud props ]componentWillReceiveProps方法初始props不触发，只能设置两次，强制触发。
                that.setState({
                    poiCatAll: [],
                    searchCat: [],
                });
                that.setState({
                    poiCatAll: nextProps.u_app_category_all && nextProps.u_app_category_all.split('|').map(function(element) {
                        var pair = element.split(':');
                        return {text: pair[0], size: Number.parseInt(pair[1]) + 15};
                    }),
                    searchCat: nextProps.u_app_category_search && nextProps.u_app_category_search.split('|').map(function(element) {
                        var pair = element.split(':');
                        return {text: pair[0], size: Number.parseInt(pair[1]) + 15};
                    }),
                });
            }, 0);

        },

        render() {
            return (
                <div>
                <div id="gd-habit" className="panel panel-default figure-type habit" key="gd-habit">
                    <div className="panel-heading">
                        <h4>地图习惯</h4>
                    </div>
                    <div className="panel-body">

                        <div style={{margin: 'auto', width: '80%'}}>

                            <div className="row bang-container">
                                <h5>我的地点:</h5>
                                <table className="table table-condensed">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>POI</th>
                                        <th>访问量</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {this.state.poiAll}
                                    </tbody>
                                </table>

                            </div>
                            <If test={this.state.poiCatAll}>
                                <div className="row bang-container">
                                    <h5>地点类目:</h5>
                                    <div>
                                        <Cloud size={[300, 200]} words={this.state.poiCatAll}></Cloud>
                                    </div>
                                </div>
                            </If>

                            <If test={this.state.u_app_rate_search}>
                            <div className="row app-rate">
                                <h5>主要服务使用占比:</h5>
                                <div className="serve-rate">
                                    <If test={this.state.u_app_rate_search != 0}>
                                        <span style={{width:(this.serveRate(this.state.u_app_rate_search)*100)+'%',backgroundColor:'#e6550d'}}>搜索</span>
                                    </If>
                                    <If test={this.state.u_app_rate_auto != 0}>
                                        <span style={{width:(this.serveRate(this.state.u_app_rate_auto)*100)+'%', backgroundColor: '#3182bd'}}>驾车</span>
                                    </If>
                                    <If test={this.state.u_app_rate_bus != 0}>
                                        <span style={{width:(this.serveRate(this.state.u_app_rate_bus) *100)+'%', backgroundColor: '#31a354'}}>公交</span>
                                    </If>
                                    <If test={this.state.u_app_rate_foot != 0}>
                                        <span style={{width:(this.serveRate(this.state.u_app_rate_foot)*100)+'%', backgroundColor: '#756bb1'}}>步行</span>
                                    </If>
                                </div>
                                <div className="serve-rate-display">
                                    <If test={this.state.u_app_rate_search != 0}>
                                        <div className="display-cell">
                                            <span className="color-block" style={{backgroundColor:'#e6550d'}}></span>
                                            <span className="rate-name">搜索:</span>
                                            <span className="rate-value">{(this.serveRate(this.state.u_app_rate_search)*100).toFixed(2)}%</span>
                                        </div>
                                    </If>
                                    <If test={this.state.u_app_rate_auto != 0}>
                                        <div className="display-cell">
                                            <span className="color-block" style={{backgroundColor:'#3182bd'}}></span>
                                            <span className="rate-name">驾车:</span>
                                            <span className="rate-value">{(this.serveRate(this.state.u_app_rate_auto)*100).toFixed(2)}%</span>
                                        </div>
                                    </If>
                                    <If test={this.state.u_app_rate_bus != 0}>
                                        <div className="display-cell">
                                            <span className="color-block" style={{backgroundColor:'#31a354'}}></span>
                                            <span className="rate-name">公交:</span>
                                            <span className="rate-value">{(this.serveRate(this.state.u_app_rate_bus)*100).toFixed(2)}%</span>
                                        </div>
                                    </If>
                                    <If test={this.state.u_app_rate_foot != 0}>
                                        <div className="display-cell">
                                            <span className="color-block" style={{backgroundColor:'#756bb1'}}></span>
                                            <span className="rate-name">步行:</span>
                                            <span className="rate-value">{(this.serveRate(this.state.u_app_rate_foot)*100).toFixed(2)}%</span>
                                        </div>
                                    </If>
                                </div>
                            </div>
                            </If>

                        </div>
                    </div>
                </div>

                <div id="gd-searching" className="panel panel-default figure-type habit" key="gd-searching">
                    <div className="panel-heading">
                        <h4>搜索专题</h4>
                    </div>
                    <div className="panel-body">
                        <div style={{margin: 'auto', width: '80%'}}>

                            <div className="row bang-container">
                                    <h5>搜索最多的地点:</h5>
                                <table className="table table-condensed">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>POI</th>
                                        <th>访问量</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {this.state.searchPoi}
                                    </tbody>
                                </table>
                            </div>
                            <If test={this.state.searchCat}>
                                <div className="row bang-container">
                                    <h5>Top 搜索 类目:</h5>
                                    <div>
                                        <Cloud size={[300, 200]} words={this.state.searchCat}></Cloud>
                                    </div>
                                </div>
                            </If>
                            <div className="search-stat">
                                <label>搜索功能使用占比:</label> <span className="stat-value">{((this.state.u_app_rate_search ? this.state.u_app_rate_search : 0.00)*100).toFixed(2)}%</span>

                            </div>
                        </div>
                    </div>
                </div>
                </div>
            );
        }
    })
    return MapHabit
})