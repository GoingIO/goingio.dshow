/**
 * Created by telen on 15/9/10.
 */
require(['socketio', 'sourceUtils', 'TWEEN', 'd3', 'highcharts', 'odometer', 'SplitText'], function(io, sourceUtils, TWEEN){

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel

    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());


    var data = [
        [Date.UTC(2013,5,2),0.7695],
        [Date.UTC(2013,5,3),0.7648],
        [Date.UTC(2013,5,4),0.7645],
        [Date.UTC(2013,5,5),0.7638],
        [Date.UTC(2013,5,6),0.7549],
        [Date.UTC(2013,5,7),0.7562],
        [Date.UTC(2013,5,9),0.7574],
        [Date.UTC(2013,5,10),0.7543],
        [Date.UTC(2013,5,11),0.7510],
        [Date.UTC(2013,5,12),0.7498],
        [Date.UTC(2013,5,13),0.7477],
        [Date.UTC(2013,5,14),0.7492],
        [Date.UTC(2013,5,16),0.7487],
        [Date.UTC(2013,5,17),0.7480],
        [Date.UTC(2013,5,18),0.7466],
        [Date.UTC(2013,5,19),0.7521],
        [Date.UTC(2013,5,20),0.7564],
        [Date.UTC(2013,5,21),0.7621],
        [Date.UTC(2013,5,23),0.7630],
        [Date.UTC(2013,5,24),0.7623],
        [Date.UTC(2013,5,25),0.7644],
        [Date.UTC(2013,5,26),0.7685],
        [Date.UTC(2013,5,27),0.7671],
        [Date.UTC(2013,5,28),0.7687],
        [Date.UTC(2013,5,30),0.7687],
        [Date.UTC(2013,6,1),0.7654],
        [Date.UTC(2013,6,2),0.7705],
        [Date.UTC(2013,6,3),0.7687],
        [Date.UTC(2013,6,4),0.7744],
        [Date.UTC(2013,6,5),0.7793],
        [Date.UTC(2013,6,7),0.7804],
        [Date.UTC(2013,6,8),0.7770],
        [Date.UTC(2013,6,9),0.7824],
        [Date.UTC(2013,6,10),0.7705],
        [Date.UTC(2013,6,11),0.7635],
        [Date.UTC(2013,6,12),0.7652],
        [Date.UTC(2013,6,14),0.7656],
        [Date.UTC(2013,6,15),0.7655],
        [Date.UTC(2013,6,16),0.7598],
        [Date.UTC(2013,6,17),0.7619],
        [Date.UTC(2013,6,18),0.7628],
        [Date.UTC(2013,6,19),0.7609],
        [Date.UTC(2013,6,21),0.7599],
        [Date.UTC(2013,6,22),0.7584],
        [Date.UTC(2013,6,23),0.7562],
        [Date.UTC(2013,6,24),0.7575],
        [Date.UTC(2013,6,25),0.7531],
        [Date.UTC(2013,6,26),0.7530],
        [Date.UTC(2013,6,28),0.7526],
        [Date.UTC(2013,6,29),0.7540],
        [Date.UTC(2013,6,30),0.7540],
        [Date.UTC(2013,6,31),0.7518],
        [Date.UTC(2013,7,1),0.7571],
        [Date.UTC(2013,7,2),0.7529],
        [Date.UTC(2013,7,4),0.7532],
        [Date.UTC(2013,7,5),0.7542],
        [Date.UTC(2013,7,6),0.7515],
        [Date.UTC(2013,7,7),0.7498],
        [Date.UTC(2013,7,8),0.7473],
        [Date.UTC(2013,7,9),0.7494],
        [Date.UTC(2013,7,11),0.7497],
        [Date.UTC(2013,7,12),0.7519],
        [Date.UTC(2013,7,13),0.7540],
        [Date.UTC(2013,7,14),0.7543],
        [Date.UTC(2013,7,15),0.7492],
        [Date.UTC(2013,7,16),0.7502],
        [Date.UTC(2013,7,18),0.7503],
        [Date.UTC(2013,7,19),0.7499],
        [Date.UTC(2013,7,20),0.7453],
        [Date.UTC(2013,7,21),0.7487],
        [Date.UTC(2013,7,22),0.7487],
        [Date.UTC(2013,7,23),0.7472],
        [Date.UTC(2013,7,25),0.7471],
        [Date.UTC(2013,7,26),0.7480],
        [Date.UTC(2013,7,27),0.7467],
        [Date.UTC(2013,7,28),0.7497],
        [Date.UTC(2013,7,29),0.7552],
        [Date.UTC(2013,7,30),0.7562],
        [Date.UTC(2013,8,1),0.7572],
        [Date.UTC(2013,8,2),0.7581],
        [Date.UTC(2013,8,3),0.7593],
        [Date.UTC(2013,8,4),0.7571],
        [Date.UTC(2013,8,5),0.7622],
        [Date.UTC(2013,8,6),0.7588],
        [Date.UTC(2013,8,8),0.7591],
        [Date.UTC(2013,8,9),0.7544],
        [Date.UTC(2013,8,10),0.7537],
        [Date.UTC(2013,8,11),0.7512],
        [Date.UTC(2013,8,12),0.7519],
        [Date.UTC(2013,8,13),0.7522],
        [Date.UTC(2013,8,15),0.7486],
        [Date.UTC(2013,8,16),0.7500],
        [Date.UTC(2013,8,17),0.7486],
        [Date.UTC(2013,8,18),0.7396],
        [Date.UTC(2013,8,19),0.7391],
        [Date.UTC(2013,8,20),0.7394],
        [Date.UTC(2013,8,22),0.7389],
        [Date.UTC(2013,8,23),0.7411],
        [Date.UTC(2013,8,24),0.7422],
        [Date.UTC(2013,8,25),0.7393],
        [Date.UTC(2013,8,26),0.7413],
        [Date.UTC(2013,8,27),0.7396],
        [Date.UTC(2013,8,29),0.7410],
        [Date.UTC(2013,8,30),0.7393],
        [Date.UTC(2013,9,1),0.7393],
        [Date.UTC(2013,9,2),0.7365],
        [Date.UTC(2013,9,3),0.7343],
        [Date.UTC(2013,9,4),0.7376],
        [Date.UTC(2013,9,6),0.7370],
        [Date.UTC(2013,9,7),0.7362],
        [Date.UTC(2013,9,8),0.7368],
        [Date.UTC(2013,9,9),0.7393],
        [Date.UTC(2013,9,10),0.7397],
        [Date.UTC(2013,9,11),0.7385],
        [Date.UTC(2013,9,13),0.7377],
        [Date.UTC(2013,9,14),0.7374],
        [Date.UTC(2013,9,15),0.7395],
        [Date.UTC(2013,9,16),0.7389],
        [Date.UTC(2013,9,17),0.7312],
        [Date.UTC(2013,9,18),0.7307],
        [Date.UTC(2013,9,20),0.7309],
        [Date.UTC(2013,9,21),0.7308],
        [Date.UTC(2013,9,22),0.7256],
        [Date.UTC(2013,9,23),0.7258],
        [Date.UTC(2013,9,24),0.7247],
        [Date.UTC(2013,9,25),0.7244],
        [Date.UTC(2013,9,27),0.7244],
        [Date.UTC(2013,9,28),0.7255],
        [Date.UTC(2013,9,29),0.7275],
        [Date.UTC(2013,9,30),0.7280],
        [Date.UTC(2013,9,31),0.7361],
        [Date.UTC(2013,10,1),0.7415],
        [Date.UTC(2013,10,3),0.7411],
        [Date.UTC(2013,10,4),0.7399],
        [Date.UTC(2013,10,5),0.7421],
        [Date.UTC(2013,10,6),0.7400],
        [Date.UTC(2013,10,7),0.7452],
        [Date.UTC(2013,10,8),0.7479],
        [Date.UTC(2013,10,10),0.7492],
        [Date.UTC(2013,10,11),0.7460],
        [Date.UTC(2013,10,12),0.7442],
        [Date.UTC(2013,10,13),0.7415],
        [Date.UTC(2013,10,14),0.7429],
        [Date.UTC(2013,10,15),0.7410],
        [Date.UTC(2013,10,17),0.7417],
        [Date.UTC(2013,10,18),0.7405],
        [Date.UTC(2013,10,19),0.7386],
        [Date.UTC(2013,10,20),0.7441],
        [Date.UTC(2013,10,21),0.7418],
        [Date.UTC(2013,10,22),0.7376],
        [Date.UTC(2013,10,24),0.7379],
        [Date.UTC(2013,10,25),0.7399],
        [Date.UTC(2013,10,26),0.7369],
        [Date.UTC(2013,10,27),0.7365],
        [Date.UTC(2013,10,28),0.7350],
        [Date.UTC(2013,10,29),0.7358],
        [Date.UTC(2013,11,1),0.7362],
        [Date.UTC(2013,11,2),0.7385],
        [Date.UTC(2013,11,3),0.7359],
        [Date.UTC(2013,11,4),0.7357],
        [Date.UTC(2013,11,5),0.7317],
        [Date.UTC(2013,11,6),0.7297],
        [Date.UTC(2013,11,8),0.7296],
        [Date.UTC(2013,11,9),0.7279],
        [Date.UTC(2013,11,10),0.7267],
        [Date.UTC(2013,11,11),0.7254],
        [Date.UTC(2013,11,12),0.7270],
        [Date.UTC(2013,11,13),0.7276],
        [Date.UTC(2013,11,15),0.7278],
        [Date.UTC(2013,11,16),0.7267],
        [Date.UTC(2013,11,17),0.7263],
        [Date.UTC(2013,11,18),0.7307],
        [Date.UTC(2013,11,19),0.7319],
        [Date.UTC(2013,11,20),0.7315],
        [Date.UTC(2013,11,22),0.7311],
        [Date.UTC(2013,11,23),0.7301],
        [Date.UTC(2013,11,24),0.7308],
        [Date.UTC(2013,11,25),0.7310],
        [Date.UTC(2013,11,26),0.7304],
        [Date.UTC(2013,11,27),0.7277],
        [Date.UTC(2013,11,29),0.7272],
        [Date.UTC(2013,11,30),0.7244],
        [Date.UTC(2013,11,31),0.7275],
        [Date.UTC(2014,0,1),0.7271],
        [Date.UTC(2014,0,2),0.7314],
        [Date.UTC(2014,0,3),0.7359],
        [Date.UTC(2014,0,5),0.7355],
        [Date.UTC(2014,0,6),0.7338],
        [Date.UTC(2014,0,7),0.7345],
        [Date.UTC(2014,0,8),0.7366],
        [Date.UTC(2014,0,9),0.7349],
        [Date.UTC(2014,0,10),0.7316],
        [Date.UTC(2014,0,12),0.7315],
        [Date.UTC(2014,0,13),0.7315],
        [Date.UTC(2014,0,14),0.7310],
        [Date.UTC(2014,0,15),0.7350],
        [Date.UTC(2014,0,16),0.7341],
        [Date.UTC(2014,0,17),0.7385],
        [Date.UTC(2014,0,19),0.7392],
        [Date.UTC(2014,0,20),0.7379],
        [Date.UTC(2014,0,21),0.7373],
        [Date.UTC(2014,0,22),0.7381],
        [Date.UTC(2014,0,23),0.7301],
        [Date.UTC(2014,0,24),0.7311],
        [Date.UTC(2014,0,26),0.7306],
        [Date.UTC(2014,0,27),0.7314],
        [Date.UTC(2014,0,28),0.7316],
        [Date.UTC(2014,0,29),0.7319],
        [Date.UTC(2014,0,30),0.7377],
        [Date.UTC(2014,0,31),0.7415],
        [Date.UTC(2014,1,2),0.7414],
        [Date.UTC(2014,1,3),0.7393],
        [Date.UTC(2014,1,4),0.7397],
        [Date.UTC(2014,1,5),0.7389],
        [Date.UTC(2014,1,6),0.7358],
        [Date.UTC(2014,1,7),0.7334],
        [Date.UTC(2014,1,9),0.7343],
        [Date.UTC(2014,1,10),0.7328],
        [Date.UTC(2014,1,11),0.7332],
        [Date.UTC(2014,1,12),0.7356],
        [Date.UTC(2014,1,13),0.7309],
        [Date.UTC(2014,1,14),0.7304],
        [Date.UTC(2014,1,16),0.7300],
        [Date.UTC(2014,1,17),0.7295],
        [Date.UTC(2014,1,18),0.7268],
        [Date.UTC(2014,1,19),0.7281],
        [Date.UTC(2014,1,20),0.7289],
        [Date.UTC(2014,1,21),0.7278],
        [Date.UTC(2014,1,23),0.7280],
        [Date.UTC(2014,1,24),0.7280],
        [Date.UTC(2014,1,25),0.7275],
        [Date.UTC(2014,1,26),0.7306],
        [Date.UTC(2014,1,27),0.7295],
        [Date.UTC(2014,1,28),0.7245],
        [Date.UTC(2014,2,2),0.7259],
        [Date.UTC(2014,2,3),0.7280],
        [Date.UTC(2014,2,4),0.7276],
        [Date.UTC(2014,2,5),0.7282],
        [Date.UTC(2014,2,6),0.7215],
        [Date.UTC(2014,2,7),0.7206],
        [Date.UTC(2014,2,9),0.7206],
        [Date.UTC(2014,2,10),0.7207],
        [Date.UTC(2014,2,11),0.7216],
        [Date.UTC(2014,2,12),0.7193],
        [Date.UTC(2014,2,13),0.7210],
        [Date.UTC(2014,2,14),0.7187],
        [Date.UTC(2014,2,16),0.7188],
        [Date.UTC(2014,2,17),0.7183],
        [Date.UTC(2014,2,18),0.7177],
        [Date.UTC(2014,2,19),0.7229],
        [Date.UTC(2014,2,20),0.7258],
        [Date.UTC(2014,2,21),0.7249],
        [Date.UTC(2014,2,23),0.7247],
        [Date.UTC(2014,2,24),0.7226],
        [Date.UTC(2014,2,25),0.7232],
        [Date.UTC(2014,2,26),0.7255],
        [Date.UTC(2014,2,27),0.7278],
        [Date.UTC(2014,2,28),0.7271],
        [Date.UTC(2014,2,30),0.7272],
        [Date.UTC(2014,2,31),0.7261],
        [Date.UTC(2014,3,1),0.7250],
        [Date.UTC(2014,3,2),0.7264],
        [Date.UTC(2014,3,3),0.7289],
        [Date.UTC(2014,3,4),0.7298],
        [Date.UTC(2014,3,6),0.7298],
        [Date.UTC(2014,3,7),0.7278],
        [Date.UTC(2014,3,8),0.7248],
        [Date.UTC(2014,3,9),0.7218],
        [Date.UTC(2014,3,10),0.7200],
        [Date.UTC(2014,3,11),0.7202],
        [Date.UTC(2014,3,13),0.7222],
        [Date.UTC(2014,3,14),0.7236],
        [Date.UTC(2014,3,15),0.7239],
        [Date.UTC(2014,3,16),0.7238],
        [Date.UTC(2014,3,17),0.7238],
        [Date.UTC(2014,3,18),0.7238],
        [Date.UTC(2014,3,20),0.7239],
        [Date.UTC(2014,3,21),0.7250],
        [Date.UTC(2014,3,22),0.7244],
        [Date.UTC(2014,3,23),0.7238],
        [Date.UTC(2014,3,24),0.7229],
        [Date.UTC(2014,3,25),0.7229],
        [Date.UTC(2014,3,27),0.7226],
        [Date.UTC(2014,3,28),0.7220],
        [Date.UTC(2014,3,29),0.7240],
        [Date.UTC(2014,3,30),0.7211],
        [Date.UTC(2014,4,1),0.7210],
        [Date.UTC(2014,4,2),0.7209],
        [Date.UTC(2014,4,4),0.7209],
        [Date.UTC(2014,4,5),0.7207],
        [Date.UTC(2014,4,6),0.7180],
        [Date.UTC(2014,4,7),0.7188],
        [Date.UTC(2014,4,8),0.7225],
        [Date.UTC(2014,4,9),0.7268],
        [Date.UTC(2014,4,11),0.7267],
        [Date.UTC(2014,4,12),0.7269],
        [Date.UTC(2014,4,13),0.7297],
        [Date.UTC(2014,4,14),0.7291],
        [Date.UTC(2014,4,15),0.7294],
        [Date.UTC(2014,4,16),0.7302],
        [Date.UTC(2014,4,18),0.7298],
        [Date.UTC(2014,4,19),0.7295],
        [Date.UTC(2014,4,20),0.7298],
        [Date.UTC(2014,4,21),0.7307],
        [Date.UTC(2014,4,22),0.7323],
        [Date.UTC(2014,4,23),0.7335],
        [Date.UTC(2014,4,25),0.7338],
        [Date.UTC(2014,4,26),0.7329],
        [Date.UTC(2014,4,27),0.7335],
        [Date.UTC(2014,4,28),0.7358],
        [Date.UTC(2014,4,29),0.7351],
        [Date.UTC(2014,4,30),0.7337],
        [Date.UTC(2014,5,1),0.7338],
        [Date.UTC(2014,5,2),0.7355],
        [Date.UTC(2014,5,3),0.7338],
        [Date.UTC(2014,5,4),0.7353],
        [Date.UTC(2014,5,5),0.7321],
        [Date.UTC(2014,5,6),0.7330],
        [Date.UTC(2014,5,8),0.7327],
        [Date.UTC(2014,5,9),0.7356],
        [Date.UTC(2014,5,10),0.7381],
        [Date.UTC(2014,5,11),0.7389],
        [Date.UTC(2014,5,12),0.7379],
        [Date.UTC(2014,5,13),0.7384],
        [Date.UTC(2014,5,15),0.7388],
        [Date.UTC(2014,5,16),0.7367],
        [Date.UTC(2014,5,17),0.7382],
        [Date.UTC(2014,5,18),0.7356],
        [Date.UTC(2014,5,19),0.7349],
        [Date.UTC(2014,5,20),0.7353],
        [Date.UTC(2014,5,22),0.7357],
        [Date.UTC(2014,5,23),0.7350],
        [Date.UTC(2014,5,24),0.7350],
        [Date.UTC(2014,5,25),0.7337],
        [Date.UTC(2014,5,26),0.7347],
        [Date.UTC(2014,5,27),0.7327],
        [Date.UTC(2014,5,29),0.7330],
        [Date.UTC(2014,5,30),0.7304],
        [Date.UTC(2014,6,1),0.7310],
        [Date.UTC(2014,6,2),0.7320],
        [Date.UTC(2014,6,3),0.7347],
        [Date.UTC(2014,6,4),0.7356],
        [Date.UTC(2014,6,6),0.7360],
        [Date.UTC(2014,6,7),0.7350],
        [Date.UTC(2014,6,8),0.7346],
        [Date.UTC(2014,6,9),0.7329],
        [Date.UTC(2014,6,10),0.7348],
        [Date.UTC(2014,6,11),0.7349],
        [Date.UTC(2014,6,13),0.7352],
        [Date.UTC(2014,6,14),0.7342],
        [Date.UTC(2014,6,15),0.7369],
        [Date.UTC(2014,6,16),0.7393],
        [Date.UTC(2014,6,17),0.7392],
        [Date.UTC(2014,6,18),0.7394],
        [Date.UTC(2014,6,20),0.7390],
        [Date.UTC(2014,6,21),0.7395],
        [Date.UTC(2014,6,22),0.7427],
        [Date.UTC(2014,6,23),0.7427],
        [Date.UTC(2014,6,24),0.7428],
        [Date.UTC(2014,6,25),0.7446],
        [Date.UTC(2014,6,27),0.7447],
        [Date.UTC(2014,6,28),0.7440],
        [Date.UTC(2014,6,29),0.7458],
        [Date.UTC(2014,6,30),0.7464],
        [Date.UTC(2014,6,31),0.7469],
        [Date.UTC(2014,7,1),0.7446],
        [Date.UTC(2014,7,3),0.7447],
        [Date.UTC(2014,7,4),0.7450],
        [Date.UTC(2014,7,5),0.7477],
        [Date.UTC(2014,7,6),0.7472],
        [Date.UTC(2014,7,7),0.7483],
        [Date.UTC(2014,7,8),0.7457],
        [Date.UTC(2014,7,10),0.7460],
        [Date.UTC(2014,7,11),0.7470],
        [Date.UTC(2014,7,12),0.7480],
        [Date.UTC(2014,7,13),0.7482],
        [Date.UTC(2014,7,14),0.7482],
        [Date.UTC(2014,7,15),0.7463],
        [Date.UTC(2014,7,17),0.7469],
        [Date.UTC(2014,7,18),0.7483],
        [Date.UTC(2014,7,19),0.7508],
        [Date.UTC(2014,7,20),0.7541],
        [Date.UTC(2014,7,21),0.7529],
        [Date.UTC(2014,7,22),0.7551],
        [Date.UTC(2014,7,24),0.7577],
        [Date.UTC(2014,7,25),0.7580],
        [Date.UTC(2014,7,26),0.7593],
        [Date.UTC(2014,7,27),0.7580],
        [Date.UTC(2014,7,28),0.7585],
        [Date.UTC(2014,7,29),0.7614],
        [Date.UTC(2014,7,31),0.7618],
        [Date.UTC(2014,8,1),0.7618],
        [Date.UTC(2014,8,2),0.7614],
        [Date.UTC(2014,8,3),0.7604],
        [Date.UTC(2014,8,4),0.7725],
        [Date.UTC(2014,8,5),0.7722],
        [Date.UTC(2014,8,7),0.7721],
        [Date.UTC(2014,8,8),0.7753],
        [Date.UTC(2014,8,9),0.7730],
        [Date.UTC(2014,8,10),0.7742],
        [Date.UTC(2014,8,11),0.7736],
        [Date.UTC(2014,8,12),0.7713],
        [Date.UTC(2014,8,14),0.7717],
        [Date.UTC(2014,8,15),0.7727],
        [Date.UTC(2014,8,16),0.7716],
        [Date.UTC(2014,8,17),0.7772],
        [Date.UTC(2014,8,18),0.7739],
        [Date.UTC(2014,8,19),0.7794],
        [Date.UTC(2014,8,21),0.7788],
        [Date.UTC(2014,8,22),0.7782],
        [Date.UTC(2014,8,23),0.7784],
        [Date.UTC(2014,8,24),0.7824],
        [Date.UTC(2014,8,25),0.7843],
        [Date.UTC(2014,8,26),0.7884],
        [Date.UTC(2014,8,28),0.7891],
        [Date.UTC(2014,8,29),0.7883],
        [Date.UTC(2014,8,30),0.7916],
        [Date.UTC(2014,9,1),0.7922],
        [Date.UTC(2014,9,2),0.7893],
        [Date.UTC(2014,9,3),0.7989],
        [Date.UTC(2014,9,5),0.7992],
        [Date.UTC(2014,9,6),0.7903],
        [Date.UTC(2014,9,7),0.7893],
        [Date.UTC(2014,9,8),0.7853],
        [Date.UTC(2014,9,9),0.7880],
        [Date.UTC(2014,9,10),0.7919],
        [Date.UTC(2014,9,12),0.7912],
        [Date.UTC(2014,9,13),0.7842],
        [Date.UTC(2014,9,14),0.7900],
        [Date.UTC(2014,9,15),0.7790],
        [Date.UTC(2014,9,16),0.7806],
        [Date.UTC(2014,9,17),0.7835],
        [Date.UTC(2014,9,19),0.7844],
        [Date.UTC(2014,9,20),0.7813],
        [Date.UTC(2014,9,21),0.7864],
        [Date.UTC(2014,9,22),0.7905],
        [Date.UTC(2014,9,23),0.7907],
        [Date.UTC(2014,9,24),0.7893],
        [Date.UTC(2014,9,26),0.7889],
        [Date.UTC(2014,9,27),0.7875],
        [Date.UTC(2014,9,28),0.7853],
        [Date.UTC(2014,9,29),0.7916],
        [Date.UTC(2014,9,30),0.7929],
        [Date.UTC(2014,9,31),0.7984],
        [Date.UTC(2014,10,2),0.7999],
        [Date.UTC(2014,10,3),0.8012],
        [Date.UTC(2014,10,4),0.7971],
        [Date.UTC(2014,10,5),0.8009],
        [Date.UTC(2014,10,6),0.8081],
        [Date.UTC(2014,10,7),0.8030],
        [Date.UTC(2014,10,9),0.8025],
        [Date.UTC(2014,10,10),0.8051],
        [Date.UTC(2014,10,11),0.8016],
        [Date.UTC(2014,10,12),0.8040],
        [Date.UTC(2014,10,13),0.8015],
        [Date.UTC(2014,10,14),0.7985],
        [Date.UTC(2014,10,16),0.7988],
        [Date.UTC(2014,10,17),0.8032],
        [Date.UTC(2014,10,18),0.7976],
        [Date.UTC(2014,10,19),0.7965],
        [Date.UTC(2014,10,20),0.7975],
        [Date.UTC(2014,10,21),0.8071],
        [Date.UTC(2014,10,23),0.8082],
        [Date.UTC(2014,10,24),0.8037],
        [Date.UTC(2014,10,25),0.8016],
        [Date.UTC(2014,10,26),0.7996],
        [Date.UTC(2014,10,27),0.8022],
        [Date.UTC(2014,10,28),0.8031],
        [Date.UTC(2014,10,30),0.8040],
        [Date.UTC(2014,11,1),0.8020],
        [Date.UTC(2014,11,2),0.8075],
        [Date.UTC(2014,11,3),0.8123],
        [Date.UTC(2014,11,4),0.8078],
        [Date.UTC(2014,11,5),0.8139],
        [Date.UTC(2014,11,7),0.8135],
        [Date.UTC(2014,11,8),0.8119],
        [Date.UTC(2014,11,9),0.8081],
        [Date.UTC(2014,11,10),0.8034],
        [Date.UTC(2014,11,11),0.8057],
        [Date.UTC(2014,11,12),0.8024],
        [Date.UTC(2014,11,14),0.8024],
        [Date.UTC(2014,11,15),0.8040],
        [Date.UTC(2014,11,16),0.7993],
        [Date.UTC(2014,11,17),0.8102],
        [Date.UTC(2014,11,18),0.8139],
        [Date.UTC(2014,11,19),0.8177],
        [Date.UTC(2014,11,21),0.8180],
        [Date.UTC(2014,11,22),0.8176],
        [Date.UTC(2014,11,23),0.8215],
        [Date.UTC(2014,11,24),0.8200],
        [Date.UTC(2014,11,25),0.8182],
        [Date.UTC(2014,11,26),0.8213],
        [Date.UTC(2014,11,28),0.8218],
        [Date.UTC(2014,11,29),0.8229],
        [Date.UTC(2014,11,30),0.8225],
        [Date.UTC(2014,11,31),0.8266],
        [Date.UTC(2015,0,1),0.8262],
        [Date.UTC(2015,0,2),0.8331],
        [Date.UTC(2015,0,4),0.8371],
        [Date.UTC(2015,0,5),0.8380],
        [Date.UTC(2015,0,6),0.8411],
        [Date.UTC(2015,0,7),0.8447],
        [Date.UTC(2015,0,8),0.8480],
        [Date.UTC(2015,0,9),0.8445],
        [Date.UTC(2015,0,11),0.8425],
        [Date.UTC(2015,0,12),0.8451],
        [Date.UTC(2015,0,13),0.8495],
        [Date.UTC(2015,0,14),0.8482],
        [Date.UTC(2015,0,15),0.8598],
        [Date.UTC(2015,0,16),0.8643],
        [Date.UTC(2015,0,18),0.8648],
        [Date.UTC(2015,0,19),0.8617],
        [Date.UTC(2015,0,20),0.8658],
        [Date.UTC(2015,0,21),0.8613],
        [Date.UTC(2015,0,22),0.8798],
        [Date.UTC(2015,0,23),0.8922],
        [Date.UTC(2015,0,25),0.8990],
        [Date.UTC(2015,0,26),0.8898],
        [Date.UTC(2015,0,27),0.8787],
        [Date.UTC(2015,0,28),0.8859],
        [Date.UTC(2015,0,29),0.8834],
        [Date.UTC(2015,0,30),0.8859],
        [Date.UTC(2015,1,1),0.8843],
        [Date.UTC(2015,1,2),0.8817],
        [Date.UTC(2015,1,3),0.8710],
        [Date.UTC(2015,1,4),0.8813],
        [Date.UTC(2015,1,5),0.8713],
        [Date.UTC(2015,1,6),0.8837],
        [Date.UTC(2015,1,8),0.8839],
        [Date.UTC(2015,1,9),0.8831],
        [Date.UTC(2015,1,10),0.8833],
        [Date.UTC(2015,1,11),0.8823],
        [Date.UTC(2015,1,12),0.8770],
        [Date.UTC(2015,1,13),0.8783],
        [Date.UTC(2015,1,15),0.8774],
        [Date.UTC(2015,1,16),0.8807],
        [Date.UTC(2015,1,17),0.8762],
        [Date.UTC(2015,1,18),0.8774],
        [Date.UTC(2015,1,19),0.8798],
        [Date.UTC(2015,1,20),0.8787],
        [Date.UTC(2015,1,22),0.8787],
        [Date.UTC(2015,1,23),0.8824],
        [Date.UTC(2015,1,24),0.8818],
        [Date.UTC(2015,1,25),0.8801],
        [Date.UTC(2015,1,26),0.8931],
        [Date.UTC(2015,1,27),0.8932],
        [Date.UTC(2015,2,1),0.8960],
        [Date.UTC(2015,2,2),0.8941],
        [Date.UTC(2015,2,3),0.8948],
        [Date.UTC(2015,2,4),0.9026],
        [Date.UTC(2015,2,5),0.9066],
        [Date.UTC(2015,2,6),0.9222],
        [Date.UTC(2015,2,8),0.9221],
        [Date.UTC(2015,2,9),0.9214],
        [Date.UTC(2015,2,10),0.9347],
        [Date.UTC(2015,2,11),0.9482],
        [Date.UTC(2015,2,12),0.9403],
        [Date.UTC(2015,2,13),0.9528],
        [Date.UTC(2015,2,15),0.9541],
        [Date.UTC(2015,2,16),0.9462],
        [Date.UTC(2015,2,17),0.9435],
        [Date.UTC(2015,2,18),0.9203],
        [Date.UTC(2015,2,19),0.9381],
        [Date.UTC(2015,2,20),0.9241],
        [Date.UTC(2015,2,22),0.9237],
        [Date.UTC(2015,2,23),0.9135],
        [Date.UTC(2015,2,24),0.9152],
        [Date.UTC(2015,2,25),0.9114],
        [Date.UTC(2015,2,26),0.9188],
        [Date.UTC(2015,2,27),0.9184],
        [Date.UTC(2015,2,29),0.9188],
        [Date.UTC(2015,2,30),0.9231],
        [Date.UTC(2015,2,31),0.9319],
        [Date.UTC(2015,3,1),0.9291],
        [Date.UTC(2015,3,2),0.9188],
        [Date.UTC(2015,3,3),0.9109],
        [Date.UTC(2015,3,5),0.9091],
        [Date.UTC(2015,3,6),0.9154],
        [Date.UTC(2015,3,7),0.9246],
        [Date.UTC(2015,3,8),0.9276],
        [Date.UTC(2015,3,9),0.9382],
        [Date.UTC(2015,3,10),0.9431],
        [Date.UTC(2015,3,12),0.9426],
        [Date.UTC(2015,3,13),0.9463],
        [Date.UTC(2015,3,14),0.9386],
        [Date.UTC(2015,3,15),0.9357],
        [Date.UTC(2015,3,16),0.9293],
        [Date.UTC(2015,3,17),0.9254],
        [Date.UTC(2015,3,19),0.9251],
        [Date.UTC(2015,3,20),0.9312],
        [Date.UTC(2015,3,21),0.9315],
        [Date.UTC(2015,3,22),0.9323],
        [Date.UTC(2015,3,23),0.9236],
        [Date.UTC(2015,3,24),0.9196],
        [Date.UTC(2015,3,26),0.9201],
        [Date.UTC(2015,3,27),0.9184],
        [Date.UTC(2015,3,28),0.9106],
        [Date.UTC(2015,3,29),0.8983],
        [Date.UTC(2015,3,30),0.8909],
        [Date.UTC(2015,4,1),0.8928],
        [Date.UTC(2015,4,3),0.8941],
        [Date.UTC(2015,4,4),0.8972],
        [Date.UTC(2015,4,5),0.8940],
        [Date.UTC(2015,4,6),0.8808],
        [Date.UTC(2015,4,7),0.8876],
        [Date.UTC(2015,4,8),0.8925],
        [Date.UTC(2015,4,10),0.8934],
        [Date.UTC(2015,4,11),0.8964],
        [Date.UTC(2015,4,12),0.8917],
        [Date.UTC(2015,4,13),0.8805],
        [Date.UTC(2015,4,14),0.8764],
        [Date.UTC(2015,4,15),0.8732],
        [Date.UTC(2015,4,17),0.8737],
        [Date.UTC(2015,4,18),0.8838],
        [Date.UTC(2015,4,19),0.8969],
        [Date.UTC(2015,4,20),0.9014],
        [Date.UTC(2015,4,21),0.8999],
        [Date.UTC(2015,4,22),0.9076],
        [Date.UTC(2015,4,24),0.9098],
        [Date.UTC(2015,4,25),0.9110],
        [Date.UTC(2015,4,26),0.9196],
        [Date.UTC(2015,4,27),0.9170],
        [Date.UTC(2015,4,28),0.9133],
        [Date.UTC(2015,4,29),0.9101],
        [Date.UTC(2015,4,31),0.9126],
        [Date.UTC(2015,5,1),0.9151],
        [Date.UTC(2015,5,2),0.8965],
        [Date.UTC(2015,5,3),0.8871],
        [Date.UTC(2015,5,4),0.8898],
        [Date.UTC(2015,5,5),0.8999],
        [Date.UTC(2015,5,7),0.9004],
        [Date.UTC(2015,5,8),0.8857],
        [Date.UTC(2015,5,9),0.8862],
        [Date.UTC(2015,5,10),0.8829],
        [Date.UTC(2015,5,11),0.8882],
        [Date.UTC(2015,5,12),0.8873],
        [Date.UTC(2015,5,14),0.8913],
        [Date.UTC(2015,5,15),0.8862],
        [Date.UTC(2015,5,16),0.8891],
        [Date.UTC(2015,5,17),0.8821],
        [Date.UTC(2015,5,18),0.8802],
        [Date.UTC(2015,5,19),0.8808],
        [Date.UTC(2015,5,21),0.8794],
        [Date.UTC(2015,5,22),0.8818],
        [Date.UTC(2015,5,23),0.8952],
        [Date.UTC(2015,5,24),0.8924],
        [Date.UTC(2015,5,25),0.8925],
        [Date.UTC(2015,5,26),0.8955],
        [Date.UTC(2015,5,28),0.9113],
        [Date.UTC(2015,5,29),0.8900],
        [Date.UTC(2015,5,30),0.8950]
    ];

    Highcharts.theme = {
        colors: ["#006FB5", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            style: {
                fontFamily: "'Unica One', sans-serif"
            },
            plotBorderColor: '#606063'
        },
        title: {
            style: {
                color: '#E0E0E3',
                textTransform: 'uppercase',
                fontSize: '20px'
            }
        },
        subtitle: {
            style: {
                color: '#E0E0E3',
                textTransform: 'uppercase'
            }
        },
        xAxis: {
            gridLineColor: '#707073',
            labels: {
                style: {
                    color: '#E0E0E3'
                }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            title: {
                style: {
                    color: '#A0A0A3'

                }
            }
        },
        yAxis: {
            gridLineColor: '#191919',
            labels: {
                style: {
                    color: '#E0E0E3'
                }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            tickWidth: 0,
            title: {
                style: {
                    color: '#A0A0A3'
                }
            }
        },
        tooltip: {
            enabled: false
        },
        plotOptions: {
            series: {
                dataLabels: {
                    color: '#B0B0B3'
                },
                marker: {
                    lineColor: '#333'
                }
            },
            boxplot: {
                fillColor: '#505053'
            },
            candlestick: {
                lineColor: 'white'
            },
            errorbar: {
                color: 'white'
            }
        },
        legend: {
            itemStyle: {
                color: '#E0E0E3'
            },
            itemHoverStyle: {
                color: '#FFF'
            },
            itemHiddenStyle: {
                color: '#606063'
            }
        },
        credits: {
            style: {
                color: '#666'
            }
        },
        labels: {
            style: {
                color: '#707073'
            }
        },

        drilldown: {

        },

        navigation: {
            buttonOptions: {
                symbolStroke: '#DDDDDD',
                theme: {
                    fill: '#505053'
                }
            }
        },

        // scroll charts
        rangeSelector: {

        },

        navigator: {
            handles: {
                backgroundColor: '#666',
                borderColor: '#AAA'
            },
            outlineColor: '#CCC',
            maskFill: 'rgba(255,255,255,0.1)',
            series: {
                color: '#7798BF',
                lineColor: '#A6C7ED'
            },
            xAxis: {
                gridLineColor: '#505053'
            }
        },

        scrollbar: {
            barBackgroundColor: '#808083',
            barBorderColor: '#808083',
            buttonArrowColor: '#CCC',
            buttonBackgroundColor: '#606063',
            buttonBorderColor: '#606063',
            rifleColor: '#FFF',
            trackBackgroundColor: '#404043',
            trackBorderColor: '#404043'
        },

        // special colors for some of the
        legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
        background2: '#505053',
        dataLabelsColor: '#B0B0B3',
        textColor: '#C0C0C0',
        contrastTextColor: '#F0F0F3',
        maskColor: 'rgba(255,255,255,0.3)'
    };

// Apply the theme
    Highcharts.setOptions(Highcharts.theme);

    $('#p-chart').highcharts({
        credits: {
            enabled: false
        },
        chart: {
            zoomType: 'x'
        },
        title: {
            text: null
        },

        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: null
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            name: 'USD to EUR',
            data: data
        }]
    });

    var awNumber = new Odometer({
        el: $("#awardRemainNumber span")[0],
        value: 9999
    });
    var hoplessUsers = new Odometer({
        el: $("#hoplessUsers span")[0],
        value: 9999
    });
    setInterval(function () {
        awNumber.update(Math.round(Math.random() * 10000));
        hoplessUsers.update(Math.round(Math.random() * 80000))
    }, 2000);


    var tweenScale, tweenRotate;
    var position;
    var target = document.querySelector(".cover img");
    var middleHorizonal = window.innerWidth / 2;
    var middleVertical = window.innerHeight / 2;
    var imgSize = {
        x: 414, y: 244
    };


    animate();

    function init() {
        position = {scale: 0, rotate: 0, x: middleHorizonal, y: middleVertical};
        tweenScale = new TWEEN.Tween(position)
            .to({scale: 3, rotate: 0, x: (middleHorizonal - imgSize.x * 3 / 2), y: (middleVertical - imgSize.y * 3 / 2)}, 1000)
            .delay(500)
            .easing(TWEEN.Easing.Back.Out)
            .onUpdate(update);

        tweenRotate = new TWEEN.Tween(position)
            .to({scale: 0, rotate: 720, x: noBinggoOffset().left + 18, y: noBinggoOffset().top + 12}, 1000)
            .delay(800)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(update)
            .onComplete(addOwner);

        tweenScale.chain(tweenRotate);
//        tweenRotate.chain(tweenScale);

        tweenScale.start();
    }

    function animate(time) {
        requestAnimationFrame(animate);

        TWEEN.update(time);
    }

    function noBinggoOffset() {
        var offset = $(".nobingo:first").offset();
        return offset ? offset : {x: (middleHorizonal - imgSize.x * 0 / 2), y: (middleVertical - imgSize.y * 0 / 2)};
    }
    function update() {
        target.style.transform = "rotateZ(" + position.rotate + "deg)";
        target.style.width = imgSize.x * position.scale + "px";
        target.style.height = imgSize.y * position.scale + "px";
        target.style.left = position.x + "px";
        target.style.top = position.y + "px";
    }

    function addOwner() {
        console.log("done");

        var $quote = $(".nobingo:first").removeClass("nobingo").addClass("bingo").text("咬我呀2333");

        var mySplitText = new SplitText($quote, {type:"words"}),
            splitTextTimeline = new TimelineLite();

        TweenLite.set($quote, {perspective:400});

        mySplitText.split({type:"chars, words"});
        splitTextTimeline.staggerFrom(mySplitText.chars, 0.6, {scale:4, autoAlpha:0,  rotationX:-180,  transformOrigin:"100% 50%", ease:Back.easeOut}, 0.02);
    }

    $(document).keydown(function( event ) {
        if (event.which == 13) {
            event.preventDefault();
            if ($(".nobingo:first").length) {

                init();
            } else {
                tweenScale.stop();
            }
        }


    });
});