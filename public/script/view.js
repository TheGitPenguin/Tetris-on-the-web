let gapPiece = 6;

function drawTetisWithOppacity(x, y, color, oppacity) {
    boardContext.fillStyle = '#303f4f'; // Couleur de fond
    boardContext.fillRect(x, y, board.width/10, board.width/10);
    boardContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${oppacity/255})`
    boardContext.fillRect(x + gapPiece/2, y + gapPiece/2, board.width/10 - gapPiece, board.width/10 - gapPiece);
}

function drawTetrisOnThePreview(x, y, color) {
    previewContext.fillStyle = '#303f4f'; // Couleur de fond
    previewContext.fillRect(x, y, preview.width/5, preview.width/5);
    previewContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${oppacity})`
    previewContext.fillRect(x + gapPiece/2, y + gapPiece/2, preview.width/5 - gapPiece, preview.width/5 - gapPiece);
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
        drawTetisWithOppacity(piece[0] * board.width/10, piece[1] * board.width/10, color, 120);
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
    // Ajouter un motif subtil en arrière-plan

    boardContainer.innerHTML = '';
    board = boardBis.cloneNode(true);
    boardContainer.appendChild(board);

    boardContext = board.getContext('2d');

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 20; j++) {
            if ((i + j) % 2 === 0) {
                boardContext.fillStyle = '#6d728020'; // Encore plus sombre
            }
            else {
                boardContext.fillStyle = '#3d425020'; // Presque noir-bleuté
            }
            boardContext.fillRect(
                i * board.width/10, 
                j * board.height/20, 
                board.width/10, 
                board.height/20
            );
        }
    }
}


function displayPreview() {
    previewContainer.innerHTML = '';

    preview = previewBis.cloneNode(true);
    previewContainer.appendChild(preview);

    previewContext = preview.getContext('2d');


    // make damier

    for (let x = 0; x < 5 ; x++) {
        for (let y = 0;y < 5; y++) {
            if ((x + y) % 2 === 0) {
                previewContext.fillStyle = '#6d728020'; // Encore plus sombre
            }
            else {
                previewContext.fillStyle = '#3d425020'; // Presque noir-bleuté
            }

            previewContext.fillRect(
                x * preview.width/5, 
                y * preview.height/5, 
                preview.width/5, 
                preview.height/5
            );
        }
    }
    
    let xDif = nextPiece[nextPiece.length - 1][0] - 2;
    let yDif = nextPiece[nextPiece.length - 1][1] + 0.5;

    for (let i = 0; i < nextPiece.length - 1; i++) {
        let piece = nextPiece[i];
        drawTetrisOnThePreview((piece[0] - xDif) * preview.width/5, (piece[1] + yDif) * preview.width/5, nextColor);
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

function displayMainMenu() {
    mainMenu.classList.remove('hidden');
    loadMenu.classList.add('hidden');
    boardContainer.classList.add('hidden');
    pauseButton.classList.remove('paused');
    buttonContainer.classList.add('hidden');
    
    gameOverMenu.classList.add('hidden');
}

function displayPause() {
    mainMenu.classList.add('hidden');
    loadMenu.classList.add('hidden');
    boardContainer.classList.add('hidden');
    
    pauseButton.classList.add('paused');
    pauseMenu.classList.remove('hidden');
}

function displayGameBoard() {
    mainMenu.classList.add('hidden');
    loadMenu.classList.add('hidden');
    pauseMenu.classList.add('hidden');
    gameOverMenu.classList.add('hidden');
    pauseButton.classList.remove('paused');
    buttonContainer.classList.remove('hidden');
    
    boardContainer.classList.remove('hidden');
}

function displayGameOver() {
    mainMenu.classList.add('hidden');
    loadMenu.classList.add('hidden');
    boardContainer.classList.add('hidden');
    pauseButton.classList.remove('paused');
    buttonContainer.classList.add('hidden');

    gameOverMenu.classList.remove('hidden');
}