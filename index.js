import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

// Déclaration de la variable db pour qu'elle soit accessible dans tout le script
let db;

// Fonction pour initialiser la base de données
async function initializeDatabase() {
    // open the database - SQLite créera automatiquement le fichier s'il n'existe pas
    db = await open({
        filename: './datas/database.db',
        driver: sqlite3.Database
    });

    // Créer les tables nécessaires si elles n'existent pas
    await db.exec(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT,
        score INTEGER,
        pathHistory TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized');
}

initializeDatabase().catch(err => {
    console.error('Error initializing database:', err);
});

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

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
    [240, 87, 84, 255],
    [254, 223, 92, 255],
    [27, 148, 118, 255],
    [36, 115, 155, 255],
    [106, 190, 178, 255],
    [164, 199, 218, 255],
    [177, 225, 218, 255]
];

const MOVELEFT = 1;
const MOVERIGHT = 2;
const MOVEDOWN = 3;
const ROTATE = 4;
const MOVEDOWNFAST = 5;
const RESPAWN = 6;
const CHANGENEXTPIECE = 7;

function ifPiece(x, y, board) {
    if (x < 0 || x >= 10 || y >= 20) {
        return true;
    }

    if (y < 0) {
        return false;
    }

    if (board[x][y][0] == 0 && board[x][y][1] == 0 && board[x][y][2] == 0) {
        return false;
    }

    return true;
}

function canMoveTo(x, y, piece, board) {
    for (let i = 0; i < piece.length - 1; i++) {
        if (piece[i][0] + x < 0 || piece[i][0] + x >= 10 || piece[i][1] + y >= 20 || ifPiece(piece[i][0] + x, piece[i][1] + y, board)) {
            return false;
        }
    }
    return true;
}

function ifRotate(piece, board) {
    for (let i = 0; i < piece.length - 1; i++) {
        if (piece[i][0] < 0 || piece[i][0] >= 10 || piece[i][1] >= 20 || ifPiece(piece[i][0], piece[i][1], board)) {
            return false;
        }
    }
    return true;
}

function moveDown(piece, board) {
    if (canMoveTo(0, 1, piece, board)) {
        for (let i = 0; i < piece.length; i++) {
            piece[i][1]++;
        }
    }
}

function moveLeft(piece, board) {
    if (canMoveTo(-1, 0, piece, board)) {
        for (let i = 0; i < piece.length; i++) {
            piece[i][0]--;
        }
    }
}

function moveRight(piece, board) {
    if (canMoveTo(1, 0, piece, board)) {
        for (let i = 0; i < piece.length; i++) {
            piece[i][0]++;
        }
    }
}

function rotate(piece, board) {
    if (piece.length == 0) {
        return;
    }

    let currentPieceCopy = [];

    for (let i = 0; i < piece.length; i++) {
        currentPieceCopy.push([piece[i][0], piece[i][1]]);
    }

    const center = currentPieceCopy[currentPieceCopy.length - 1];
    for (let i = 0; i < piece.length - 1; i++) {
        const x = currentPieceCopy[i][0] - center[0];
        const y = currentPieceCopy[i][1] - center[1];

        currentPieceCopy[i][0] = center[0] - y;
        currentPieceCopy[i][1] = center[1] + x;
    }


    if (ifRotate(currentPieceCopy, board)) {
        piece = currentPieceCopy;
        // Don't modify history in verification function
    }
    else {
        for (let x = -1; x <= 1; x++) {
            for (let y = 0; y >= -1; y--) {
                if (canMoveTo(x, y, currentPieceCopy, board)) {
                    moveToPiece(x, y, currentPieceCopy);
                    piece = currentPieceCopy;

                    x = 2;
                    y = -2;
                }
            }
        }
    }
}

function moveToPiece(x, y, piece) {
    for (let i = 0; i < piece.length; i++) {
        piece[i][0] += x;
        piece[i][1] += y;
    }
}

function checkLine(board, scoreObject) {
    let lineFilled = 0;
    let score = 0;
    let lines = 0;
    let level = 0;

    for (let i = 0; i < 20; i++) {
        let check = true;

        for (let j = 0; j < 10; j++) {
            if (board[j][i][0] == 0 && board[j][i][1] == 0 && board[j][i][2] == 0) {
                check = false;
                break;
            }
        }

        if (check) {
            for (let j = i; j > 0; j--) {
                for (let k = 0; k < 10; k++) {
                    board[k][j] = board[k][j - 1];
                }
            }

            for (let k = 0; k < 10; k++) {
                board[k][0] = [0, 0, 0, 255];
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

    lines += lineFilled;
    level = Math.floor(lines / 10);

    scoreObject.score += score;
    scoreObject.lines += lineFilled;
    scoreObject.level = Math.floor(scoreObject.lines / 10);
}

function verifieHystoryAndScore(score, history) {
    let board = [];

    for (let i = 0; i < 10; i++) {
        board[i] = [];
        for (let j = 0; j < 20; j++) {
            board[i][j] = [0, 0, 0, 255];
        }
    }

    let piece = [];
    let nextPiece = [];
    let nextIndex = 0;

    let scoreObject = {
        score: 0,
        lines: 0,
        level: 0
    };

    for (let i = 0; i < history.length; i++) {
        if (history[i][0] === CHANGENEXTPIECE) {
            // Only place non-fractional coordinates on the board
            for (let j = 0; j < piece.length - 1; j++) {
                if (Number.isInteger(piece[j][0]) && Number.isInteger(piece[j][1]) && 
                    piece[j][0] >= 0 && piece[j][0] < 10 && 
                    piece[j][1] >= 0 && piece[j][1] < 20) {
                    board[piece[j][0]][piece[j][1]] = [templateColor[nextIndex][0], templateColor[nextIndex][1], templateColor[nextIndex][2], templateColor[nextIndex][3]];
                }
            }

            checkLine(board, scoreObject);

            nextIndex = history[i][1];
            
            // Reset piece and copy from template
            piece = [];
            for (let j = 0; j < templatePiece[nextIndex].length; j++) {
                piece.push([templatePiece[nextIndex][j][0], templatePiece[nextIndex][j][1]]);
            }

            // Set up next piece
            nextPiece = [];
            let nextNextIndex = (i+1 < history.length && history[i+1][0] === CHANGENEXTPIECE) ? history[i+1][1] : 0;
            for (let j = 0; j < templatePiece[nextNextIndex].length; j++) {
                nextPiece.push([templatePiece[nextNextIndex][j][0], templatePiece[nextNextIndex][j][1]]);
            }
        }
        else if (history[i][0] === MOVEDOWN) {
            moveDown(piece, board);
        }
        else if (history[i][0] === MOVELEFT) {
            moveLeft(piece, board);
        }
        else if (history[i][0] === MOVERIGHT) {
            moveRight(piece, board);
        }
        else if (history[i][0] === ROTATE) {
            rotate(piece, board);
        }
    }

    console.log("Calculated score:", scoreObject.score, "Submitted score:", score);
    return score === scoreObject.score;
}

app.put('/api/sendScore', (req, res) => {

    let score = req.body.score;
    let history = req.body.history;
    let playerName = req.body.playerName;

    // if (score === null || history === null || playerName === null) {
    //     return res.status(400).send('Missing required fields');
    // }

    // if (score < 0) {
    //     return res.status(400).send('Score cannot be negative');
    // }

    // if (history.length === 0) {
    //     return res.status(400).send('History cannot be empty');
    // }

    if (!verifieHystoryAndScore(score, history)) {
        return res.status(400).send('Invalid history or score');
    }

    // Vérifier si le dossier des historiques existe, le créer si nécessaire
    const historyDir = './datas/histories';
    if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
    }

    // Date du jour

    const date = new Date();
    const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Vérifier si un fichier avec ce nom existe déjà et ajouter un chiffre si nécessaire
    let finalPlayerName = playerName + dateString;
    let counter = 0;
    let historyFilePath = `${historyDir}/${finalPlayerName}.json`;

    while (fs.existsSync(historyFilePath)) {
        counter++;
        finalPlayerName = `${playerName}${dateString}${counter}`;
        historyFilePath = `${historyDir}/${finalPlayerName}.json`;
    }

    // Écrire l'historique dans le fichier
    try {
        fs.writeFileSync(historyFilePath, JSON.stringify(history));
        console.log(`History written to ${historyFilePath}`);
    } catch (err) {
        console.error('Error writing history file:', err);
        return res.status(500).send('Error writing history file');
    }

    // 
    db.run('INSERT INTO scores (player_name, score, pathHistory) VALUES (?, ?, ?)', [playerName, score, historyFilePath])
        .then(() => {
            console.log(`Score inserted for ${playerName}`);
        })
        .then(() => {
            console.log('History path inserted in database');
            res.status(200).json({
                success: true,
                playerName: playerName,
                message: 'Score and history saved'
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).send('Error inserting data');
        });
});

app.get('/api/getHighScores', async (req, res) => {
    try {
        const scores = await db.all('SELECT player_name, score FROM scores ORDER BY score DESC LIMIT 10');
        res.json(scores);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Error retrieving high scores');
    }
}
);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
