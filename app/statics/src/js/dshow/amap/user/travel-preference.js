require(['d3', 'nvd3', 'dataloader', 'toastr', 'datautils', 'datasource', 'promise-util', 'md5', "directives", "services"],
    function (d3, nv, dataloader, toastr, datautils, datasource, promiseUtil, md5) {
        promiseUtil.errorAsRejected()
        var app = angular.module("app", ["directives", "services"])
        app.controller("appCtrl", ["$scope", "$compile", "$filter", "applyService", function ($scope, $compile, $filter, applyService) {
            applyService.wrapApply()
            dataloader.ajaxFailHint()
            $scope.isFeedback = false
            function initForm() {
                $scope.notBusPreference = {
                    text: "结果为空",
                    value: ""
                }
                $scope.busPreference = {
                    text: "结果为空",
                    value: ""
                }
                $scope.car = {
                    text: "结果为空",
                    value: ""
                }
            }

            initForm()
            $scope.notBusPreferenceOptions = [
                {
                    value: "1",
                    text: "正确，棒棒哒"
                },
                {
                    value: "0-1",
                    text: "2天以下"
                }, {
                    value: "1-3",
                    text: "2-4天"
                }, {
                    value: "4-7",
                    text: "4天以上"
                }
            ]

            $scope.busPreferenceOptions = [
                {
                    value: "1",
                    text: "正确，棒棒哒"
                },
                {
                    value: "0-1",
                    text: "2天以下"
                }, {
                    value: "1-3",
                    text: "2-4天"
                }, {
                    value: "4-7",
                    text: "4天以上"
                }
            ]

            $scope.carOptions = [
                {
                    value: "1",
                    text: "有车一族"
                },
                {
                    value: "0",
                    text: "还没有车"
                }
            ]
            $scope.searchForm = {
                diu: ""
            }
            $scope.diuOfSearchResult = ""
            $scope.isSelf = function () {
                return $scope.diuOfSearchResult === $scope.diu
            }
            $scope.$watch("searching", function () {
                if ($scope.searching === true) {
                    $scope.notBusPreference.text = "加载中"
                    $scope.busPreference.text = "加载中"
                    $scope.car.text = "加载中"
                }
            })
            $scope.search = function () {
                var diu = $scope.searchForm.diu || $scope.diu
                if (!diu) {
                    toastr.warning("您的账户信息不包含diu")
                    return
                }
                var md5Diu = md5.hex_md5(diu)
                $scope.searching = true
                dataloader.get(md5Diu, '/s_amap_dm_user_trip_mode', {
                    source: "home",
                    type: "post",
                    params: {
                        //"f:d_version": QUERY_DATE
                    }
                }).then(function (res) {
                    $scope.searching = false
                    if (!res.result || !res.result[0]) {
                        initForm()
                        $scope.isFeedback = false
                        toastr.warning("查询结果为空(diu不存在或者挖掘结果为空)")
                        return
                    }
                    $scope.diuOfSearchResult = diu
                    var preference = res.result[0][md5Diu]
                    preference.u_not_bus_score = (+preference.u_auto_score + +preference.u_passenger_score) * 3
                    preference.u_bus_score = +preference.u_bus_score * 3
                    if (preference.u_bus_score_feedback) {
                        $scope.isFeedback = true
                    } else {
                        $scope.isFeedback = false
                    }
                    //公共交通
                    var busDays = getDays(preference.u_bus_score)
                    $scope.busPreference.days = busDays
                    $scope.busPreference.text = busDays + "天左右"
                    $scope.busPreference.feedbackValue = getBusOrNotText(preference.u_bus_score_feedback, $scope.busPreferenceOptions)
                    $scope.busPreference.value = "1"
                    //非公共交通
                    var notBusDays = getDays(preference.u_not_bus_score)
                    $scope.notBusPreference.days = notBusDays
                    $scope.notBusPreference.text = notBusDays + "天左右"
                    $scope.notBusPreference.feedbackValue = getBusOrNotText(preference.u_not_bus_score_feedback, $scope.notBusPreferenceOptions)
                    $scope.notBusPreference.value = "1"
                    //有车没车
                    if (preference.u_havecar == "1") {
                        $scope.car.text = "有车一族"
                    } else {
                        $scope.car.text = "还没有车"
                    }
                    $scope.car.value = preference.u_havecar || "0"
                    $scope.car.feedbackValue = getText(preference.u_havecar_feedback, $scope.carOptions)

                })
            }
            $scope.submit = function (valid) {
                if (valid) {
                    var md5Diu = md5.hex_md5($scope.diu)
                    dataloader.put(md5Diu, '/s_amap_dm_user_trip_mode', {
                        source: "home",
                        type: "post",
                        params: {
                            "f:u_not_bus_score_feedback": getValueToDatabase($scope.notBusPreference.value, $scope.notBusPreference.days),
                            "f:u_bus_score_feedback": getValueToDatabase($scope.busPreference.value, $scope.busPreference.days),
                            "f:u_havecar_feedback": $scope.car.value
                        }
                    }).then(function () {
                        toastr.success("反馈成功")
                        $scope.isFeedback = true
                        $scope.notBusPreference.feedbackValue = getBusOrNotText($scope.notBusPreference.value, $scope.notBusPreferenceOptions)
                        $scope.busPreference.feedbackValue = getBusOrNotText($scope.busPreference.value, $scope.busPreferenceOptions)
                        $scope.car.feedbackValue = getText($scope.car.value, $scope.carOptions)
                    })
                }
            }
            function getDays(score) {
                var days = Math.round(score * 7)
                if (days > 7) {
                    days = 7
                }
                return days
            }

            function getText(value, optionsList) {
                var result = ""
                optionsList.some(function (item) {
                    if (item.value == value) {
                        result = item.text
                        return true
                    }
                })
                return result
            }

            /**
             * 公共交通或者非公共交通的转换
             * @param value
             * @param optionsList
             */
            function getBusOrNotText(value, optionsList) {
                if (!value) {
                    return ""
                }
                var result = getText(value, optionsList)
                if (!result && value.indexOf("-") != -1) {
                    return getText("1", optionsList)
                }
                return result
            }

            /**
             * 对用户选择的选项进行转换，得到存入数据库格式的值
             * @param value
             */
            function getValueToDatabase(value, days) {
                if (value == "1") {
                    value = days + "-" + days
                }
                return value
            }

            datautils.getUserInfoAsync().then(function (userData) {
                $scope.diu = userData ? userData['result']['udid'] : ''
                $scope.search()
            })
        }
        ])
        //s_amap_dm_user_trip_mode
        angular.bootstrap($("#ng-app")[0], [app.name])
    }
)