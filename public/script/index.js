const board = document.getElementById('tetris-canvas');

const boardContext = board.getContext('2d');

boardContext.fillStyle = 'black';
boardContext.fillRect(0, 0, board.width, board.height);

const img = new Image();
img.src = '../img/PieceTetris.png';

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
        [4, 1]
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
        console.log("Hey");
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
    for (let i = 0; i < currentPiece.length - 1; i++) {
        if (currentPiece[i][0] + x < 0 || currentPiece[i][0] + x >= 10 || currentPiece[i][1] + y >= 20 || ifPiece(currentPiece[i][0] + x, currentPiece[i][1] + y)) {
            return false;
        }
    }
    return true;
}

function ifPiece(x, y) {
    if (boardData[x][y][0] == 0 && boardData[x][y][1] == 0 && boardData[x][y][2] == 0) {
        return false;
    }

    return true;
}

function rotate() {
    if (currentPiece.length == 0) {
        return;
    }

    const center = currentPiece[currentPiece.length - 1];
    for (let i = 0; i < currentPiece.length - 1; i++) {
        const x = currentPiece[i][0] - center[0];
        const y = currentPiece[i][1] - center[1];

        currentPiece[i][0] = center[0] - y;
        currentPiece[i][1] = center[1] + x;
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
    for (let i = 0; i < currentPiece.length; i++) {
        currentPiece[i][0] += x;
        currentPiece[i][1] += y;
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

img.onload = () => {
    loadTetris();
    drawCurrentPiece();

    setInterval(() => {
        clearBoard();
        moveDown();
        drawBoard();
        drawCurrentPiece();
    }, 1000);

    document.addEventListener('keydown', (event) => {
        if (event.key == 'ArrowUp') {
            rotate();
        } else if (event.key == 'ArrowDown') {
            moveDown();
        } else if (event.key == 'ArrowLeft') {
            moveLeft();
        } else if (event.key == 'ArrowRight') {
            moveRight();
        }

        clearBoard();
        drawBoard();
        drawCurrentPiece();
    });
}