require(["datautils"],
    function (datautils) {
        datautils.getUserInfoAsync().then(function (data) {
            var user = data
            if (user) {
                if(user.result.phone||localStorage.getItem("settingsTour_end")){
                    return
                }
                var observer = new MutationObserver(function (records) {
                    if ($("#user-opt .fa-wrench").size() > 0) {
                        $(".user-profile .dropdown-menu").css({
                            display: "block"
                        });
                        $(".user-profile-menu,body>nav").css({
                            'z-index': "auto"
                        })
                        var tour = new Tour({
                            onEnd: function (tour) {
                                $(".user-profile .dropdown-menu").css({
                                    display: ""
                                });
                                $(".user-profile-menu,body>nav").css({
                                    'z-index': ""
                                })
                            },
                            name: "settingsTour",
                            backdrop: true,
                            debug: true,
                            backdropPadding: 0,
                            steps: [
                                {
                                    placement: "left",
                                    element: "#user-opt li.settings",
                                    title: "设置",
                                    content: "去设置里绑定手机号啦！"
                                }
                            ],
                            template: ["<div class='popover tour'>",
                                "<div class='arrow'></div>",
                                "<h3 class='popover-title'></h3>",
                                "<div class='popover-content'></div>",
                                "<div class='popover-navigation'>",
                                "<button class='btn btn-default' data-role='end'>知道了！</button>",
                                "</div>",
                                " </div>"].join("")
                        });
                        tour.init();
                        tour.start();
                        localStorage.setItem("settingsTour_end","yes")
                    }
                })
                observer.observe($("#user-opt")[0], {
                    'childList': true,
                    'subtree': true
                })
            }
        })

    })