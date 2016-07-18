define(['underscore'], function (_) {

    var options = {
        number: 150,
        radius: [5, 30]
    }
    var canvas
    var ctx
    var particles = []
    var initCanvas = _.once(function () {
        canvas = document.createElement("canvas")
        $(canvas).css({
            position: "fixed",
            left: 0,
            top: 0,
            "z-index": -1
        })
        updateCanvasSize()
        $(window).resize(updateCanvasSize)
        document.body.appendChild(canvas)
        ctx = canvas.getContext("2d")
    })

    var initParticles = _.once(function () {
        for (var i = 0; i < options.number; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: _.random(options.radius[0], options.radius[1]),
                d: (Math.random() * options.number) + 10, //density
                color: "rgba(" + Math.floor((Math.random() * 255)) + ", " + Math.floor((Math.random() * 255)) + ", " + Math.floor((Math.random() * 255)) + ", 0.7)",
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngleIncremental: (Math.random() * 0.07) + .05,
                tiltAngle: 0
            });
        }
    })


    var play
    var stopPlay
    (function () {
        var animationFrameId
        play = function () {
            draw()
            moveDown()
            animationFrameId = requestAnimationFrame(play)
        }
        stopPlay = function () {
            cancelAnimationFrame(animationFrameId)
        }
    }())

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            ctx.beginPath();
            ctx.lineWidth = p.r / 2;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
            ctx.stroke();
        }
    }

    function moveDown() {
        var angle = moveDown.angle = moveDown.angle ? moveDown.angle + 0.01 : 0
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.tiltAngle += p.tiltAngleIncremental;
            //Updating X and Y coordinates
            //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
            //Every particle has its own density which can be used to make the downward movement different for each flake
            //Lets make it more random by adding in the radius
            p.y += (Math.cos(angle + p.d) + 1 + p.r / 2) / 2;
            p.x += Math.sin(angle);
            //p.tilt = (Math.cos(p.tiltAngle - (i / 3))) * 15;
            p.tilt = (Math.sin(p.tiltAngle - (i / 3))) * 15;

            //Sending flakes back from the top when it exits
            //Lets make it a bit more organic and let flakes enter from the left and right also.
            if (p.x > canvas.width + 5 || p.x < -5 || p.y > canvas.height) {
                if (i % 5 > 0 || i % 2 == 0) //66.67% of the flakes
                {
                    particles[i] = {
                        x: Math.random() * canvas.width,
                        y: -10,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: Math.floor(Math.random() * 10) - 10,
                        tiltAngle: p.tiltAngle,
                        tiltAngleIncremental: p.tiltAngleIncremental
                    };
                }
                else {
                    //If the flake is exitting from the right
                    if (Math.sin(angle) > 0) {
                        //Enter from the left
                        particles[i] = {
                            x: -5,
                            y: Math.random() * canvas.height,
                            r: p.r,
                            d: p.d,
                            color: p.color,
                            tilt: Math.floor(Math.random() * 10) - 10,
                            tiltAngleIncremental: p.tiltAngleIncremental
                        }
                    }
                    else {
                        //Enter from the right
                        particles[i] = {
                            x: canvas.width + 5,
                            y: Math.random() * canvas.height,
                            r: p.r,
                            d: p.d,
                            color: p.color,
                            tilt: Math.floor(Math.random() * 10) - 10,
                            tiltAngleIncremental: p.tiltAngleIncremental
                        }
                    }
                }
            }
        }
    }


    function updateCanvasSize() {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }

    // public
    var init = _.compose(function () {

    }, _.partial(_.extend, options))

    function start() {
        initCanvas()
        initParticles()
        play()
    }

    function stop() {
        stopPlay()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    return {
        init: init,
        start: start,
        stop: stop
    }

})


