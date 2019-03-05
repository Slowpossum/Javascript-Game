//VARIABLES AND OBJECTS
var objects = {};
var details = { freePos: [0, 1, 2, 3, 4, 5, 6, 7] };
var teeth = {
    top: [],
    bottom: [],
    complete: 0
};
var gameBackground;
var backgroundGlow;
var blackOpac = 0;
var character;
var counter = 0;
var theme = "lighter";
var fontColor = "#000000";


// Object to hold details about the edge-glow.
var glow = {
    opacity: 0.9,
    nextOpacity: 0.4,
    update: function () {
        if (glow.opacity > glow.nextOpacity) {
            hangmanGame.canvas.getContext("2d").globalAlpha = glow.opacity;
            backgroundGlow.update();
            glow.opacity -= 0.01;
            glow.opacity = round(glow.opacity, 100);

            if (glow.opacity === glow.nextOpacity) {
                glow.nextOpacity = 0.9;
            }
        } else if (glow.opacity < glow.nextOpacity) {
            hangmanGame.canvas.getContext("2d").globalAlpha = glow.opacity;
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
    offscreenCanvas: document.createElement("canvas"),
    words: ["despair", "futility", "desperation", "anguish", "revulsion", "dread", "wretched", "writhe", "hopeless", "horror", "powerless", "horrendous"],
    currentWord: "",
    wordStatus: [],
    guessedLetters: [],
    status: "menu",
    frameCount: 1,
    menuPos: 0,
    guesses: 8,
    menuWave: 75,
    start: function () {
        this.canvas.width = 800;
        this.canvas.height = 500;
        this.canvas.classList.add("canvasFormatting");
        this.canvas.id = "gameCanvas";
        this.canvas.onclick = function click(e) {
            var canvasID = document.getElementById("gameCanvas");

            if (hangmanGame.status === "menu" && e.clientX > (objects.startButton.x + canvasID.offsetLeft) && e.clientX < (objects.startButton.x + canvasID.offsetLeft + 150) && e.clientY > 318 && e.clientY < 414 && hangmanGame.status === "menu") {
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
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    },
    resetVar: function () {
        this.guessedLetters = [];
        this.wordStatus = [];
        this.guesses = 8;
        this.menuPos = 0;
        theme = "lighter";
        fontColor = "#000000";
    }
};


// FUNCTIONS
// Starts the hangman game, creates objects for the background and glow, loads letters for the menu, and calls the start method,
// which formally creates the canvas, adds it to the body, and begins the loop to update the canvas.
function hangmanStart() {
    gameBackground = new Component(800, 500, `./assets/images/${theme}/background.png`, 0, 0);
    backgroundGlow = new Component(800, 500, `./assets/images/${theme}/glow.png`, 0, 0);
    character = new AnimatedItem(400, 400, `./assets/images/character/${theme}.png`, 0, 0);
    loadLetters();
    hangmanGame.start();
}

// Updates the canvas every 20ms, creating the animations and responding to user input.
function updateGameArea() {
    hangmanGame.canvas.getContext("2d").globalAlpha = 1;
    hangmanGame.updateFrameCount();
    hangmanGame.clear();
    gameBackground.update();

    if (hangmanGame.status === "menu") {
        updateLetters();

        updateDetails();
        glow.update();
    } else if (hangmanGame.status === "game") {
        updateAnimatedCharacter();
        updateScreen();
        checkState();

        updateDetails();
        glow.update();
    } else if (hangmanGame.status === "win") {
        updateAnimatedCharacter();
        updateScreen();
        winCondition();

        updateDetails();
        glow.update();
    } else if (hangmanGame.status === "lose") {
        glow.update();
        fadeToBlack();

        if (blackOpac === 1 && teeth.bottom.length === 0 && teeth.top.length === 0) {
            loadTeeth();
        } else if (teeth.bottom.length > 0 && teeth.top.length > 0) {
            bite();
        }

        if (teeth.complete === 1) {
            loseCondition();
        }
    }
}

// Constructor function to create Components, which are general elements on the page that will be manipulated by the user.
function Component(width, height, src, x, y) {
    this.image = new Image();
    this.image.src = src;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = hangmanGame.canvas.getContext("2d");
        ctx.drawImage(this.image,
            this.x,
            this.y,
            this.width, this.height);
    }
}

// Constructor function to create detail objects, which are small details that start offscreen and float to a random point
// onscreen before disappearing.
function DetailObject(src) {
    this.image = new Image();
    this.image.src = src;
    this.width = 75;
    this.height = 75;
    this.x = Math.floor(Math.random() * 750) + 25;
    this.y = 510;
    this.opac = 1;
    this.yDest = Math.floor(Math.random() * 200) + 100;
    this.update = function () {
        this.opac = 1 - (this.yDest / this.y);
        ctx = hangmanGame.canvas.getContext("2d");
        ctx.globalAlpha = this.opac;
        ctx.drawImage(this.image,
            this.x,
            this.y,
            this.width, this.height);
        ctx.globalAlpha = 1;
    }
}


// Constructor function for animated item
function AnimatedItem(width, height, src, x, y) {
    this.image = new Image();
    this.image.src = src;
    this.width = width;
    this.height = height;
    this.frame = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = hangmanGame.canvas.getContext("2d");
        ctx.drawImage(this.image,
            this.x,
            this.y,
            this.width, this.height);
    }
}

// Constructor function for... uh, teeth.
function Teeth(src, x, y) {
    this.image = new Image();
    this.image.src = src;
    this.width = 75;
    this.height = 175;
    this.frame = 0;
    this.x = x;
    this.y = y;
    this.yDest = 200;
    this.steps = 40;
    this.yChange = (this.yDest - this.y) / this.steps;
    this.update = function () {
        ctx = hangmanGame.canvas.getContext("2d");
        ctx.drawImage(this.image,
            this.x,
            this.y,
            this.width, this.height);
    }
}


//
//
// MENU FUNCTIONS
//
//
// Function called to load teeth.
function loadTeeth() {
    for (var i = 0; i < 8; i++) {
        teeth.top[i] = new Teeth(`./assets/images/teeth/top/${i + 1}.png`, 160 + (50 * i), -270);
    }

    for (i = 0; i < 8; i++) {
        teeth.bottom[i] = new Teeth(`./assets/images/teeth/bottom/${i + 1}.png`, 170 + (47 * i), 1000);
    }
}

// Function called at start to load letters for the menu into objects{}.
function loadLetters() {
    var hangman = "hangman";

    for (var i = 0; i < 7; i++) {
        objects[i] = new Component(120, 120, `./assets/images/letters/${hangman[i]}.png`, (10 + (i * 110)), -250);
        objects[i].offset = 50;
        objects[i].letterWave = 0;
        objects[i].waveDir = "up";
        objects[i].delay = 5 * i;
    }

    objects.startButton = new Component(150, 75, "./assets/images/letters/start.png", 325, 300);
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
    ctx = hangmanGame.canvas.getContext("2d");

    if (Object.keys(details).length <= 8 && hangmanGame.frameCount % 25 === 0) {
        if (Math.floor(Math.random() * 100) + 1 >= 50) {
            details[details.freePos[0]] = new DetailObject(`./assets/images/${theme}/detail${Math.floor(Math.random() * 2) + 1}.png`);
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

// Function to round used in glow.update() method, because I was running into odd rounding errors with adding/subtracting 0.01.
function round(num, amount) {
    return (Math.round(num * amount) / amount);
}


//
//
//  GAME FUNCTIONS
//
//
// Onkeyup event to handle user input.
document.onkeyup = function (e) {
    var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

    if (hangmanGame.status === "game" && hangmanGame.guesses > 0) {
        if (hangmanGame.currentWord.indexOf(e.key) !== -1) {
            for (var i = 0; i < hangmanGame.currentWord.length; i++) {
                if (hangmanGame.currentWord[i] === e.key) {
                    hangmanGame.wordStatus[i] = e.key;

                    if (hangmanGame.guessedLetters.indexOf(e.key) === -1) {
                        hangmanGame.guessedLetters.push(e.key);
                    }
                }
            }
        } else {
            if (hangmanGame.guessedLetters.indexOf(e.key) === -1 && alphabet.indexOf(e.key) !== -1) {
                hangmanGame.guessedLetters.push(e.key);
                hangmanGame.guesses--;
            }
        }

        if (hangmanGame.wordStatus.join("") === hangmanGame.currentWord) {
            hangmanGame.status = "win";
        } else if (hangmanGame.guesses === 0) {
            hangmanGame.status = "lose";
        }
    }
}

// Function to update the screen during the "game" status, adding guessed letters, decrementing
// guesses when a failed letter is chosen, and updating the word as correct letters are guessed
function updateScreen() {
    var ctx = hangmanGame.canvas.getContext("2d");
    ctx.font = "50px Rock Salt";
    ctx.fillStyle = fontColor;

    ctx.textAlign = "center";
    ctx.fillText(`${hangmanGame.wordStatus.join(" ")}`, hangmanGame.canvas.width / 2, 400);

    if (hangmanGame.guessedLetters.length !== 0) {
        ctx.font = "30px Rock Salt";
        ctx.textAlign = "start";
        ctx.fillText(`${hangmanGame.guessedLetters.join(" ")}`, 30, 470);
    }

    ctx.font = "75px Rock Salt";
    ctx.textAlign = "center";
    ctx.fillText(`${hangmanGame.guesses}`, 400, 300);
    ctx.font = "20px Rock Salt";
    ctx.fillText("guesses remaining", 400, 350);
}

// Checks how many guesses are remaining and updates the theme accordingly
function checkState() {
    if (hangmanGame.guesses > 6 && hangmanGame.guesses <= 8) {
        theme = "lighter";
        fontColor = "#000000";
    } else if (hangmanGame.guesses > 4 && hangmanGame.guesses <= 6) {
        theme = "light";
        fontColor = "#000000";
        gameBackground = new Component(800, 500, `./assets/images/${theme}/background.png`, 0, 0);
        backgroundGlow = new Component(800, 500, `./assets/images/${theme}/glow.png`, 0, 0);
        character = new AnimatedItem(400, 400, `./assets/images/character/${theme}.png`, 0, 0);
    } else if (hangmanGame.guesses > 2 && hangmanGame.guesses <= 4) {
        theme = "dark";
        fontColor = "#490e06";
        gameBackground = new Component(800, 500, `./assets/images/${theme}/background.png`, 0, 0);
        backgroundGlow = new Component(800, 500, `./assets/images/${theme}/glow.png`, 0, 0);
        character = new AnimatedItem(400, 400, `./assets/images/character/${theme}.png`, 0, 0);
    } else if (hangmanGame.guesses > 0 && hangmanGame.guesses <= 2) {
        theme = "darker";
        fontColor = "#871000";
        gameBackground = new Component(800, 500, `./assets/images/${theme}/background.png`, 0, 0);
        backgroundGlow = new Component(800, 500, `./assets/images/${theme}/glow.png`, 0, 0);
        character = new AnimatedItem(400, 400, `./assets/images/character/${theme}.png`, 0, 0);
    }
}

// Animates the tiny character during game
function updateAnimatedCharacter() {
    var ctx = hangmanGame.canvas.getContext("2d");

    ctx.drawImage(character.image, 400 * character.frame, 0, 400, 400, 310, 15, 200, 200);

    if (hangmanGame.frameCount % 25 === 0) {
        if (character.frame === 0) {
            character.frame++;
        } else {
            character.frame = 0;
        }
    }
}

// Notifies of victory, resets variables, and returns to menu
function winCondition() {
    var ctx = hangmanGame.canvas.getContext("2d");

    if (counter < 3) {
        ctx.font = ctx.font = "125px Rock Salt";
        ctx.textAlign = "center";
        ctx.fillStyle = "#f2042c";
        ctx.fillText(`YOU WIN!`, 400, 250);
    } else {
        resetAll();
    }

    if (hangmanGame.frameCount === 50) {
        counter++;
    }
}

// Notifies of loss and presents loss screen before resetting variables and returning to menu
function loseCondition() {
    teeth = {
        top: [],
        bottom: [],
        complete: 0
    };
    resetAll();
    counter = 0;
}

// Fades screen to black
function fadeToBlack() {
    var ctx = hangmanGame.canvas.getContext("2d");

    if (hangmanGame.frameCount % 2 === 0) {
        if (blackOpac < 1) {
            blackOpac = round(blackOpac + 0.025, 1000);
        }
    }

    if (blackOpac > 1) {
        blackOpac = 1;
    }

    ctx.globalAlpha = blackOpac;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, hangmanGame.canvas.width, hangmanGame.canvas.height);
    ctx.fillStyle = fontColor;
    ctx.globalAlpha = 1;
}

// Bite.
function bite() {
    var ctx = hangmanGame.canvas.getContext("2d");

    if (teeth.top[4].y < 140) {
        ctx.font = ctx.font = "50px Rock Salt";
        ctx.textAlign = "center";
        ctx.fillStyle = "#f2042c";
        ctx.fillText(`you lose...`, 400, 300);
    }

    if (counter >= 3 && teeth.complete === 0) {
        for (var i = 0; i < 8; i++) {
            teeth.bottom[i].update();

            if (teeth.bottom[i].y + teeth.bottom[i].yChange > teeth.top[i].yDest) {
                teeth.bottom[i].y += teeth.bottom[i].yChange;
            } else {
                teeth.complete = 1;
            }  
        }

        for (var n1 = 0, n2 = 7; n1 <= 3; n1++) {
            teeth.top[n1].update();
            teeth.top[n2].update();

            if (teeth.top[n1].y + teeth.top[n1].yChange < teeth.top[n1].yDest) {
                teeth.top[n1].y += teeth.top[n1].yChange;
                teeth.top[n2].y += teeth.top[n2].yChange;
            }
            n2--;
        }
    } else {
        if (hangmanGame.frameCount === 50) {
            counter++;
        }
    }
}

// Function to reset variables used in winCondition() and loseCondition()
function resetAll() {
    counter = 0;
    hangmanGame.resetVar();
    hangmanGame.resetObj();
    loadLetters();
    gameBackground.image.src = `./assets/images/${theme}/background.png`;
    backgroundGlow.image.src = `./assets/images/${theme}/glow.png`;
    character.image.src = `./assets/images/character/${theme}.png`;
    hangmanGame.status = "menu";
}