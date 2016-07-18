angular.module("directives", []).directive("preventSpread", function () {
    return {
        restrict: "A",
        link: function ($scope, elem, attrs) {
            var $elem = $(elem)
            $elem.bind(attrs.preventSpread, function (event) {
                event.stopPropagation()
            })
        }
    }
}).directive("toggleLeft", function () {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: DSHOW_CONTEXT + "/statics/html/toggleleft.html",
        scope: true,
        link: function ($scope) {
            $scope.showLeftNav = true
            $scope.toggleLeftNav = function () {
                //ng-class="{'fadeInLeft':showLeftNav,'fadeInRight':!showLeftNav}"
                //ng-style="leftNavStyle"
                $scope.showLeftNav = !$scope.showLeftNav
                if (!$scope.showLeftNav) {
                    $(".info-panel").addClass("fadeInRight")
                    $(".info-panel").removeClass("fadeInLeft")
                    $scope.leftNavStyle = {
                        "margin-left": -1 * $('.info-panel').width()
                    }
                } else {
                    $(".info-panel").addClass("fadeInLeft")
                    $(".info-panel").removeClass("fadeInRight")
                    $scope.leftNavStyle = {
                        "margin-left": 0
                    }
                }
                $(".info-panel").css($scope.leftNavStyle)
            }
        }
    }
})
