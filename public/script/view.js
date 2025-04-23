let gapPiece = 6;

function drawTetisWithOppacity(x, y, color, oppacity) {
    boardContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${oppacity/255})`
    boardContext.fillRect(x + gapPiece/2, y + gapPiece/2, board.width/10 - gapPiece, board.width/10 - gapPiece);
    // boardContext.drawImage(img, x, y, board.width/10, board.width/10);

    // const imageData = boardContext.getImageData(x, y, board.width/10, board.width/10);
    // const data = imageData.data;

    // for (let i = 0; i < data.length; i += 4) {
    //     data[i] = data[i] * color[0] / 255;
    //     data[i + 1] = data[i + 1] * color[1] / 255;
    //     data[i + 2] = data[i + 2] * color[2] / 255;
    //     data[i + 3] = data[i + 3] * oppacity / 255;
    // }

    // boardContext.putImageData(imageData, x, y);
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

function drawHologram() {
    let hologramPiece = [];
    for (let i = 0; i < currentPiece.length; i++) {
        let piece = currentPiece[i];
        hologramPiece.push([piece[0], piece[1]]);
    }

    while (canMoveTo(0, 1, hologramPiece)) {
        moveToPiece(0, 1, hologramPiece);
    }

    for (let i = 0; i < hologramPiece.length - 1; i++) {
        let piece = hologramPiece[i];
        drawTetisWithOppacity(piece[0] * board.width/10, piece[1] * board.width/10, color, 80);
    }
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
    drawHologram();
    drawCurrentPiece();
    displayPreview();
}

function displayPause() {
    mainMenu.classList.add('hidden');
    loadMenu.classList.add('hidden');
    board.classList.add('hidden');

    pauseMenu.classList.remove('hidden');
}

function displayGameBoard() {
    mainMenu.classList.add('hidden');
    loadMenu.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    
    board.classList.remove('hidden');
}