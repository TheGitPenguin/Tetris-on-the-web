function getGame() {
    return {
        board: [],
        currentPiece: getRandomPiece(),
        nextPiece: getRandomPiece(),
        score: 0,
        level: 1,
        speed: 1000,
        lines: 0,
        linesCleared: 0,
        paused: false,
        gameOver: false
    }
}

function getColor(r, g, b) {
    return {
        red: r,
        green: g,
        blue: b
    }
}

function getSquare(xPos, yPos, c) {
    return {
        color: c,
        x: xPos,
        y: yPos
    }
}

function getBarPiece() {
    return {
        squares: [
            getSquare(3, 0, getColor(240, 87, 84)),
            getSquare(4, 0, getColor(240, 87, 84)),
            getSquare(5, 0, getColor(240, 87, 84)),
            getSquare(6, 0, getColor(240, 87, 84))
        ],
        xCenter: 4.5,
        yCenter: 0.5
    }
}

function getLPiece() {
    return {
        squares: [
            getSquare(3, 1, getColor(254, 223, 92)),
            getSquare(4, 1, getColor(254, 223, 92)),
            getSquare(5, 1, getColor(254, 223, 92)),
            getSquare(5, 0, getColor(254, 223, 92))
        ],
        xCenter: 4,
        yCenter: 1
    }
}

function getJPiece() {
    return {
        squares: [
            getSquare(3, 1, getColor(27, 148, 118)),
            getSquare(4, 1, getColor(27, 148, 118)),
            getSquare(5, 1, getColor(27, 148, 118)),
            getSquare(3, 0, getColor(27, 148, 118))
        ],
        xCenter: 4,
        yCenter: 1
    }
}

function getTPiece() {
    return {
        squares: [
            getSquare(3, 1, getColor(36, 115, 155)),
            getSquare(4, 1, getColor(36, 115, 155)),
            getSquare(5, 1, getColor(36, 115, 155)),
            getSquare(4, 0, getColor(36, 115, 155))
        ],
        xCenter: 4,
        yCenter: 1
    }
}

function getZPiece() {
    return {
        squares: [
            getSquare(3, 1, getColor(106, 190, 178)),
            getSquare(4, 1, getColor(106, 190, 178)),
            getSquare(4, 0, getColor(106, 190, 178)),
            getSquare(5, 0, getColor(106, 190, 178))
        ],
        xCenter: 4,
        yCenter: 1
    }
}

function getSPiece() {
    return {
        squares: [
            getSquare(3, 0, getColor(164, 199, 218)),
            getSquare(4, 0, getColor(164, 199, 218)),
            getSquare(4, 1, getColor(164, 199, 218)),
            getSquare(5, 1, getColor(164, 199, 218))
        ],
        xCenter: 4,
        yCenter: 1
    }
}

function getSquarePiece() {
    return {
        squares: [
            getSquare(3, 0, getColor(177, 225, 218)),
            getSquare(4, 0, getColor(177, 225, 218)),
            getSquare(3, 1, getColor(177, 225, 218)),
            getSquare(4, 1, getColor(177, 225, 218))
        ],
        xCenter: 3.5,
        yCenter: 0.5
    }
}

function getPiece(type) {
    switch (type) {
        case 'bar':
            return getBarPiece();
        case 'L':
            return getLPiece();
        case 'J':
            return getJPiece();
        case 'T':
            return getTPiece();
        case 'Z':
            return getZPiece();
        case 'S':
            return getSPiece();
        case 'square':
            return getSquarePiece();
    }
}

function getRandomPiece() {
    const pieces = ['bar', 'L', 'J', 'T', 'Z', 'S', 'square'];
    const randomIndex = Math.floor(Math.random() * pieces.length);
    return getPiece(pieces[randomIndex]);
}

function clonePiece(piece) {
    let newSquares = piece.squares.map(square => ({
        color: { ...square.color },
        x: square.x,
        y: square.y
    }));
    
    return {
        squares: newSquares,
        xCenter: piece.xCenter,
        yCenter: piece.yCenter
    };
}