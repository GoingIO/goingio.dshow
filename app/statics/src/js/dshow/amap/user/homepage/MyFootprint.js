define(['react', 'react-dom'], function (React, ReactDom) {
    var MyFootPrint = React.createClass({
        render() {
            return (
                <div className="panel panel-default figure-type">
                    <div className="panel-body">
                        <div className="row figure-type-body">
                            <div className="icon">
                                <img src="/dshow-web/statics/images/themes/xenon/user-1.png"/>
                                <br />
                                <span className="type-name">我的脚印</span>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",flex:1}}>
                                <div style={{display:"flex"}}>
                                    <div>
                                        <span className="badge">1</span>
                                    </div>
                                    <div>
                                        <label>轨迹</label>
                                    </div>
                                    <div style={{flex:1,paddingTop:"10px"}}>
                                        <div><label>总里程</label><span>616公里</span></div>
                                        <div><label>总时间</label><span>5小时10分钟</span></div>
                                        <div><label>平均时速</label><span>5公里/小时</span></div>
                                    </div>
                                    <div>
                                        <a>查看更多</a>
                                    </div>
                                </div>
                                <div style={{display:"flex"}}>
                                    <div>
                                        <span className="badge">2</span>
                                    </div>
                                    <div>
                                        <label>足迹</label>
                                    </div>
                                    <div style={{flex:1,paddingTop:"10px"}}>
                                        <div><label>走过</label><span>16个城市</span></div>
                                        <div><label>横跨</label><span>2个省</span></div>
                                    </div>
                                    <div>
                                        <a>查看更多</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    })
    return MyFootPrint
})
