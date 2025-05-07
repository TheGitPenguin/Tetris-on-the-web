
function initGame() {
    displayGameBoard();

    game = getGame();

    setSpeed(game);

    initOrChangeDropInterval(game.speed);


    // On rafraichit le plateau toutes les 16ms (environ 60 FPS)
    refreshInterval = setInterval(() => {
        refreshBoard(game.board);
        displayPreview(game);
        scoreElement.innerText = game.score;
    }, 16);

    history = [];
}

function initOrChangeDropInterval(speed) {
    if (dropInterval) {
        clearInterval(dropInterval);
    }
    dropInterval = setInterval(() => {
        dropPiece();
    }, speed);
}

function moveDownWithCheck(game) {
    let piece = game.currentPiece;

    if (ifMoveDown(piece, game)) {
        opacityCurrentPiece = 1;

        clearInterval(endDropInterval);

        endDropInterval = null;

        moveDown(piece);
    }

    checkEnDrop(game);
}

function checkEnDrop(game) {
    if (ifMoveDown(game.currentPiece, game)) {
        opacityCurrentPiece = 1;

        clearInterval(endDropInterval);

        endDropInterval = null;
    }
    else {
        endDrop(game);
    }
}

function dropPiece() {
    moveDownWithCheck(game);
}

function pauseGame() {
    if (game.paused) {
        game.paused = false;
        initOrChangeDropInterval(game.speed);
        refreshInterval = setInterval(() => {
            refreshBoard(game.board);
            displayPreview(game);
        }, 16);

        displayGameBoard();
    } else {
        game.paused = true;
        clearInterval(dropInterval);
        clearInterval(refreshInterval);
        dropInterval = null;
        refreshInterval = null;
        endDropInterval = null;

        displayPause()
    }
}


document.addEventListener('keydown', (event) => {
    if (event.key == 'Escape' && !keyPress.includes('Escape')) {
        pauseGame();
        return;
    }
    if (game.paused) {
        return;
    }
    if (game.gameOver) {
        return;
    }

    if ((event.key == 'ArrowUp' || event.key == 'w' || event.key == 'z') && !keyPress.includes('ArrowUp') && !keyPress.includes('w') && !keyPress.includes('z')) {
        rotatePiece(game.currentPiece);
        checkEnDrop(game);

    } else if ((event.key == 'ArrowDown' || event.key == 's') && !keyPress.includes('ArrowDown') && !keyPress.includes('s')) {
        initOrChangeDropInterval(60);
    } else if ((event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'q') && !keyPress.includes('ArrowLeft') && !keyPress.includes('q') && !keyPress.includes('a')) {
        moveLeft(game.currentPiece);
        checkEnDrop(game);

        leftInterval = setInterval(() => {
            moveLeft(game.currentPiece);
            checkEnDrop(game);

        }, 100);
    } else if (((event.key == 'ArrowRight') || event.key == 'd') && !keyPress.includes('ArrowRight') && !keyPress.includes('d')) {
        moveRight(game.currentPiece);

        checkEnDrop(game);


        rightInterval = setInterval(() => {
            moveRight(game.currentPiece);

            checkEnDrop(game);

        }, 100);
    } else if (event.key == ' ' && !keyPress.includes(' ')) {
        fastDrop(game);
    }

    console.log(event.key);

    keyPress.push(event.key);
});

document.addEventListener('keyup', (event) => {
    if (!game.paused && !game.gameOver) {
        if (event.key == 'ArrowDown' || event.key == 's') {
            initOrChangeDropInterval(game.speed);
        } else if (event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'q') {
            clearInterval(leftInterval);
        } else if (event.key == 'ArrowRight' || event.key == 'd') {
            clearInterval(rightInterval);
        }
    }

    keyPress = keyPress.filter((key) => {
        return key != event.key;
    });
});