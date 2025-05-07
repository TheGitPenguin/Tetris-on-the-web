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

app.put('/api/sendScore', (req, res) => {

    let score = req.body.score;
    // let history = req.body.history;
    let lines = req.body.lines;
    let playerName = req.body.playerName;

    // Vérifier si le score est un nombre valide
    if (isNaN(score) || score < 0) {
        return res.status(400).send('Invalid score');
    }
    // Vérifier si l'historique est un tableau valide
    // if (!Array.isArray(history)) {
    //     return res.status(400).send('Invalid history');
    // }
    // Vérifier si le nom du joueur est une chaîne de caractères valide
    if (typeof playerName !== 'string' || playerName.trim() === '') {
        return res.status(400).send('Invalid player name');
    }
    // Vérifier si le score est supérieur à 0 et inférieur à 1200 * (lines/4)
    if ((lines/4) * 1200 < score) {
        return res.status(400).send('Invalid score');
    }
    // Vérifier si la line est un nombre valide
    if (isNaN(lines) || lines < 0) {
        return res.status(400).send('Invalid lines');
    }

    // Vérifier si le dossier des historiques existe, le créer si nécessaire
    // const historyDir = './datas/histories';
    // if (!fs.existsSync(historyDir)) {
    //     fs.mkdirSync(historyDir, { recursive: true });
    // }

    // Date du jour

    // const date = new Date();
    // const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

    // // Vérifier si un fichier avec ce nom existe déjà et ajouter un chiffre si nécessaire
    // let finalPlayerName = playerName + dateString;
    // let counter = 0;
    // let historyFilePath = `${historyDir}/${finalPlayerName}.json`;

    // while (fs.existsSync(historyFilePath)) {
    //     counter++;
    //     finalPlayerName = `${playerName}${dateString}${counter}`;
    //     historyFilePath = `${historyDir}/${finalPlayerName}.json`;
    // }

    // // Écrire l'historique dans le fichier
    // try {
    //     fs.writeFileSync(historyFilePath, JSON.stringify(history));
    //     console.log(`History written to ${historyFilePath}`);
    // } catch (err) {
    //     console.error('Error writing history file:', err);
    //     return res.status(500).send('Error writing history file');
    // }

    // 
    db.run('INSERT INTO scores (player_name, score, pathHistory) VALUES (?, ?, ?)', [playerName, score, "/"])
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
