function ifPieceInBoard(x, y, game) {
    let board = game.board;

    if (x < 0 || x >= width || y >= height) {
        return true;
    }

    for (let i = 0; i < board.length; i++) {
        if (board[i].x === x && board[i].y === y) {
            return true;
        }
    }

    return false;
}

function ifMovePiece(x, y, piece, game) {
    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        let newX = square.x + x;
        let newY = square.y + y;

        if (ifPieceInBoard(newX, newY, game)) {
            return false;
        }
    }
    return true;
}

function ifMoveDown(piece, game) {
    return ifMovePiece(0, 1, piece, game);
}

function ifMoveLeft(piece, game) {
    return ifMovePiece(-1, 0, piece, game);
}

function ifMoveRight(piece, game) {
    return ifMovePiece(1, 0, piece, game);
}

function ifRotate(piece, game) {
    let centerX = piece.xCenter;
    let centerY = piece.yCenter;

    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        let x = square.x - centerX;
        let y = square.y - centerY;

        let newX = -y + centerX;
        let newY = x + centerY;

        if (ifPieceInBoard(newX, newY, game)) {
            return false;
        }
    }
    return true;
}

function moveDown(piece) {
    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        square.y += 1;
    }

    piece.yCenter += 1;
}

function moveLeft(piece) {
    if (!ifMoveLeft(piece, game)) {
        return;
    }

    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        square.x -= 1;
    }

    piece.xCenter -= 1;
}

function moveRight(piece) {
    if (!ifMoveRight(piece, game)) {
        return;
    }

    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        square.x += 1;
    }

    piece.xCenter += 1;
}

function ifCantRotate(piece, game) {
    let centerX = piece.xCenter;
    let centerY = piece.yCenter;
    
    let moveX = [0, -1, 1, -2, 2];
    let moveY = [0, -1];

    for (let i = 0; i < moveX.length; i++) {
        for (let j = 0; j < moveY.length; j++) {
            let pieceBis = clonePiece(piece);

            pieceBis.xCenter += moveX[i];
            pieceBis.yCenter += moveY[j];

            for (let k = 0; k < pieceBis.squares.length; k++) {
                let square = pieceBis.squares[k];
                square.x += moveX[i];
                square.y += moveY[j];
            }

            if (ifRotate(pieceBis, game)) {
                return [false, moveX[i], moveY[j]];
            }
        }
    }

    return [true, centerX, centerY];
}

function rotatePiece(piece) {
    if (!ifRotate(piece, game)) {
        let info = ifCantRotate(piece, game);
        let canRotate = info[0];
        let x = info[1];
        let y = info[2];

        if (canRotate) {
            return;
        }

        for (let i = 0; i < piece.squares.length; i++) {
            let square = piece.squares[i];
            square.x += x;
            square.y += y;
        }
        piece.xCenter += x;
        piece.yCenter += y;
    }

    let centerX = piece.xCenter;
    let centerY = piece.yCenter;

    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        let x = square.x - centerX;
        let y = square.y - centerY;

        square.x = -y + centerX;
        square.y = x + centerY;
    }
}

function fixPieceToBoard(piece, game) {
    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        game.board.push(square);
    }

    opacityCurrentPiece = 1;

    checkLine(game);
    // Vous pouvez également gérer ici la création d'une nouvelle pièce
    // ou vérifier si des lignes doivent être supprimées.
}

function checkLine(game, ifNoFall = false) {
    let lineFilled = [];

    for (let i = 0; i < 20; i++) {
        let filled = true;
        for (let j = 0; j < 10; j++) {
            if (!ifPieceInBoard(j, i, game)) {
                filled = false;
                break;
            }
        }

        if (filled) {
            lineFilled.push(i);
        }
    }

    for (let i = 0; i < game.board.length; i++) {
        let square = game.board[i];
        let y = square.y;

        if (!ifNoFall) {
            for (let j = 0; j < lineFilled.length; j++) {
                if (lineFilled[j] > y) {
                    square.y += 1;
                }
            }
        }

        if (lineFilled.includes(y)) {
            game.board.splice(i, 1);
            i--;
        }
    }


    if (lineFilled.length == 1) {
        game.score += 40;
    }
    else if (lineFilled.length == 2) {
        game.score += 100;
    }
    else if (lineFilled.length == 3) {
        game.score += 300;
    }
    else if (lineFilled.length == 4) {
        game.score += 1200;
    }

    scoreElement.innerText = game.score;
    game.lines += lineFilled.length;
    game.level = Math.floor(game.lines / 10);
}

function switchPiece(game) {
    game.currentPiece = game.nextPiece;
    game.nextPiece = getRandomPiece();

    for (let i = 0; i < game.currentPiece.squares.length; i++) {
        if (ifPieceInBoard(game.currentPiece.squares[i].x, game.currentPiece.squares[i].y, game)) {
            game.gameOver = true;
            clearInterval(dropInterval);
            clearInterval(leftInterval);
            clearInterval(rightInterval);
            clearInterval(refreshInterval);

            clearInterval(endDropInterval);
            endDropInterval = null;
            opacityCurrentPiece = 1;
            game.currentPiece = null;
            dropInterval = null;
            refreshInterval = null;

            displayGameOver();
            return;
        }
    }
}

function setSpeed(game) {
    if (game.level > 29) {
        game.speed = (speedSecondsToBotomPerLevel[29] / 20) * 1000;
    }
    else {
        game.speed = (speedSecondsToBotomPerLevel[game.level] / 20) * 1000;
    }
}

function endDrop(game) {
    let piece = game.currentPiece;

    // La pièce ne peut plus descendre, elle est fixée sur le plateau
    if (!endDropInterval) { // Vérifiez qu'il n'y a pas déjà un intervalle actif
        endDropInterval = setInterval(() => {
            opacityCurrentPiece -= 0.1;
            if (opacityCurrentPiece <= 0) {

                fixPieceToBoard(piece, game);

                clearInterval(endDropInterval);
                endDropInterval = null; // Réinitialisez après l'arrêt
                opacityCurrentPiece = 1;
                switchPiece(game);
                setSpeed(game);
                initOrChangeDropInterval(game.speed);
            }
        }, 60);
    }
}

function fastDrop(game, piece = game.currentPiece) {
    if (piece) {
        let canMoveDown = true;

        while (canMoveDown) {
            canMoveDown = ifMoveDown(piece, game);
            if (canMoveDown) {
                moveDown(piece);
            }
        }

        fixPieceToBoard(piece, game);

        clearInterval(endDropInterval);
        endDropInterval = null; // Réinitialisez après l'arrêt
        opacityCurrentPiece = 1;
        setSpeed(game);
        initOrChangeDropInterval(game.speed);
        switchPiece(game);
    }
}