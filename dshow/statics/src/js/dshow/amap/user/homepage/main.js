var currentFileDir = document.scripts[document.scripts.length - 1].src.replace(/[^\/]+\.js.*/, "");
var restUrl = 'http://restapi.amap.com/v3/place/detail?key=d5e3debf995837bd41ac3fa0df9b2aca&id=';

require(
    ['datautils', 'react', 'react-dom',
        `${currentFileDir}/Basic.js`,
        `${currentFileDir}/MapHabit.js`,
        `${currentFileDir}/Travel.js`,
        `${currentFileDir}/PeopleGround.js`,
        `${currentFileDir}/MyGD.js`,
        `${currentFileDir}/MyFootprint.js`,
        'md5',
        'd3',
        'dataloader',
        'datasource'
    ],
    function (datautils, React, ReactDom, Basic, MapHabit, Travel, PeopleGround, MyGD, MyFootprint, md5, d3, dataloader, datasource) {
        var UserHomePage = React.createClass({

            getInitialState() {

                return {
                    loading: false,
                    userProfile: {
                        u_diu: ''
                    }
                }
            },

            componentWillMount() {

            },


            componentDidMount() {

                datautils.getUserInfoAsync().then(data => {

                    this.refs.userDiu.value = data['result'].udid; // 手动修改inut value
                    //console.log(data['result'].udid, md5.hex_md5(data['result'].udid));
                    this.loadProfile(data['result'].udid);

                });

                var position = $("#side-menu").offset().top;

                $(window).scroll(function(){
                    var $sideMenu = $("#side-menu");
                    if($(window).scrollTop() >= position){
                        if ($sideMenu.css('position') != 'fixed') {
                            $sideMenu.css('position','fixed').css('top','0');
                        }
                        $('.to-top').css('opacity', 1).css('visibility', 'visible');
                    } else {
                        if ($sideMenu.css('position') != 'static') {
                            $sideMenu.css('position','static');
                        }
                        $('.to-top').css('opacity', 0).css('visibility', 'hidden');
                    }


                });
            },

            handleChange: function(evt) {
                this.setState({
                    u_diu: evt.target.value
                });
            },

            resetDiu() {
                var diu = this.refs.userDiu.value.trim();
                if (diu) {
                    this.loadProfile(diu);
                }
            },

            loadProfile(diu) {
                var that = this;
                dataloader.get(md5.hex_md5(diu),
                    datasource.getSource('user_homepage'), {
                        source: 'home',
                        type: 'post'
                    }, function(data) {
                        //console.log(data[0][md5.hex_md5(diu)]);
                        that.setState({
                            userProfile: data.length == 0 ? {} : data[0][md5.hex_md5(diu)]
                        });
                    }
                );

            },

            jumpToSection(target) {
                $('html, body, .content').animate({scrollTop: $('#' + target).offset().top}, 200);
            },
            scrolToTop() {
                $('html, body, .content').animate({scrollTop: 0}, 300);
            },

            render() {
                return (
                    <div className="row" style={{display:"flex"}}>
                        <div className="col-xs-3 side">
                            <div className="panel-body">
                                <div className="col-md-12 input-group">
                                    <input type="text" className="form-control" placeholder="diu"
                                           style={{display:"table-cell"}} ref="userDiu"/>
                                    <span className="input-group-btn">
                                        <button className="btn btn-blue" type="button" onClick={this.resetDiu}>Search</button>
                                    </span>
                                </div>
                            </div>
                            <div className="panel-body">
                                <div className="side-menu" id="side-menu">
                                    <ul className="list-group">
                                        <li className="list-group-item gd-basic sliding-u-l-r-l" onClick={this.jumpToSection.bind(null, "gd-basic")}><span>基本属性</span></li>
                                        <li className="list-group-item gd-mygd sliding-u-l-r-l" onClick={this.jumpToSection.bind(null, "gd-mygd")}><span>我的高德</span></li>
                                        <li className="list-group-item gd-habit sliding-u-l-r-l" onClick={this.jumpToSection.bind(null, "gd-habit")}><span>地图习惯</span></li>
                                        <li className="list-group-item gd-searching sliding-u-l-r-l" onClick={this.jumpToSection.bind(null, "gd-searching")}><span>搜索专题</span></li>
                                        <li className="list-group-item gd-travel sliding-u-l-r-l" onClick={this.jumpToSection.bind(null, "gd-travel")}><span>出行偏好</span></li>
                                        <li className="list-group-item gd-location sliding-u-l-r-l" onClick={this.jumpToSection.bind(null, "gd-location")}><span>人地关系</span></li>
                                        <li className="list-group-item gd-footprint sliding-u-l-r-l" onClick={this.jumpToSection.bind(null, "gd-footprint")}><span>我的脚印</span></li>

                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-6 main" style={{minWidth:"600px",flex:3}}>
                            <Basic userProfile={this.state.userProfile}></Basic>
                            {React.createFactory(MyGD)(this.state.userProfile)}
                            {React.createFactory(MapHabit)(this.state.userProfile)}
                            <Travel userProfile={this.state.userProfile}></Travel>
                            {React.createFactory(PeopleGround)(this.state.userProfile)}
                        </div>

                        <div style={{flex:1}}></div>
                        <div className="animate to-top" onClick={this.scrolToTop}>
                            <a className="top fa fa-angle-double-up" ></a>
                        </div>
                    </div>
                )
            }
        });
        ReactDom.render(<UserHomePage />, document.querySelector('#react-root'))
    });
