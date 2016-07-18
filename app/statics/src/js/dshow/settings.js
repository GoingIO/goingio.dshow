require(['dataloader', 'toastr', 'datautils', 'datasource', 'md5', 'utils', "promise-util", "directives", "services"],
    function (dataloader, toastr, datautils, datasource, md5, utils, promiseUtil) {
        promiseUtil.errorAsRejected()
        dataloader.ajaxFailHint()
        var app = angular.module("app", ["directives", "services"])
        app.controller("appCtrl", ["$scope", "applyService", function ($scope, applyService) {
            applyService.wrapApply()

        }])
        app.controller("phoneFormCtrl", ["$scope", "$interval", "applyService", function ($scope, $interval, applyService) {
            $scope.phoneForm = {
                phone: "",
                verifyCode: ""
            }
            datautils.getUserInfoAsync().then(function (userRes) {
                $scope.phoneForm.phone = userRes.result.phone
                applyService.$apply()
            })
            $scope.getVerifyCode = function (valid) {
                $scope.tryGetVerifyCode = true
                if ($scope.sent) {
                    return
                }
                if (valid) {
                    $.ajax({
                        url: DSHOW_CONTEXT + datasource.getSource('restapi_dshow_get_verifycode'),
                        dataType: 'json',
                        data: {
                            phone: $scope.phoneForm.phone
                        }
                    }).then(function () {
                        $scope.sent = true
                        $scope.remainingTime = 60
                        $interval(function () {
                            $scope.remainingTime--
                            if ($scope.remainingTime == 0) {
                                $scope.sent = false
                            }
                        }, 1000, 60)
                    })
                }
            }
            $scope.bindPhone = function (valid) {
                $scope.tryBindPhone = true
                if (valid) {
                    $.ajax({
                        url: DSHOW_CONTEXT + datasource.getSource('restapi_dshow_bind_phone'),
                        dataType: 'json',
                        type: "post",
                        data: $scope.phoneForm
                    }).then(function (res) {
                        if (res.status === "success") {
                            $scope.sent = false;
                            if (res.diu) {
                                toastr.success("绑定成功")
                                location = DSHOW_CONTEXT + "/index"
                            } else {
                                toastr.info("没有获取到diu，请尝试使用此账户登录高德地图后，再来这里绑定")
                            }
                        } else {
                            toastr.error(res.msg || "绑定失败")
                        }
                    })
                }
            }
        }])
        app.controller("gdAccountFormCtrl", ["$scope", "applyService", function ($scope, applyService) {
            applyService.wrapApply()
            $scope.gdAccountForm = {
                userName: "",
                password: ""
            }
            datautils.getUserInfoAsync().then(function (userRes) {
                $scope.gdAccountForm.userName = userRes.result.gdUserName
                applyService.$apply()
            })
            $scope.bindGDAccount = function (valid) {
                $scope.tryBindGDAccount = true
                if (valid) {
                    $.ajax({
                        url: DSHOW_CONTEXT + datasource.getSource('restapi_dshow_bind_gd_account'),
                        dataType: 'json',
                        type: "post",
                        data: $scope.gdAccountForm
                    }).then(function (res) {
                        if (res.status === "success") {
                            if (res.diu) {
                                toastr.success("绑定成功")
                                location = DSHOW_CONTEXT + "/index"
                            } else {
                                toastr.info("没有获取到diu，请尝试使用此账户登录高德地图后，再来这里绑定")
                            }
                        } else {
                            toastr.error(res.msg || "绑定失败")
                        }
                    })
                }
            }
        }])
        angular.bootstrap($("#ng-app")[0], [app.name])
    })