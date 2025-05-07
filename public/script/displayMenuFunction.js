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