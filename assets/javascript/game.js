//VARIABLES AND OBJECTS
var objects = {};
var details = { freePos: [0, 1, 2, 3, 4, 5, 6, 7] };
var gameBackground;
var backgroundGlow;
var theme = "light";
var themeMod = "est";


// Object to hold details about the edge-glow.
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

// Object to hold details about game, canvas information, and general methods.
var hangmanGame = {
    canvas: document.createElement("canvas"),
    words: ["despair", "futility", "desperation", "anguish", "revulsion", "dread", "wretched", "writhe", "hopeless", "horror", "powerless", "horrendous"],
    currentWord: "",
    wordStatus: [],
    guessedLetters: [],
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
                hangmanGame.resetObj();
                hangmanGame.currentWord = hangmanGame.words[Math.floor(Math.random() * hangmanGame.words.length)];
                for (var i = 0; i < hangmanGame.currentWord.length; i++) {
                    hangmanGame.wordStatus[i] = "_";
                }
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
    resetObj: function () {
        objects = {};
        details = { freePos: [0, 1, 2, 3, 4] };
    }
};


// FUNCTIONS
// Starts the hangman game, creates objects for the background and glow, loads letters for the menu, and calls the start method,
// which formally creates the canvas, adds it to the body, and begins the loop to update the canvas.
function hangmanStart() {
    gameBackground = new Component(800, 500, `./assets/images/${theme + themeMod}/background.png`, 0, 0, "image");
    backgroundGlow = new Component(800, 500, `./assets/images/${theme + themeMod}/glow.png`, 0, 0, "image");
    loadLetters();
    hangmanGame.start();
}

// Updates the canvas every 20ms, creating the animations and responding to user input.
function updateGameArea() {
    hangmanGame.context.globalAlpha = 1;
    hangmanGame.updateFrameCount();
    hangmanGame.clear();
    gameBackground.update();

    if (hangmanGame.status === "menu") {
        updateLetters();
    } else if (hangmanGame.status === "game") {
        //display top animation
        //display word
        //display guesses
        //display guessed letters
    }

    updateDetails();
    glow.update();
}

// Constructor function to create Components, which are general elements on the page that will be manipulated by the user.
function Component(width, height, src, x, y, type) {
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

// Constructor function to create detail objects, which are small details that start offscreen and float to a random point
// onscreen before disappearing.
function DetailObject(src) {
    this.image = new Image();
    this.image.src = src;
    this.width = 75;
    this.height = 75;
    this.x = Math.floor(Math.random() * 600) + 100;
    this.y = 510;
    this.opac = 1;
    this.yDest = Math.floor(Math.random() * 200) + 100;
    this.update = function () {
        this.opac = 1 - (this.yDest / this.y);
        ctx = hangmanGame.context;
        ctx.globalAlpha = this.opac;
        ctx.drawImage(this.image,
            this.x,
            this.y,
            this.width, this.height);
        ctx.globalAlpha = 1;
    }
}

// Function called at start to load letters for the menu into objects{}.
function loadLetters() {
    var hangman = "hangman";

    for (var i = 0; i < 7; i++) {
        objects[i] = new Component(120, 120, `./assets/images/letters/${hangman[i]}.png`, (10 + (i * 110)), -250, "image");
        objects[i].offset = 50;
        objects[i].letterWave = 0;
        objects[i].waveDir = "up";
        objects[i].delay = 5 * i;
    }

    objects.startButton = new Component(150, 75, "./assets/images/letters/start.png", 325, 300, "image");
    objects.startButton.state = "shrink";
}

// Moves letters into position for menu and waves them every few seconds.
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

    if (objects.startButton.state === "shrink") {
        if (objects.startButton.width - 1 >= 140) {
            objects.startButton.width -= 0.25;
            objects.startButton.height -= 0.125;
        } else {
            objects.startButton.state = "grow";
        }
    } else if (objects.startButton.state === "grow") {
        if (objects.startButton.width + 1 <= 150) {
            objects.startButton.width += .25;
            objects.startButton.height += 0.125;
        } else {
            objects.startButton.state = "shrink";
        }
    }
    objects.startButton.update();
}

// Creates and updates details as they disappear/move.
function updateDetails() {
    if (Object.keys(details).length <= 8 && hangmanGame.frameCount % 25 === 0) {
        if (Math.floor(Math.random() * 100) + 1 >= 50) {
            details[details.freePos[0]] = new DetailObject(`./assets/images/${theme + themeMod}/detail${Math.floor(Math.random() * 2) + 1}.png`);
            details.freePos.splice(0, 1);
        }
    }

    for (var i = 0; i < 8; i++) {
        if (details[i]) {
            if (details[i].y > details[i].yDest) {
                details[i].y -= 3;
            }

            details[i].update();

            if (details[i].y - 20 <= details[i].yDest) {
                details.freePos.push(i);
                delete details[i];
            }
        }
    }
}

// Onkeyup event to handle user input.
document.onkeyup = function (e) {

}

// Function to round used in glow.update() method, because I was running into odd rounding errors with adding/subtracting 0.01.
function round(num, amount) {
    return (Math.round(num * amount) / amount);
}