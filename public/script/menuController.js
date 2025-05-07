startButton.addEventListener('click', function() {
    initGame();
});
pauseButton.addEventListener('click', function() {
    pauseGame();
});
restartButton.addEventListener('click', function() {
    initGame();
});
resumeButton.addEventListener('click', function() {
    pauseGame();
});
mainMenuButton.addEventListener('click', function() {
    finishGame(false, false);
});
mainMenuButtonBis.addEventListener('click', function() {
    finishGame(false, false);
});