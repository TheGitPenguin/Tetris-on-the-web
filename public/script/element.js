let board = document.getElementById('tetris-canvas');
const boardBis = document.getElementById('tetris-canvas').cloneNode(true);
const scoreElement = document.getElementById('score-value');
const loadMenu = document.getElementById('load-menu');
const mainMenu = document.getElementById('main-menu');
const pauseMenu = document.getElementById('pause-menu');

const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

let preview = document.getElementById('preview-canvas');
const previewBis = document.getElementById('preview-canvas').cloneNode(true);

const gameOverMenu = document.getElementById('game-over-menu');
const restartButton = document.getElementById('restart-button');

const boardContainer = document.getElementById('board-container');
const previewContainer = document.getElementById('preview-container');

const buttonContainer = document.getElementById('pause-container');

const highScoreTemplate = document.getElementById('high-score-template');

const highScoresList = document.getElementById('high-scores-list');