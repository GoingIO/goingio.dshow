define(['react', 'react-dom', 'underscore', 'd3', 'd3cloud'], function (React, ReactDom, _, d3, d3cloud) {

    var Basic = React.createClass({

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
            };
        },

        componentWillUpdate(nextProps, nextState) {

        },

        componentWillReceiveProps(nextProps) {

            this.setState({
                u_gender: this.detectTag(function(){return nextProps.userProfile.u_gender==1?'男':(nextProps.userProfile.u_gender==2?'女':'');}()),
                u_decade: this.detectTag(nextProps.userProfile.u_decade),
                u_zodiac: this.detectTag(nextProps.userProfile.u_zodiac),
                u_constellation: this.detectTag(nextProps.userProfile.u_constellation),
                u_college_online: this.detectTag(nextProps.userProfile.u_college_online, '在校大学生'),
                u_education: this.detectTag(nextProps.userProfile.u_education),

                u_ali_housecar: this.detectTag(nextProps.userProfile.u_ali_housecar, '有房有车'),
                u_ali_huahui: this.detectTag(nextProps.userProfile.u_ali_huahui, '花卉一族'),
                u_ali_tongxin: this.detectTag(nextProps.userProfile.u_ali_tongxin, '童心未泯'),
                u_ali_huihua: this.detectTag(nextProps.userProfile.u_ali_huihua, '绘画家'),
                u_ali_shoucang: this.detectTag(nextProps.userProfile.u_ali_shoucang, '收藏家'),
                u_ali_pengren: this.detectTag(nextProps.userProfile.u_ali_pengren, '烹饪达人'),
                u_ali_meili: this.detectTag(nextProps.userProfile.u_ali_meili, '美丽教主'),
                u_ali_shishang: this.detectTag(nextProps.userProfile.u_ali_shishang, '时尚达人'),
                u_ali_shuma: this.detectTag(nextProps.userProfile.u_ali_shuma, '数码达人'),
                u_ali_ernv: this.detectTag(nextProps.userProfile.u_ali_ernv, '家有儿女'),
                u_ali_yundong: this.detectTag(nextProps.userProfile.u_ali_yundong, '运动一族'),
                u_ali_cheyou: this.detectTag(nextProps.userProfile.u_ali_cheyou, '车友派'),
                u_ali_aijia: this.detectTag(nextProps.userProfile.u_ali_aijia, '爱家人士'),
                u_ali_zhufu: this.detectTag(nextProps.userProfile.u_ali_zhufu, '家庭主妇'),
                u_ali_xie: this.detectTag(nextProps.userProfile.u_ali_xie, '买鞋控'),
                u_ali_bao: this.detectTag(nextProps.userProfile.u_ali_bao, '爱包人'),
                u_ali_baifumei: this.detectTag(nextProps.userProfile.u_ali_baifumei, '白富美'),
                u_ali_gaofusuai: this.detectTag(nextProps.userProfile.u_ali_gaofusuai, '高帅富'),
                u_ali_chihuo: this.detectTag(nextProps.userProfile.u_ali_chihuo, '吃货一族'),
                u_ali_jiashi: this.detectTag(nextProps.userProfile.u_ali_jiashi, '有家有室'),
                u_ali_chongwu: this.detectTag(nextProps.userProfile.u_ali_chongwu, '宠物一族'),
                u_ali_sheying: this.detectTag(nextProps.userProfile.u_ali_sheying, '摄影一族'),
                u_ali_huwai: this.detectTag(nextProps.userProfile.u_ali_huwai, '户外一族'),
                u_ali_guofen: this.detectTag(nextProps.userProfile.u_ali_guofen, '果粉一族'),
                u_ali_jianmei: this.detectTag(nextProps.userProfile.u_ali_jianmei, '健美一族'),
                u_ali_qingqu: this.detectTag(nextProps.userProfile.u_ali_qingqu, '情趣一族'),

            });
        },

        render() {
            let tags = [];
            for (let a in this.state) {

                if (this.state[a]) {
                    var inlineStyle = {
                        fontSize: '30px',
                        padding: _.random(5, 10) + 'px',
                        fontWeight: 'bold',
                        color: this.props.fill(tags.length)
                    };
                    tags.push(<span style={inlineStyle} key={tags.length}>{this.state[a]}</span>);
                }
            }
            return (
                <div id="gd-basic" className="panel panel-default figure-type">
                    <div className="panel-heading">
                        <h4>基本属性</h4>
                    </div>
                    <div className="panel-body">
                        <div className="row">

                            <div className=" " style={{display: 'flex'}}>
                                <div className="tag-cloud" style={{margin: 'auto', width:'50%'}}>
                                    {tags}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });
    return Basic;
});