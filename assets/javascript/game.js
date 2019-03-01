//VARIABLES AND OBJECTS
var objects = {};
var details = {};
var theme = "light";
var themeMod = "est";

var glow = {
    opacity: 0.9,
    nextOpacity: 0.4,
    update: function () {
        if (glow.opacity > glow.nextOpacity) {
            hangmanGame.context.globalAlpha = glow.opacity;
            backgroundGlow.update();
            glow.opacity -= 0.01;
            glow.opacity = round(glow.opacity, 100);

            if (glow.opacity === glow.nextOpacity) {
                glow.nextOpacity = 0.9;
            }
        } else if (glow.opacity < glow.nextOpacity) {
            hangmanGame.context.globalAlpha = glow.opacity;
            backgroundGlow.update();
            glow.opacity += 0.01;
            glow.opacity = round(glow.opacity, 100);

            if (glow.opacity === glow.nextOpacity) {
                glow.nextOpacity = 0.1;
            }
        }
    }
};

var hangmanGame = {
    canvas: document.createElement("canvas"),
    status: "menu",
    frameCount: 1,
    menuPos: 0,
    guesses: 10,
    menuWave: 75,
    start: function () {
        this.canvas.width = 800;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        this.canvas.classList.add("canvasFormatting");
        this.canvas.onclick = function test(e) {
            if (e.clientX > 528 && e.clientX < 723 && e.clientY > 318 && e.clientY < 414 && hangmanGame.status === "menu") {
                hangmanGame.status = "game";
                hangmanGame.reset();
            }
        };
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    updateFrameCount: function () {
        if ((this.frameCount + 1) <= 50) {
            this.frameCount++;
        } else {
            this.frameCount = 1;
        }
    },
    reset: function () {
        objects = {};
    }
};


//FUNCTIONS
function hangmanStart() {
    gameBackground = new component(800, 500, `./assets/images/${theme + themeMod}/background.png`, 0, 0, "image");
    backgroundGlow = new component(800, 500, `./assets/images/${theme + themeMod}/glow.png`, 0, 0, "image");
    loadLetters();
    hangmanGame.start();
}

function updateGameArea() {
    hangmanGame.context.globalAlpha = 1;
    hangmanGame.updateFrameCount();
    hangmanGame.clear();
    gameBackground.update();

    if (hangmanGame.status === "menu") {
        updateLetters();
    } else if (hangmanGame.status === "game") {
        //do game
    }

    // details.update();
    glow.update();
}

function component(width, height, src, x, y, type) {
    this.type = type;
    if (type === "image") {
        this.image = new Image();
        this.image.src = src;
    }
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = hangmanGame.context;
        if (type === "image") {
            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.width, this.height);
        } else {
            ctx.fillStyle = src;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

function loadLetters() {
    var hangman = "hangman";

    for (var i = 0; i < 7; i++) {
        objects[i] = new component(120, 120, `./assets/images/letters/${hangman[i]}.png`, (10 + (i * 110)), -250, "image");
        objects[i].offset = 50;
        objects[i].letterWave = 0;
        objects[i].waveDir = "up";
        objects[i].delay = 5 * i;
    }

    objects.startButton = new component(200, 100, "./assets/images/letters/start.png", 300, 300, "image");
}

function updateLetters() {
    for (var i = 0; i < Object.keys(objects).length - 1; i++) {
        if (hangmanGame.menuPos === 0) {
            if (objects[i].y !== 100) {
                objects[i].y += 5;
            } else {
                hangmanGame.menuPos = 1;
            }
        } else {
            if (hangmanGame.menuWave === 0 && objects[i].letterWave === 0) {
                hangmanGame.menuWave = 75;
                for (var n = 0; n < Object.keys(objects).length - 1; n++) {
                    objects[n].letterWave = 1;
                }
            } else {
                if (objects[i].delay !== 0 && objects[i].letterWave === 1) {
                    objects[i].delay--;
                } else {
                    if (objects[i].waveDir === "up" && objects[i].y !== 70 && objects[i].letterWave === 1) {
                        objects[i].y -= 2;
                        if (objects[i].y <= 70) {
                            objects[i].waveDir = "down";
                        }
                    } else if (objects[i].waveDir === "down" && objects[i].y !== 100 && objects[i].letterWave === 1) {
                        objects[i].y += 2;
                    } else if (objects[i].waveDir === "down" && objects[i].y >= 100) {
                        objects[i].letterWave = 0;
                        objects[i].delay = 5 * i;
                        objects[i].waveDir = "up";
                    }
                }
            }
        }

        objects[i].update();
    }

    if (hangmanGame.menuWave > 0 && objects[6].letterWave !== 1) {
        hangmanGame.menuWave--;
    }

    objects.startButton.update();
}

function round(num, amount) {
    return (Math.round(num * amount) / amount);
}