function ifPieceInBoard(x, y) {
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

function ifMovePiece(x, y, piece = game.currentPiece) {
    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        let newX = square.x + x;
        let newY = square.y + y;

        if (ifPieceInBoard(newX, newY)) {
            return false;
        }
    }
    return true;
}

function ifMoveDown(piece = game.currentPiece) {
    return ifMovePiece(0, 1, piece);
}

function ifMoveLeft(piece = game.currentPiece) {
    return ifMovePiece(-1, 0, piece);
}

function ifMoveRight(piece = game.currentPiece) {
    return ifMovePiece(1, 0, piece);
}

function ifRotate(piece = game.currentPiece) {
    let centerX = piece.xCenter;
    let centerY = piece.yCenter;

    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        let x = square.x - centerX;
        let y = square.y - centerY;

        let newX = -y + centerX;
        let newY = x + centerY;

        if (ifPieceInBoard(newX, newY)) {
            return false;
        }
    }
    return true;
}

function moveDown(piece = game.currentPiece) {
    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        square.y += 1;
    }

    piece.yCenter += 1;
}

function moveLeft(piece = game.currentPiece) {
    if (!ifMoveLeft(piece)) {
        return;
    }

    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        square.x -= 1;
    }

    piece.xCenter -= 1;
}

function moveRight(piece = game.currentPiece) {
    if (!ifMoveRight(piece)) {
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

function fixPieceToBoard(piece = game.currentPiece) {
    for (let i = 0; i < piece.squares.length; i++) {
        let square = piece.squares[i];
        game.board.push(square);
    }

    opacityCurrentPiece = 1;

    checkLine();
    // Vous pouvez également gérer ici la création d'une nouvelle pièce
    // ou vérifier si des lignes doivent être supprimées.
}

function checkLine(ifNoFall = false) {
    let lineFilled = [];

    for (let i = 0; i < 20; i++) {
        let filled = true;
        for (let j = 0; j < 10; j++) {
            if (!ifPieceInBoard(j, i)) {
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

    game.lines += lineFilled.length;
    game.level = Math.floor(game.lines / 10);
}

function switchPiece() {
    game.currentPiece = game.nextPiece;
    game.nextPiece = getRandomPiece();

    for (let i = 0; i < game.currentPiece.squares.length; i++) {
        let x = game.currentPiece.squares[i].x;
        let y = game.currentPiece.squares[i].y;
        if (ifPieceInBoard(x, y)) {
            finishGame();
            return;
        }
    }
}

function finishGame(sendScore = true, gameOver = true) {
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

    if (gameOver) {
        displayGameOver();
    } else {
        displayMainMenu();
    }

    if (sendScore) {
        const playerName = prompt('Enter your name:');

        sendScore(game, playerName);
    }
}

async function sendScore(playerName) {
    if (playerName) {

        const data = {
            score: game.score,
            lines: game.lines,
            playerName
        };
        console.log(data);

        try {
            // Send a PUT request to the server
            const query = await fetch('/api/sendScore', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Check if the response is ok before parsing
            if (!query.ok) {
                throw new Error(`Server returned ${query.status}: ${query.statusText}`);
            }

            // Check the content type to ensure it's JSON
            const contentType = query.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server did not return JSON');
            }

            // Get the response body
            const response = await query.json();

            if (response.success) {
                console.log('Score and history saved successfully');
            }
            else {
                console.error('Error saving score and history:', response.error);
            }
        } catch (error) {
            console.error('Failed to save score:', error.message);
            alert('Could not save your score. Please try again later.');
        }
    }
}

function setSpeed() {
    if (game.level > 29) {
        game.speed = (speedSecondsToBottomPerLevel[29] / 20) * 1000;
    }
    else {
        game.speed = (speedSecondsToBottomPerLevel[game.level] / 20) * 1000;
    }
}

function endDrop() {
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

function fastDrop(piece = game.currentPiece) {
    if (piece) {
        let canMoveDown = true;

        while (canMoveDown) {
            canMoveDown = ifMoveDown();
            if (canMoveDown) {
                moveDown();
            }
        }

        fixPieceToBoard();

        clearInterval(endDropInterval);
        endDropInterval = null; // Réinitialisez après l'arrêt
        opacityCurrentPiece = 1;
        setSpeed(game);
        initOrChangeDropInterval(game.speed);
        switchPiece(game);
    }
}