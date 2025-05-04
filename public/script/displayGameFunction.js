let boardContext = board.getContext('2d');
let previewContext = preview.getContext('2d');

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

function drawCurrentPiece() {
    let piece = game.currentPiece;
    let squares = piece.squares;

    for (let i = 0; i < squares.length; i++) {
        let square = squares[i];
        drawSquare(square.x, square.y, square, opacityCurrentPiece);
    }
}

function drawSquare(x, y, square, opacity = 1) {
    let color = square.color;

    boardContext.fillStyle = '#303f4f'; // Couleur de fond
    boardContext.fillRect(
        x * board.width/10, 
        y * board.height/20, 
        board.width/10, 
        board.height/20
    );

    let margin = 3;

    boardContext.fillStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, ${opacity})`;
    boardContext.fillRect(
        x * board.width/10 + margin, 
        y * board.height/20 + margin, 
        board.width/10 - margin * 2, 
        board.height/20 - margin * 2
    );
}

function refreshBoard() {
    clearBoard();
    drawGrid();

    for (let i = 0; i < game.board.length; i++) {
        let square = game.board[i];
        drawSquare(square.x, square.y, square);
    }

    drawCurrentPiece();
    drawHologram();
}

function drawHologram() {
    let pieceBis = clonePiece(game.currentPiece);

    while (ifMoveDown(pieceBis, game)) {
        moveDown(pieceBis);
    }
    
    for (let i = 0; i < pieceBis.squares.length; i++) {
        let square = pieceBis.squares[i];
        drawSquare(square.x, square.y, square, 0.5);
    }
}

function displayPreview(game) {
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

    let nextPiece = game.nextPiece;
    
    let xDif = nextPiece.xCenter - 2;
    let yDif = nextPiece.yCenter - 2;

    for (let i = 0; i < nextPiece.squares.length; i++) {
        let square = nextPiece.squares[i];
        
        previewContext.fillStyle = '#303f4f'; // Couleur de fond
        previewContext.fillRect(
            (square.x - xDif) * preview.width/5, 
            (square.y - yDif) * preview.height/5, 
            preview.width/5, 
            preview.height/5
        );

        let margin = 3;

        previewContext.fillStyle = `rgba(${square.color.red}, ${square.color.green}, ${square.color.blue}, 1)`;

        previewContext.fillRect(
            (square.x - xDif) * preview.width/5 + margin, 
            (square.y - yDif) * preview.height/5 + margin, 
            preview.width/5 - margin * 2, 
            preview.height/5 - margin * 2
        );
    }
}