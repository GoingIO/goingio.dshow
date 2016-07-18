define(['react', 'react-dom', 'd3',], function (React, ReactDom, d3) {

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

    var Pie = React.createClass({

        getDefaultProps() {
            return {
                width: 100,
                height: 100,
            }
        },

        componentWillReceiveProps(nextProps) {


        },

        componentDidMount() {
            let target = this.refs.pieChart;

            let radius = Math.min(this.props.width, this.props.height) / 2;

            let color = d3.scale.category10();

            let arc = d3.svg.arc().outerRadius(radius);

            let pie = d3.layout.pie();

            d3.select(target).selectAll('svg').remove();

            let svg = d3.select(target).append('svg')
                .attr("height", this.props.height)
                .attr("width", this.props.width)
                .append("g")
                .attr("transform", "translate(" + this.props.width / 2 + "," + this.props.height / 2 + ")");

            let data = this.props.values;

            let g = svg.selectAll('.arc')
                .data(pie(data))
                .enter().append('g')
                .attr('class', 'arc');

            g.append('path')
                .attr('d', arc)
                .style('fill', function(d, i) { return color(i); })
        },

        render() {
            return <span className="pie" ref="pieChart"></span>
        }
    });


    var MyGD = React.createClass({
        getInitialState() {
            return {

            };
        },

        caculateTimeLong(input) {
            var days = 0;
            var hours = 0;
            var mins = 0;
            if (input >= 86400) {
                days = Math.floor(input / 86400);
                input = input - days * 86400;
            }
            if (input >= 3600) {
                hours = Math.floor(input / 3600);
                input = input - hours * 60 * 60;
            }
            if (input >= 60) {
                mins = Math.floor(input / 60);
            }

            return (days > 0 ? days + '天' : '') + (hours > 0 ? hours + '小时' : '') + (mins > 0 ? mins + '分钟' : '') +
                ( (days == 0 && hours == 0 && mins == 0) ? parseInt(input) + '秒' : '');
        },

        componentWillReceiveProps(nextProps) {

            this.setState({
                u_amap_datetime_f: nextProps.u_amap_datetime_f,
                u_amap_datetime_l: nextProps.u_amap_datetime_l,
                u_amap_acttimes: nextProps.u_amap_acttimes,
                u_amap_adcode: nextProps.u_amap_adcode,
                u_amap_dic: nextProps.u_amap_dic,
                u_amap_div: nextProps.u_amap_div,
                u_amap_ismonthnewuser : nextProps.u_amap_ismonthnewuser ,
                u_amap_actgroup: nextProps.u_amap_actgroup,
                u_amap_notactdays: nextProps.u_amap_notactdays,
                u_amap_weekfreq: nextProps.u_amap_weekfreq,
                u_amap_actdays: nextProps.u_amap_actdays,
                u_amap_last30: nextProps.u_amap_last30,
                u_amap_crashs: nextProps.u_amap_crashs,

                u_manufacture: nextProps.u_manufacture,
                u_model_device: nextProps.u_model_device,
                u_platform: nextProps.u_platform,
                u_osversion: nextProps.u_osversion,
                u_resolution: nextProps.u_resolution,
                u_netop: nextProps.u_netop,

                u_app_wifis: Number.parseFloat(nextProps.u_app_wifis),
                u_app_2345gs: Number.parseFloat(nextProps.u_app_2345gs),

                u_app_actdays: nextProps.u_app_actdays,
                u_app_actdays_month: nextProps.u_app_actdays_month,
                u_app_actdays_week: nextProps.u_app_actdays_week,
                u_app_actradius: nextProps.u_app_actradius,

                u_app_starts: nextProps.u_app_starts,
                u_app_duration: nextProps.u_app_duration,

                u_navi_autos: nextProps.u_navi_autos,
                u_navi_firsttime: nextProps.u_navi_firsttime,
                u_navi_lasttime: nextProps.u_navi_lasttime,
                u_navi_weeks: nextProps.u_navi_weeks,
                u_navi_days: nextProps.u_navi_days,

                u_ali_housecar: nextProps.u_ali_housecar,
                u_ali_huahui: nextProps.u_ali_huahui,
                u_ali_tongxin: nextProps.u_ali_tongxin,
                u_ali_huihua: nextProps.u_ali_huihua,
                u_ali_shoucang: nextProps.u_ali_shoucang,
                u_ali_pengren: nextProps.u_ali_pengren,
                u_ali_meili: nextProps.u_ali_meili,
                u_ali_shishang: nextProps.u_ali_shishang,
                u_ali_shuma: nextProps.u_ali_shuma,
                u_ali_ernv: nextProps.u_ali_ernv,
                u_ali_yundong: nextProps.u_ali_yundong,
                u_ali_cheyou: nextProps.u_ali_cheyou,
                u_ali_aijia: nextProps.u_ali_aijia,
                u_ali_zhufu: nextProps.u_ali_zhufu,
                u_ali_xie: nextProps.u_ali_xie,
                u_ali_bao: nextProps.u_ali_bao,
                u_ali_baifumei: nextProps.u_ali_baifumei,
                u_ali_gaofusuai: nextProps.u_ali_gaofusuai,
                u_ali_chihuo: nextProps.u_ali_chihuo,
                u_ali_jiashi: nextProps.u_ali_jiashi,
                u_ali_chongwu: nextProps.u_ali_chongwu,
                u_ali_sheying: nextProps.u_ali_sheying,
                u_ali_huwai: nextProps.u_ali_huwai,
                u_ali_guofen: nextProps.u_ali_guofen,
                u_ali_jianmei: nextProps.u_ali_jianmei,
                u_ali_qingqu: nextProps.u_ali_qingqu
            })
        },

        render() {
            return (
                <div id="gd-mygd" className="panel panel-default figure-type mygd">
                    <div className="panel-heading">
                        <h4>我的高德</h4>
                    </div>
                    <div className="panel-body">

                        <div style={{margin: 'auto', width: '80%'}}>
                            <If test={this.state.u_amap_actgroup}>
                            <m>您是高德地图的<span className="bigger sp-act-days">{this.state.u_amap_actgroup}</span></m>
                            </If>

                            <If test={this.state.u_app_actdays}>
                                <div className="habit-summary">
                                    <p>最近一个月活跃了<span className="bigger sp-act-days">{this.state.u_amap_last30}天</span>，
                                        近三个月活跃<span className="bigger sp-act-days">{Number.parseInt(this.state.u_app_actdays)}天</span>，
                                        总共使用了高德地图<span className="bigger sp-starts">{Number.parseInt(this.state.u_app_starts)}次</span>，
                                        平均每次使用<span className="bigger use-time">{this.caculateTimeLong(this.state.u_app_duration)}</span>。</p>
                                    <If test={this.state.u_navi_days}>
                                        <div style={{marginTop: '15px'}}>
                                            <p>其中导航<span className="bigger">{Number.parseInt(this.state.u_navi_days)}天</span>，驾车导航<span className="bigger">{Number.parseInt(this.state.u_navi_autos)}次</span>。</p>
                                            <p>一天中最早的导航时间<span className="bigger">{this.state.u_navi_firsttime}</span>，最晚的导航时间<span className="bigger">{this.state.u_navi_lasttime}</span>。</p>
                                            <p>您当前的客户端版本是<span className="bigger">{this.state.u_amap_div}</span>，最后一次使用高德地图是在<span className="bigger" data-toggle="tooltip" data-original-title={'第一次使用是' + this.state.u_amap_datetime_f}>{this.state.u_amap_datetime_l}</span>。</p>
                                        </div>
                                    </If>

                                </div>
                            </If>

                            <If test={this.state.u_app_wifis > 0 && this.state.u_app_wifis < 1}>
                                <div className="row network">
                                    <h5>网络环境:</h5>
                                    <div className="network-stat">
                                        <div className="display-cell left">
                                            <span className="rate-name">移动网络:</span>
                                            <span className="rate-value">{(this.state.u_app_2345gs*100).toFixed(2)}%</span>
                                            <span className="color-block" style={{backgroundColor:'#1f77b4'}}></span>
                                        </div>
                                        <div>
                                            <Pie width="30" height="30" values={[this.state.u_app_2345gs, this.state.u_app_wifis]}></Pie>
                                        </div>
                                        <div className="display-cell right">
                                            <span className="color-block" style={{backgroundColor:'#ff7f0e'}}></span>
                                            <span className="rate-name">WIFI网络:</span>
                                            <span className="rate-value">{(this.state.u_app_wifis*100).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </If>
                        </div>
                    </div>
                </div>
            )
        }
    })
    return MyGD
})