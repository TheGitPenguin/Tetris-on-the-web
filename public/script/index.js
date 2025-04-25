let board = document.getElementById('tetris-canvas');
const boardBis = document.getElementById('tetris-canvas').cloneNode(true);
const scoreElement = document.getElementById('score-value');
const loadMenu = document.getElementById('load-menu');
const mainMenu = document.getElementById('main-menu');
const pauseMenu = document.getElementById('pause-menu');

const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

let preview = document.getElementById('preview-canvas');
const previewBis = document.getElementById('preview-canvas').cloneNode(true);

const gameOverMenu = document.getElementById('game-over-menu');
const restartButton = document.getElementById('restart-button');

const boardContainer = document.getElementById('board-container');
const previewContainer = document.getElementById('preview-container');

const buttonContainer = document.getElementById('pause-container');

restartButton.addEventListener('click', () =>
{
    displayGameBoard();
    startGame();
    refresh();
}
);

startButton.addEventListener('click', () =>
{
    startGame();
});

pauseButton.addEventListener('click', () =>
{
    pauseGame();
});

let boardContext = board.getContext('2d');
let previewContext = preview.getContext('2d');

boardContext.fillStyle = 'black';
boardContext.fillRect(0, 0, board.width, board.height);

const img = new Image();
img.src = '../img/PieceTetris.png';

let endDownInterval;

let oppacity = 255;

let downInterval;

let rightInterval;

let leftInterval;

let keyPress = [];

let score = 0;
let level = 0;
let lines = 0;
let speed = 1000;

let pause = false;
let gameOver = true;

const templatePiece = [
    [ // ok
        [3, 0],
        [4, 0],
        [5, 0],
        [6, 0],
        [4.5, 0.5]
    ],
    [ 
        [3, 1],
        [4, 1],
        [5, 1],
        [5, 0],
        [4, 1]
    ],
    [ // ok
        [3, 1],
        [4, 1],
        [5, 1],
        [3, 0],
        [4, 1]
    ],
    [ // ok
        [3, 0],
        [4, 0],
        [4, 1],
        [5, 1],
        [4, 1]
    ],
    [
        [3, 1],
        [4, 1],
        [4, 0],
        [5, 0],
        [4, 1]
    ],
    [ // ok
        [3, 0],
        [4, 0],
        [4, 1],
        [5, 0],
        [4, 0]
    ],
    [ // ok
        [4, 0],
        [5, 0],
        [4, 1],
        [5, 1],
        [4.5, 0.5]
    ]
];

const templateColor = [
    [240, 87, 84, 255],
    [254, 223, 92, 255],
    [27, 148, 118, 255],
    [36, 115, 155, 255],
    [106, 190, 178, 255],
    [164, 199, 218, 255],
    [177, 225, 218, 255]
];

const speedSecondsToBotomPerLevel = [
    15.974, //0
    14.31,  //1
    12.646, //2
    10.982, //3
    9.318,  //4
    7.654,  //5
    5.99,   //6
    4.326,  //7
    2.662,  //8
    1.997,  //9
    1.664,  //10
    1.664,  //11
    1.664,  //12
    1.331,  //13
    1.331,  //14
    1.331,  //15
    0.998,  //16
    0.998,  //17
    0.998,  //18
    0.666,  //19
    0.666,  //20
    0.666,  //21
    0.666,  //22
    0.666,  //23
    0.666,  //24
    0.666,  //25
    0.666,  //26
    0.666,  //27
    0.666,  //28
    0.333   //29
];

let currentPiece = [];
let nextPiece = [];
let color = [];
let nextColor = [];

let boardData = [];

const MOVELEFT = 1;
const MOVERIGHT = 2;
const MOVEDOWN = 3;
const ROTATE = 4;
const MOVEDOWNFAST = 5;
const RESPAWN = 6;

let history = [];

function startGame() {
    pause = false;
    gameOver = false;

    boardData = [];
    currentPiece = [];
    color = [];
    history = [];

    for (let i = 0; i < 10; i++) {
        boardData[i] = [];
        for (let j = 0; j < 20; j++) {
            boardData[i][j] = [0, 0, 0, 255];
        }
    }

    score = 0;
    lines = 0;
    level = 0;
    speed = 1000;
    scoreElement.innerText = score;
    
    displayGameBoard();

    iniGame();

    refresh();
}

function pauseGame() {
    if (gameOver) {
        return;
    }

    if (pause) {
        pause = false;
        displayGameBoard();
        //initAndChangeSpeedDrop();
    } else {
        pause = true;
        displayPause();
        clearDownInterval();
        clearInterval(endDownInterval);
    }
}

function iniGame() {
    // Initialisation de la vitesse de chute
    speed = (speedSecondsToBotomPerLevel[level]/20) * 1000;

    spawnPiece();

    // Intervalle pour faire tomber la pièce
    downInterval = setInterval(() => {
        moveDown();

        refresh();
    }, speed);
}

function loadTetris() {
    clearDownInterval();
    clearInterval(endDownInterval);
    oppacity = 255;

    currentPieceToBoard();
    checkLine();
    spawnPiece();

    checkEndDrop();
}

function currentPieceToBoard() {
    if (currentPiece.length != 0) {
        for (let i = 0; i < currentPiece.length - 1; i++) {
            let piece = currentPiece[i];
            boardData[piece[0]][piece[1]] = color; // Copie du tableau color
        }
    }
}

function spawnPiece() {
    const random = Math.floor(Math.random() * templatePiece.length);

    if (nextPiece.length == 0) {
        for (let i = 0; i < templatePiece[random].length; i++) {
            nextPiece.push([templatePiece[random][i][0], templatePiece[random][i][1]]);
        }
        nextColor = templateColor[random];
    }
    currentPiece = nextPiece;

    for (let i = 0; i < currentPiece.length - 1; i++) {
        if (boardData[currentPiece[i][0]][currentPiece[i][1]][0] != 0 && 
            boardData[currentPiece[i][0]][currentPiece[i][1]][1] != 0 && 
            boardData[currentPiece[i][0]][currentPiece[i][1]][2] != 0) {

            gameOver = true;
            clearDownInterval();
            clearInterval(endDownInterval);
            oppacity = 255;
            displayGameOver();
            return;
        }
    }
    
    nextPiece = [];

    for (let i = 0; i < templatePiece[random].length; i++) {
        nextPiece.push([templatePiece[random][i][0], templatePiece[random][i][1]]);
    }

    color = nextColor;
    nextColor = templateColor[random];

    history.push([RESPAWN, random]);
}


function ifMoveTo(x, y) {
    return canMoveTo(x, y, currentPiece);
}

function canMoveTo(x, y, piece) {
    for (let i = 0; i < piece.length - 1; i++) {
        if (piece[i][0] + x < 0 || piece[i][0] + x >= 10 || piece[i][1] + y >= 20 || ifPiece(piece[i][0] + x, piece[i][1] + y)) {
            return false;
        }
    }
    return true;
}

function ifRotate(piece) {
    for (let i = 0; i < piece.length - 1; i++) {
        if (piece[i][0] < 0 || piece[i][0] >= 10 || piece[i][1] >= 20 || ifPiece(piece[i][0], piece[i][1])) {
            return false;
        }
    }
    return true;
}

function ifPiece(x, y) {
    if (x < 0 || x >= 10 || y >= 20) {
        return true;
    }

    if (y < 0) {
        return false;
    }

    if (boardData[x][y][0] == 0 && boardData[x][y][1] == 0 && boardData[x][y][2] == 0) {
        return false;
    }

    return true;
}

function rotate() {
    if (currentPiece.length == 0) {
        return;
    }

    let currentPieceCopy = [];

    for (let i = 0; i < currentPiece.length; i++) {
        currentPieceCopy.push([currentPiece[i][0], currentPiece[i][1]]);
    }

    const center = currentPieceCopy[currentPieceCopy.length - 1];
    for (let i = 0; i < currentPiece.length - 1; i++) {
        const x = currentPieceCopy[i][0] - center[0];
        const y = currentPieceCopy[i][1] - center[1];

        currentPieceCopy[i][0] = center[0] - y;
        currentPieceCopy[i][1] = center[1] + x;
    }

    
    if (ifRotate(currentPieceCopy)) {
        currentPiece = currentPieceCopy;
        history.push([ROTATE, 0]);
    }
    else {
        for (let x = -1; x <= 1; x++) {
            for (let y = 0; y >= -1; y--) {
                if (canMoveTo(x, y, currentPieceCopy)) {
                    moveToPiece(x, y, currentPieceCopy);
                    currentPiece = currentPieceCopy;

                    history.push([ROTATE, 0]);
                    
                    x = 2;
                    y = -2;
                }
            }
        }
    }

    checkEndDrop();
}

function checkEndDrop() {
    clearInterval(endDownInterval); 
    oppacity = 255;

    if (!ifMoveTo(0, 1)) {
        clearDownInterval();

        endDownInterval = setInterval(() => {
            oppacity -= 5;

            if (oppacity <= 60) {
                loadTetris();
            }

            refresh();
        }
        , 11);
    }
    else if (!downInterval) {
        clearDownInterval();

        initAndChangeSpeedDrop();
    }
}

function clearDownInterval() {
    clearInterval(downInterval);
    downInterval = null;
}

function checkLine() {
    let lineFilled = 0;

    for (let i = 0; i < 20; i++) {
        let check = true;

        for (let j = 0; j < 10; j++) {
            if (boardData[j][i][0] == 0 && boardData[j][i][1] == 0 && boardData[j][i][2] == 0) {
                check = false;
                break;
            }
        }

        if (check) {
            for (let j = i; j > 0; j--) {
                for (let k = 0; k < 10; k++) {
                    boardData[k][j] = boardData[k][j - 1];
                }
            }

            for (let k = 0; k < 10; k++) {
                boardData[k][0] = [0, 0, 0, 255];
            }

            lineFilled++;
        }
    }

    if (lineFilled == 1) {
        score += 40;
    }
    else if (lineFilled == 2) {
        score += 100;
    }
    else if (lineFilled == 3) {
        score += 300;
    }
    else if (lineFilled == 4) {
        score += 1200;
    }

    scoreElement.innerText = score;
    lines += lineFilled;
    level = Math.floor(lines / 10);
    initAndChangeSpeedDrop();
}

function initAndChangeSpeedDrop() {
    if (level > 29) {
        speed = (speedSecondsToBotomPerLevel[29]/20) * 1000;
    } 
    else {
        speed = (speedSecondsToBotomPerLevel[level]/20) * 1000;
    }
    clearDownInterval();
    downInterval = setInterval(() => {
        moveDown();

        refresh();
    }, speed);
}

function moveTo(x, y) {
    moveToPiece(x, y, currentPiece);
}

function moveToPiece(x, y, piece) {
    for (let i = 0; i < piece.length; i++) {
        piece[i][0] += x;
        piece[i][1] += y;
    }

    checkEndDrop();
}

function moveDown() {
    if (!ifMoveTo(0, 1) || currentPiece.length == 1) {
        return false;
    }

    moveTo(0, 1);

    history.push([MOVEDOWN, 0]);

    return true;
}

function moveLeft() {
    if (!ifMoveTo(-1, 0) || currentPiece.length == 1) {
        return false;
    }

    moveTo(-1, 0);

    history.push([MOVELEFT, 0]);

    return true;
}

function moveRight() {
    if (!ifMoveTo(1, 0) || currentPiece.length == 1) {
        return false;
    }

    moveTo(1, 0);
    history.push([MOVERIGHT, 0]);

    return true;
}

function fasteDrop() {
    while (ifMoveTo(0, 1)) {
        moveDown();
    }

    clearDownInterval();
    clearInterval(endDownInterval);
    oppacity = 255;

    loadTetris();
    history.push([MOVEDOWNFAST, 0]);
}

document.addEventListener('keydown', (event) => {
    if (event.key == 'Escape' && !keyPress.includes('Escape')) {
        pauseGame();
        return;
    }
    if (pause) {
        return;
    }
    if (gameOver) {
        return;
    }

    if ((event.key == 'ArrowUp' || event.key == 'w' || event.key == 'z') && !keyPress.includes('ArrowUp') && !keyPress.includes('w') && !keyPress.includes('z')) {
        rotate();
    } else if ((event.key == 'ArrowDown' || event.key == 's') && !keyPress.includes('ArrowDown') && !keyPress.includes('s')) {
        clearDownInterval();
        downInterval = setInterval(() => {
            moveDown();
            
            refresh();
        }, 50);
    } else if ((event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'q') && !keyPress.includes('ArrowLeft') && !keyPress.includes('q') && !keyPress.includes('a')) {
        moveLeft();

        leftInterval = setInterval(() => {
            moveLeft();

            refresh();
        }, 100);
    } else if (((event.key == 'ArrowRight') || event.key == 'd') && !keyPress.includes('ArrowRight') && !keyPress.includes('d')) {
        moveRight();

        rightInterval = setInterval(() => {
            moveRight();
            refresh();
        }, 100);
    } else if (event.key == ' ' && !keyPress.includes(' ')) {
        fasteDrop();
    }

    refresh();

    console.log(event.key);

    keyPress.push(event.key);
});

document.addEventListener('keyup', (event) => {
    if (pause) {
        return;
    }
    if (gameOver) {
        return;
    }
    if (event.key == 'ArrowDown' || event.key == 's') {
        initAndChangeSpeedDrop();
    } else if (event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'q') {
        clearInterval(leftInterval);
    } else if (event.key == 'ArrowRight' || event.key == 'd') {
        clearInterval(rightInterval);
    }

    keyPress = keyPress.filter((key) => {
        return key != event.key;
    });
});

img.onload = () => {
    displayMainMenu();
}