const board = document.getElementById('tetris-canvas');
const scoreElement = document.getElementById('score-value');
const loadMenu = document.getElementById('load-menu');
const mainMenu = document.getElementById('main-menu');
const pauseMenu = document.getElementById('pause-menu');

const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

const preview = document.getElementById('preview-canvas');

startButton.addEventListener('click', () =>
{
    startGame();
});

pauseButton.addEventListener('click', () =>
{
    pauseGame();
});

const boardContext = board.getContext('2d');
const previewContext = preview.getContext('2d');

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
let gameOver = false;

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
    [255, 0, 0, 255],
    [0, 255, 0, 255],
    [0, 0, 255, 255],
    [255, 255, 0, 255],
    [0, 255, 255, 255],
    [255, 0, 255, 255],
    [255, 40, 130, 255]
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
    
    mainMenu.classList.add('hidden');
    loadMenu.classList.add('hidden');
    board.classList.add('hidden');
    
    board.classList.remove('hidden');

    iniGame();

    refresh();
}

function pauseGame() {
    if (pause) {
        pause = false;
        initAndChangeSpeedDrop();
    } else {
        pause = true;
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

function drawTetisWithOppacity(x, y, color, oppacity) {
    boardContext.drawImage(img, x, y, board.width/10, board.width/10);

    const imageData = boardContext.getImageData(x, y, board.width/10, board.width/10);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * color[0] / 255;
        data[i + 1] = data[i + 1] * color[1] / 255;
        data[i + 2] = data[i + 2] * color[2] / 255;
        data[i + 3] = data[i + 3] * oppacity / 255;
    }

    boardContext.putImageData(imageData, x, y);
}

function drawTetrisOnThePreview(x, y, color) {
    let width = 0;
    let height = 0;

    for (let i = 0; i < nextPiece.length - 1; i++) {
        let piece = nextPiece[i];
        width = Math.max(width, piece[0]);
        height = Math.max(height, piece[1]);
    }

    x = x + (preview.width/5 - width * preview.width/5) / 2;
    y = y + (preview.height/5 - height * preview.width/10) / 2;

    previewContext.drawImage(img, x, y, preview.width/5, preview.width/5);

    const imageData = previewContext.getImageData(x, y, preview.width/5, preview.width/5);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * color[0] / 255;
        data[i + 1] = data[i + 1] * color[1] / 255;
        data[i + 2] = data[i + 2] * color[2] / 255;
        data[i + 3] = data[i + 3] * color[3] / 255;
    }

    previewContext.putImageData(imageData, x, y);
}


function drawTetris(x, y, color) {
    drawTetisWithOppacity(x, y, color, 255);
}

function drawCurrentPiece() {
    for (let i = 0 ; i < currentPiece.length - 1; i++) {
        let piece = currentPiece[i];
        drawTetisWithOppacity(piece[0] * board.width/10, piece[1] * board.width/10, color, oppacity);
    }
}

function drawBoard() {
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
            if (!(boardData[i][j][0] == 0 && boardData[i][j][1] == 0 && boardData[i][j][2] == 0)) {
                drawTetris(i * board.width/10, j * board.width/10, boardData[i][j]);
            }
        }
    }
}

function clearBoard() {
    boardContext.fillStyle = 'black';
    boardContext.fillRect(0, 0, board.width, board.height);
}

function drawGrid() {
    boardContext.strokeStyle = 'gray'; // Couleur des lignes du quadrillage
    boardContext.lineWidth = 0.5; // Épaisseur des lignes

    // Dessiner les lignes verticales
    for (let x = 0; x <= board.width; x += board.width / 10) {
        boardContext.beginPath();
        boardContext.moveTo(x, 0);
        boardContext.lineTo(x, board.height);
        boardContext.stroke();
    }

    // Dessiner les lignes horizontales
    for (let y = 0; y <= board.height; y += board.height / 20) {
        boardContext.beginPath();
        boardContext.moveTo(0, y);
        boardContext.lineTo(board.width, y);
        boardContext.stroke();
    }
}

function displayPreview() {
    previewContext.fillStyle = 'black';
    previewContext.fillRect(0, 0, preview.width, preview.height);

    for (let i = 0; i < nextPiece.length - 1; i++) {
        let piece = nextPiece[i];
        drawTetrisOnThePreview(piece[0] * preview.width/5, piece[1] * preview.width/5, nextColor);
    }
}

function refresh() {
    clearBoard();
    drawGrid();
    drawBoard();
    drawCurrentPiece();
    displayPreview();
}

function loadTetris() {
    clearDownInterval();
    clearInterval(endDownInterval);
    oppacity = 255;

    currentPieceToBoard();
    checkLine();
    spawnPiece();
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
    if (event.key == 'ArrowUp' && !keyPress.includes('ArrowUp')) {
        rotate();
    } else if (event.key == 'ArrowDown' && !keyPress.includes('ArrowDown')) {
        clearDownInterval();
        downInterval = setInterval(() => {
            moveDown();
            
            refresh();
        }, 50);
    } else if (event.key == 'ArrowLeft' && !keyPress.includes('ArrowLeft')) {
        moveLeft();

        leftInterval = setInterval(() => {
            moveLeft();

            refresh();
        }, 100);
    } else if (event.key == 'ArrowRight' && !keyPress.includes('ArrowRight')) {
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
    if (event.key == 'ArrowDown') {
        initAndChangeSpeedDrop();
    } else if (event.key == 'ArrowLeft') {
        clearInterval(leftInterval);
    } else if (event.key == 'ArrowRight') {
        clearInterval(rightInterval);
    }

    keyPress = keyPress.filter((key) => {
        return key != event.key;
    });
});

img.onload = () => {
    loadMenu.classList.add('hidden');
    mainMenu.classList.remove('hidden');
}


