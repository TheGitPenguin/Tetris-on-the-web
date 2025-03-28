const board = document.getElementById('tetris-canvas');

const boardContext = board.getContext('2d');

boardContext.fillStyle = 'black';
boardContext.fillRect(0, 0, board.width, board.height);

const img = new Image();
img.src = '../img/PieceTetris.png';

let downInterval = setInterval(() => {
    clearBoard();
    moveDown();
    drawBoard();
    drawCurrentPiece();
}, 1000);

let rightInterval;

let leftInterval;

let keyPress = [];

const templatePiece = [
    [ // ok
        [3, 0],
        [4, 0],
        [5, 0],
        [6, 0],
        [4.5, 0.5]
    ],
    [ 
        [3, 0],
        [4, 0],
        [5, 0],
        [5, 1],
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
    [255, 0, 0, 200],
    [0, 255, 0, 200],
    [0, 0, 255, 200],
    [255, 255, 0, 200],
    [0, 255, 255, 200],
    [255, 0, 255, 200],
    [255, 40, 130, 200]
];

let currentPiece = [];
let color = []

let boardData = [];

for (let i = 0; i < 10; i++) {
    boardData[i] = [];
    for (let j = 0; j < 20; j++) {
        boardData[i][j] = [0, 0, 0, 255];
    }
}

function drawTetris(x, y, color) {
    boardContext.drawImage(img, x, y, board.width/10, board.width/10);

    const imageData = boardContext.getImageData(x, y, board.width/10, board.width/10);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * color[0] / 255;
        data[i + 1] = data[i + 1] * color[1] / 255;
        data[i + 2] = data[i + 2] * color[2] / 255;
        data[i + 3] = data[i + 3] * color[3] / 255;
    }

    boardContext.putImageData(imageData, x, y);
}

function drawCurrentPiece() {
    for (let i = 0 ; i < currentPiece.length - 1; i++) {
        let piece = currentPiece[i];
        drawTetris(piece[0] * board.width/10, piece[1] * board.width/10, color);
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

function loadTetris() {
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

    currentPiece = [];
    for (let i = 0; i < templatePiece[random].length; i++) {
        currentPiece.push([templatePiece[random][i][0], templatePiece[random][i][1]]);
    }

    color = templateColor[random];
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
    }
    else {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (canMoveTo(x, y, currentPieceCopy)) {
                    moveToPiece(x, y, currentPieceCopy);
                    currentPiece = currentPieceCopy;
                    return;
                }
            }
        }
    }
}

function checkLine() {
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
        }
    }
}

function moveTo(x, y) {
    moveToPiece(x, y, currentPiece);
}

function moveToPiece(x, y, piece) {
    for (let i = 0; i < piece.length; i++) {
        piece[i][0] += x;
        piece[i][1] += y;
    }
}

function moveDown() {
    if (!ifMoveTo(0, 1) || currentPiece.length == 1) {
        loadTetris();
        return;
    }

    moveTo(0, 1);
}

function moveLeft() {
    if (!ifMoveTo(-1, 0) || currentPiece.length == 1) {
        return;
    }

    moveTo(-1, 0);
}

function moveRight() {
    if (!ifMoveTo(1, 0) || currentPiece.length == 1) {
        return;
    }

    moveTo(1, 0);
}

function fasteDrop() {
    while (ifMoveTo(0, 1)) {
        moveDown();
    }
}

img.onload = () => {
    loadTetris();
    drawCurrentPiece();

    

    document.addEventListener('keydown', (event) => {
        if (event.key == 'ArrowUp' && !keyPress.includes('ArrowUp')) {
            rotate();
        } else if (event.key == 'ArrowDown' && !keyPress.includes('ArrowDown')) {
            clearInterval(downInterval);
            downInterval = setInterval(() => {
                clearBoard();
                moveDown();
                drawBoard();
                drawCurrentPiece();
            }, 50);
        } else if (event.key == 'ArrowLeft' && !keyPress.includes('ArrowLeft')) {
            clearBoard();
            moveLeft();
            drawBoard();
            drawCurrentPiece();

            leftInterval = setInterval(() => {
                clearBoard();
                moveLeft();
                drawBoard();
                drawCurrentPiece();
            }, 100);
        } else if (event.key == 'ArrowRight' && !keyPress.includes('ArrowRight')) {
            clearBoard();
            moveRight();
            drawBoard();
            drawCurrentPiece();

            rightInterval = setInterval(() => {
                clearBoard();
                moveRight();
                drawBoard();
                drawCurrentPiece();
            }, 100);
        } else if (event.key == ' ' && !keyPress.includes(' ')) {
            fasteDrop();
        }

        clearBoard();
        drawBoard();
        drawCurrentPiece();

        console.log(event.key);

        keyPress.push(event.key);
    });

    document.addEventListener('keyup', (event) => {
        if (event.key == 'ArrowDown') {
            clearInterval(downInterval);
            downInterval = setInterval(() => {
                clearBoard();
                moveDown();
                drawBoard();
                drawCurrentPiece();
            }, 1000);
        } else if (event.key == 'ArrowLeft') {
            clearInterval(leftInterval);
        } else if (event.key == 'ArrowRight') {
            clearInterval(rightInterval);
        }

        keyPress = keyPress.filter((key) => {
            return key != event.key;
        });
    });
}