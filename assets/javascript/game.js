var gameStatus;
var objects = {};
var theme = "light";

function hangmanStart() {
    gameBackground = new component(800, 500, hangmanGame.background, 0, 0, "image");
    loadLetters();
    hangmanGame.start();
}

var hangmanGame = {
    canvas: document.createElement("canvas"),
    status: "menu",
    background: `./assets/images/${theme}/background.png`,
    start: function () {
        this.canvas.width = 800;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        this.canvas.classList.add("canvasFormatting");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 200);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function updateGameArea() {
    hangmanGame.clear();
    gameBackground.update();
    updateLetters();
}

function component(width, height, src, x, y, type) {
    this.type = type;
    if (type === "image") {
        this.image = new Image();
        this.image.src = src;
    }
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
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

    for(var i = 0; i < 7; i++){
        objects[i] = new component(100, 100, `./assets/images/letters/${hangman[i]}.png`, (70 + (i * 110)), -250, "image");
    }
}

function updateLetters() {
    for(var i = 0; i < Object.keys(objects).length; i++) {
        if(objects[i].y <= 50) {
            objects[i].y += 5;
        }

        objects[i].update();
    }
}