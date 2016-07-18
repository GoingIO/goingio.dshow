require(['dataloader', 'toastr', 'datautils', 'datasource', 'md5', 'utils', 'opacitynumbermap', 'promise-util', 'dateutil', "directives", "services"],
    function (dataloader, toastr, datautils, datasource, md5, utils, OpacityNumberMap, promiseUtil, DateUtil) {
        promiseUtil.promisifyAll(AMap)
        promiseUtil.errorAsRejected()
        var map = window._map = new AMap.Map('mapContainer', {
            resizeEnable: true,
            rotateEnable: true,
            dragEnable: true,
            zoomEnable: true,
            view: new AMap.View2D({
                center: new AMap.LngLat(116.397428, 39.90923),
                zoom: 12
            })
        })
        map.plugin(["AMap.ToolBar"], function () {
            var tool = new AMap.ToolBar()
            map.addControl(tool)
        })
        var app = angular.module("app", ["directives", "services"])
        app.controller("appCtrl", ["$scope", "$compile", "$filter", "applyService", function ($scope, $compile, $filter, applyService) {
            applyService.wrapApply()
            dataloader.ajaxFailHint()
            var home = $scope.home = {
                'old': {
                    x: 116.346416,
                    y: 40.081944
                },
                'new': {
                    x: 116.346416,
                    y: 40.081944
                }
            }
            home.distance = utils.decimal(utils.spherical_distance([home.old.x, home.old.y], [home['new'].x, home['new'].y]), 3)
            var company = $scope.company = {
                'old': {
                    x: 116.336416,
                    y: 40.082944
                },
                'new': {
                    x: 116.342116,
                    y: 40.083944
                }
            }
            company.distance = utils.decimal(utils.spherical_distance([company.old.x, company.old.y], [company['new'].x, company['new'].y]), 3)
            /**
             * 根据obj.x和obj.y进行坐标转换，逆地理编码，并且将获得后的信息设置为obj的属性
             * 会为obj设如下属性
             * obj.gdx,obj.gdy,obj.regeocode
             * @param obj
             * @param obj.x
             * @param obj.y
             */
            function loadPointInfo(obj) {
                return datautils.getGD(obj.x, obj.y).then(function (x, y) {
                    obj.gdx = x
                    obj.gdy = y
                    return AMap.serviceAsync(["AMap.Geocoder"])
                }).then(function () {
                    var MGeocoder = new AMap.Geocoder({
                        radius: 100,
                        extensions: "all"
                    })
                    promiseUtil.promisifyAll(MGeocoder)
                    return MGeocoder.getAddressAsync(new AMap.LngLat(obj.gdx, obj.gdy))
                }).then(function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        obj.regeocode = result.regeocode
                    } else {
                        toastr.warning(obj.gdy + "," + obj.gdx + " 逆地理编码加载失败,请尝试重新加载")
                    }
                })
            }

            $scope.viewMarker = function (marker) {
                map.panTo(marker.getPosition())
            }
            /**
             * 加载家、公司、或者常住地消息
             * @param obj 为$scope.home、$scope.company、$scope.permanent
             */
            function loadInfo(obj) {
                if (obj.distance === 0) {
                    return loadPointInfo(obj.old).then(function () {
                        obj['new'] = obj.old
                    })
                } else {
                    return $.when(loadPointInfo(obj.old), loadPointInfo(obj['new']))
                }
            }

            loadInfo(home)
            loadInfo(company)
            function getTooltip(content) {
                return ['<div class="tooltip top" role="tooltip">',
                    '<div class="tooltip-arrow"></div>',
                    '<div class="tooltip-inner">',
                    content,
                    '</div>',
                    '</div>'
                ].join("")
            }

            /**
             * 根据obj.gdx和obj.gdy添加marker标记
             * 会为obj设如下属性
             * obj.marker
             * @param obj
             * @param obj.gdx
             * @param obj.gdy
             * @return marker
             */
            function addPointMarker(obj, markerContent) {
                var $markerContent = $(getTooltip(markerContent))
                var marker = obj.marker = new AMap.Marker({
                    position: new AMap.LngLat(obj.gdx, obj.gdy),
                    content: $markerContent[0]
                })
                marker.setMap(map)
                var observer = new MutationObserver(function (record) {
                    if ($.contains($(".amap-layers")[0], $markerContent[0])) {
                        var height = -parseInt($markerContent.css("height"))
                        var width = -parseInt($markerContent.css("width")) / 2
                        marker.setOffset(new AMap.Pixel(width,height))
                        observer.disconnect()
                    }
                })
                observer.observe($(".amap-layers")[0], {
                    childList: true,
                    subtree: true
                })

                return marker
            }

            /**
             * 为家、公司、或者常住地添加marker,如果有marker不会重复添加
             * @param obj
             * @param markerContent 为”家“、”公司“、”常住地“
             */
            function addMarker(obj, markerContent) {
                if (obj['new']['marker']) return
                loadInfo(obj).then(function () {
                    if (obj.distance === 0) {
                        obj.old.marker = addPointMarker(obj['new'], markerContent)
                    } else {
                        addPointMarker(obj.old, markerContent + "(上次)")
                        addPointMarker(obj['new'], markerContent + "(本次)")
                    }
                    map.setFitView()
                })
            }

            addMarker(home, "家")
            addMarker(company, "公司")
        }
        ])
        angular.bootstrap($("#ng-app")[0], [app.name])
        $('[data-toggle="tooltip"]').tooltip({
            container: "body",
            placement: "right"
        })
    }
)