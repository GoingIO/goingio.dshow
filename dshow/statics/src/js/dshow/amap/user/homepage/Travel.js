/**
 * Created by telen on 15/12/8.
 */
define(['react', 'dataloader', 'd3'], function(React, dataloader, d3) {

    let Travel = React.createClass({

        detectTag(value, tagName) {
            if(value != '0' && !!value) {
                if (tagName) {
                    return tagName;
                } else {
                    return value;
                }
            }
        },

        getDefaultProps() {
            return {
                fill: d3.scale.category10()
            }
        },

        getInitialState() {
            return {
                notBusDays: undefined,
                busDays: undefined,
            }
        },

        componentWillReceiveProps(nextProps) {

            this.setState({

                u_travel_drive: this.detectTag(nextProps.userProfile.u_travel_drive, '驾车一族'),
                u_travel_bus: this.detectTag(Number.parseFloat(nextProps.userProfile.u_travel_bus), '公交一族'),
                //u_travel_others: this.detectTag(nextProps.u_travel_others, '其他方式出行'),
            });

            let that = this;
            let adidKey = nextProps.userProfile.u_adid;
            dataloader.get(adidKey, '/s_amap_dm_user_trip_mode', {
                source: "home",
                type: "post",
                params: { }
            }).then(function (res) {
                if (res.result && res.result.length) {
                    let preference = res.result[0][adidKey];
                    preference.u_not_bus_days = getDays((+preference.u_auto_score + +preference.u_passenger_score) * 3);
                    preference.u_bus_days = getDays(+preference.u_bus_score * 3);

                    that.setState({
                        notBusDays: preference.u_not_bus_days,
                        busDays: preference.u_bus_days
                    });

                } else {
                    //TODO no result
                    that.setState({
                        notBusDays: undefined,
                        busDays: undefined
                    });
                }
            });

            function getDays(score) {
                var days = Math.round(score * 7)
                if (days > 7) {
                    days = 7
                }
                return days
            }
        },

        render() {

            let a, b, c;
            if (this.state.notBusDays) {
                a = <p>您平均每周乘坐非公共交通 <span className="bigger">{this.state.notBusDays}天</span> 左右</p>;
            }
            if (this.state.busDays) {
                b = <p>您平均每周乘坐公共交通 <span className="bigger">{this.state.busDays}天</span> 左右</p>;
            }
            if (!a && !b) {
                c = <p>没有出行偏好，是不是高德地图用的有点少啊~</p>;
            }

            let tags = [];
            for (let a in this.state) {


                if (a != 'notBusDays' && a != 'busDays' && this.state[a]) {
                    var inlineStyle = {
                        fontSize: '30px',
                        padding: _.random(5, 10) + 'px',
                        fontWeight: 'bold',
                        color: this.props.fill(tags.length)
                    };
                    tags.push(<span style={inlineStyle} key={tags.length}>{this.state[a]}</span>);
                }
            }

            return <div id="gd-travel" className="panel panel-default figure-type travel">
                <div className="panel-heading">
                    <h4>出行偏好</h4>
                </div>
                <div className="panel-body">
                    <div className="tag-cloud" style={{ width:'50%'}}>
                        {tags}
                    </div>
                    <div>
                        {a}
                        {b}
                        {c}
                    </div>
                </div>
            </div>;
        }
    });

    return Travel;
});