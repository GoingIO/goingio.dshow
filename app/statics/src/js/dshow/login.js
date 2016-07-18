require(['dataloader', "utils", "promise-util", "directives", "services"],
    function (dataloader, utils, promiseUtil) {
        console.log("101010")
        var SUCCESS = "1"
        var LOGINED = "22"
        var codeList = [{
            code: "3",
            text: "参数错误"
        }, {
            code: "2",
            text: "登录失败"
        }, {
            code: "4",
            text: "签名错误"
        }, {
            code: "10024",
            text: "用户名或者密码错误"
        }]
        var app = angular.module("app", ["services"])
        app.controller("appCtrl", ["$scope", "$location", "applyService", function ($scope, $location, applyService) {
            applyService.wrapApply()
            dataloader.ajaxFailHint()
            $scope.loginForm = {
                userId: "",
                password: ""
            }
            $scope.indexUrl = DSHOW_CONTEXT + "/index"
            $scope.errorHint = ""
            $scope.login = function (valid) {
                if (!valid) return
                $.post(DSHOW_CONTEXT + "/account/login", $scope.loginForm, "json").then(function (res) {
                        if (res.code == SUCCESS || res.code == LOGINED) {
                            var searchObj = utils.getQueryStringArgs()
                            var ref = searchObj.ref
                            if (!ref) ref = "//" + location.host + DSHOW_CONTEXT + "/" + DSHOW_INDEX
                            location = ref
                        } else {
                            codeList.some(function (item) {
                                if (item.code == res.code) {
                                    $scope.errorHint = item.text
                                    return true
                                }
                            })
                        }
                    }
                )
            }

        }
        ])
        angular.bootstrap($("#ng-app")[0], [app.name])
    }
)