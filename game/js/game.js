/*
 * Note about the starting semicolon
 * ---------------------------------
 * Starting with the semicolon is in case whatever line of code above this example
 * relied on automatic semicolon insertion (ASI). The browser could accidentally
 * think this whole code continues from the previous line. The leading semicolon
 * marks the beginning of our new line if the previous one was not empty or terminated.
 * 
 */      
;(() => {

    // Game configuration
    const GAME = {
        canvasWidth: 600,
        canvasHeight: 600,
        bgColor: "transparent",        
        loadingFgColor: "#fe9b36",
        scoreFgColor: "#fe9b36",
        gameOverFgColor: "#dd0000",
        boardRows: 6,
        qubeWidth: 64,
        qubeHeight: 64,
        qBertWidth: 32,
        qBertHeight: 32,
        showFPS: false,
        delayJump: 250,
        delayKeys: 500,
        musicGainValue: 0.3,
        sfxGainValue: 1,
        scorePerTileVisited: 25,
        scoreExtraLive: 500,
        minimumTimeBetweenEnemies: 1300,
        variableTimeBetweenEnemies: 1000,
        timeBetweenEnemiesReductionPerLevel: 200,
        qBertSpeed: 10,
        enemySpeed: 25,
        delayEnemy: 250,
        delayJumpEnemy: 500,
        maxLevelsForTiles: 8,
        maxLives: 3
    }

    // Game variables
    var canvas;
    var ctx;
    var level;
    var availableLives;
    var board;
    var qBert;
 
    var tile = {
        position: [0, 0],
        spriteForNotVisited: new Sprite("game/images/qbert.png", [(level - 1) * GAME.qubeWidth, 320], [GAME.qubeWidth, GAME.qubeHeight], 0, 1, "horizontal", true),
        spriteForVisited: new Sprite("game/images/qbert.png", [(level - 1) * GAME.qubeWidth, 384], [GAME.qubeWidth, GAME.qubeHeight], 0, 1, "horizontal", true),
        sprite: null
    };
    tile.sprite = tile.spriteForNotVisited;

    var deadQBert= {
        position: [0, 0],
        sprite: new Sprite("game/images/qbert.png", [256, 160], [96, 64], 0, [0])
    };

    var live = {
        position: [0, 0],
        sprite: new Sprite("game/images/qbert.png", [128, 0], [GAME.qBertWidth, GAME.qBertHeight], 0, [0]),
    };
    
    
    var audioContext;
    var musicGainNode;
    var sfxGainNode;    
    var disabledAudio = false;
    var running = false;
    var isGameOver = false;
    var lastKeyTime;
    var score = 0;
    var lastFrameTime;
    var enemies = [];
    var lastEnemyGenerationTime;
    var currentVariableTimeBetweenEnemies;
    var visitedQubes;
    var sfxBuffers;
    var bgSource;
    var sfxSource;

    // The game main loop
    function main(frameTime) {
        // frameTime is a DOMHighResTimeStamp provided by rAF        
        if (!frameTime) {
            frameTime = performance.now();
        }
        let stopMain = window.requestAnimationFrame(main);
        const timeBetweenFrames = frameTime - lastFrameTime;        
        if (GAME.showFPS) {
            const fps = 1000 / timeBetweenFrames;
            console.log(`${fps} FPS (${timeBetweenFrames} ms.)`);
        }
        const dt = timeBetweenFrames / 1000.0;
        updateGame(dt);
        lastFrameTime = frameTime;        
        renderGame();
    }

    function produceEnemies() {
        if (Date.now() - lastEnemyGenerationTime < (GAME.minimumTimeBetweenEnemies - level * GAME.timeBetweenEnemiesReductionPerLevel) + currentVariableTimeBetweenEnemies) {
            return;
        }
        produceEnemy();
        currentVariableTimeBetweenEnemies = Math.random() * GAME.variableTimeBetweenEnemies;
        lastEnemyGenerationTime = Date.now();
    }

    function produceEnemy() {
        var enemy = enemiesPool.getEnemy();
        var rnd = (Math.random() < 0.5) ? 0 : 1;
        var initialPosition = getQubePosition(rnd, 1);
        enemy.position = [initialPosition[0] + 16, 0];
        enemy.destination = initialPosition[1] - 16;
        enemy.tilePosition = [rnd, 1];
        enemy.isEntering = true;
        enemy.isJumping = false;
        enemy.isWaiting = false;
        enemy.isExitting = false;
        enemies.push(enemy);
    }

    function renderGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderBoard();
        renderQBert();
        renderEnemies();
        renderScoreAndLevel();
        renderAvailableLives();
        renderDeath();
        renderGameOver();
    }

    function updateGame(dt) {
        handleInputs(dt);        
        if (qBert.isDead) return;
        checkWin();
        checkDeath();
        produceEnemies();        
        updateGameElements(dt);
    }    

    function handleInputs(dt) {
        if (isGameOver &&
           (input.isDown("SPACE"))) {
            restartGame();
        }

        if (qBert.isDead && !isGameOver &&
           (input.isDown("Q") ||
           input.isDown("W") ||
           input.isDown("A") ||
           input.isDown("S") ||
           input.isDown("SPACE"))) {
            resetQBert();
        }
        
        if (Date.now() - lastKeyTime < GAME.delayKeys || qBert.isJumping) {
            return;
        }
        
        if (input.isDown("Q")) {
            if (qBert.tilePosition[0] > 0) {
                lastKeyTime = Date.now();
                qBert.isJumping = true;
                qBert.lastJump = Date.now();
                qBert.vector = [-1, -1];
                qBert.sprite = qBert.spriteQ;
            }
        }

        if (input.isDown("W")) {
            if (qBert.tilePosition[0] < qBert.tilePosition[1]) {
                lastKeyTime = Date.now();
                qBert.isJumping = true;
                qBert.lastJump = Date.now();
                qBert.vector = [0, -1];
                qBert.sprite = qBert.spriteW;
            }
        }

        if (qBert.tilePosition[1] < GAME.boardRows-1) {
            if (input.isDown("A")) {
                lastKeyTime = Date.now();
                qBert.isJumping = true;
                qBert.lastJump = Date.now();
                qBert.vector = [0, 1];
                qBert.sprite = qBert.spriteA;
            }

            if (input.isDown("S")) {
                lastKeyTime = Date.now();
                qBert.isJumping = true;
                qBert.lastJump = Date.now();
                qBert.vector = [1, 1];
                qBert.sprite = qBert.spriteS;
            }
        }
    }

    function updateGameElements(dt) {
        updateQBert(dt);
        updateEnemies(dt);
    }

    function updateQBert(dt) {
        qBert.sprite.update(dt);
        
        if (qBert.isJumping) {
            qBert.cosine += qBert.speed * dt * 1.15;
            if (qBert.sprite == qBert.spriteA) {
                qBert.position[0] += -1 + (qBert.speed * dt * 1.15);
            } else {
                qBert.position[0] += qBert.vector[0] + (qBert.speed * dt * 1.15);
            }
            qBert.position[1] += qBert.vector[1] + (qBert.speed * dt) - Math.sin(qBert.cosine);

            if (Date.now() - qBert.lastJump > GAME.delayJump) {
                qBert.cosine = 0;
                qBert.isJumping = false;
                qBert.tilePosition[0] += qBert.vector[0];
                qBert.tilePosition[1] += qBert.vector[1];
                positionQBert(true);
            }
        }       
    }

    function updateEnemies(dt) {
        for (var e=enemies.length-1; e>=0; e--) {
            var enemy = enemies[e];
            enemy.sprite.update(dt);
            if (enemy.isEntering) {
                enemy.position[1] += 2;
                if (enemy.position[1] >= enemy.destination) {
                    enemy.position[1] = enemy.destination;
                    enemy.isEntering = false;
                }
            } else if (enemy.isExitting) {
                enemy.cosine += GAME.enemySpeed * dt * 0.15;
                if (enemy.vector[0] == 0) {
                    enemy.position[0] -= dt * GAME.enemySpeed;                    
                } else {
                    enemy.position[0] += enemy.vector[0] * dt * GAME.enemySpeed;    
                }                
                enemy.position[1] += 1.5 * enemy.vector[1] - 2*Math.sin(enemy.cosine);
                if (enemy.position[1] > canvas.height) {
                    enemiesPool.removeEnemy(enemies, e);
                }
            } else if (enemy.isWaiting) {
                if (Date.now() > enemy.lastWait + GAME.delayEnemy) {
                    enemy.isWaiting = false;
                }
            } else if (!enemy.isJumping) {
                if (enemy.tilePosition[1] < GAME.boardRows-1) {
                    enemy.isJumping = true;
                    enemy.vector = [(Math.random() < 0.5) ? 0 : 1, 1];
                    enemy.lastJump = Date.now();
                    enemy.cosine = 0;
                } else {
                    enemy.isExitting = true;
                    enemy.cosine = 0;
                }
            } else if (enemy.isJumping) {
                enemy.cosine += GAME.enemySpeed * dt * 0.2;
                if (enemy.vector[0] == 0) {
                    enemy.position[0] -= dt * GAME.enemySpeed;   
                } else {
                    enemy.position[0] += enemy.vector[0] * dt * GAME.enemySpeed;    
                }
                enemy.position[1] += enemy.vector[1] - 1.25*Math.sin(enemy.cosine);
                if (Date.now() - enemy.lastJump > GAME.delayJumpEnemy) {
                    enemy.tilePosition[0] += enemy.vector[0];
                    enemy.tilePosition[1] += enemy.vector[1];
                    positionEnemy(enemy);
                    enemy.isJumping = false;
                    enemy.isWaiting = true;
                    enemy.lastWait = Date.now();
                }
            }
        }
    }

    function checkWin() {
        if (visitedQubes >= numQubes()) {
            visitedQubes = 0;
            for (var i = 0; i < board.length; i++) {
                board[i].isVisited = false;
            }
            for (var e = 0; i < enemies.length; e++) {
                enemiesPool.removeEnemy(enemies, e);
            }
            level++;
            levelForTiles = level % (GAME.maxLevelsForTiles + 1);
            tile.spriteForNotVisited = new Sprite("game/images/qbert.png", [(levelForTiles - 1) * GAME.qubeWidth * 2.5, 320], [GAME.qubeWidth, GAME.qubeHeight], 0, 1, "horizontal", true);
            tile.spriteForVisited = new Sprite("game/images/qbert.png", [(levelForTiles - 1) * GAME.qubeWidth * 2.5, 384], [GAME.qubeWidth, GAME.qubeHeight], 0, 1, "horizontal", true);
            resetQBert();
        }
    }

    function checkDeath() {
        for (var e = enemies.length-1; e >= 0; e--) {
            var enemy = enemies[e];
            if (enemy.isEntering || enemy.isExitting) continue;
            if (enemy.tilePosition[0] == qBert.tilePosition[0] && enemy.tilePosition[1] == qBert.tilePosition[1]) {
                qBert.isDead = true;
                if (availableLives > 1) {
                    availableLives--;
                    playSfxSound(1);
                } else {
                    gameOver();
                } 
                break;
            }
        }
    }

    function gameOver() {
        isGameOver = true;
        playGameOver();
    }

    function playGameOver() {
        stopBgMusic();
        playSfxSound(2);
    }

    function numQubes() {
        return (GAME.boardRows + 1) * GAME.boardRows / 2;
    }

    function resetQBert() {
        qBert.tilePosition = [0, 0];
        qBert.vector = [0, 0];
        qBert.isJumping = false;
        qBert.isDead = false;
        qBert.lastJump = 0;
        qBert.cosine = 0;
        qBert.sprite = qBert.spriteA;
        positionQBert(false);
    }
    
    function renderBoard() {
        for (var i = 0; i < board.length; i++) {
            tile.position = board[i].position;
            tile.sprite = board[i].isVisited ? tile.spriteForVisited : tile.spriteForNotVisited;
            renderGameElement(tile);
        }
    }

    function renderQBert() {
        renderGameElement(qBert);
    }

    function renderEnemies() {
        for (var e=enemies.length-1; e>=0; e--) {
            renderGameElement(enemies[e]);
        }
    }

    function renderScoreAndLevel() {
        ctx.fillStyle = GAME.scoreFgColor;
        
        ctx.font = (canvas.height / 30) + "px \"Press Start 2P\", sans-serif";
        ctx.fillText("score: " + score, 16, 25);
        ctx.fillText("level: " + level, 16, 25 + (canvas.height / 30) * 1.5);
    }

    function renderAvailableLives() {
        if (availableLives > 0) {
            for (var l = 0; l < availableLives - 1; l++) {
                live.position[0] = canvas.width/2 + l * 50;
                live.position[1] = 10
                renderGameElement(live);
            }
        }
    }

    function renderDeath() {
        if (!qBert.isDead) return;
        deadQBert.position[0] = qBert.position[0] - 16;
        deadQBert.position[1] = qBert.position[1] - 60;
        renderGameElement(deadQBert);
    }

    function renderGameOver() {
        if (isGameOver) {
            ctx.save();
            ctx.textAlign = "center";            
            ctx.font = (canvas.height / 15) + "px \"Press Start 2P\", sans-serif";

            ctx.fillStyle = "cyan"
            ctx.fillText("Game Over", canvas.width / 2 - 2, canvas.height / 2);
            ctx.fillStyle = "white"
            ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = "red"
            ctx.fillText("Game Over", canvas.width / 2 + 2, canvas.height / 2);

            ctx.font = (canvas.height / 35) + "px \"Press Start 2P\", sans-serif";
            const otherGameTxt = "Pulsa espacio para otra partida";
            var txtWidth = ctx.measureText(otherGameTxt).width;
            var paddingX = 20;
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            var rectX = canvas.width / 2 - txtWidth / 2 - paddingX;
            var rectY = canvas.height / 2 + 50 - (canvas.height / 35);
            var rectWidth = txtWidth + 2 * paddingX;
            var rectHeight = canvas.height / 35 * 2;
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
            ctx.fillStyle = "cyan";
            ctx.fillText(otherGameTxt, canvas.width / 2, canvas.height / 2 + 50);
            ctx.restore();
        }
    }

    function renderGameElement(element) {
        ctx.save();
        ctx.translate(element.position[0], element.position[1]);
        element.sprite.render(ctx);
        ctx.restore();
    }

    function canvasNotSupported() {
        // Browser does not support Canvas2D API
        console.log("Your browser does not support Canvas2D API")        
    }

    function restartGame() {
        isGameOver = false;
        loadBgMusicBuffer();
        resetGame();
    }

    function resetGame() {
        lastFrameTime = lastEnemyGenerationTime = performance.now();
        currentVariableTimeBetweenEnemies = Math.random() * GAME.variableTimeBetweenEnemies;
        availableLives = GAME.maxLives;
        visitedQubes = 0;
        score = 0;
        level = 1;
        tile.spriteForNotVisited = new Sprite("game/images/qbert.png", [(level - 1) * GAME.qubeWidth * 2.5, 320], [GAME.qubeWidth, GAME.qubeHeight], 0, 1, "horizontal", true);
        tile.spriteForVisited = new Sprite("game/images/qbert.png", [(level - 1) * GAME.qubeWidth * 2.5, 384], [GAME.qubeWidth, GAME.qubeHeight], 0, 1, "horizontal", true);
        qBert = {
            position: [0, 0],
            tilePosition: [0, 0],
            vector: [0, 0],
            speed: GAME.qBertSpeed,
            isJumping: false,
            lastJump: 0,
            isDead: false,
            cosine: 0,
            spriteS: new Sprite("game/images/qbert.png", [128, 0], [GAME.qBertWidth, GAME.qBertHeight], 5, [0, 1]),
            spriteA: new Sprite("game/images/qbert.png", [192, 0], [GAME.qBertWidth, GAME.qBertHeight], 5, [0, 1]),
            spriteW: new Sprite("game/images/qbert.png", [0, 0], [GAME.qBertWidth, GAME.qBertHeight], 5, [0, 1]),
            spriteQ: new Sprite("game/images/qbert.png", [64, 0], [GAME.qBertWidth, GAME.qBertHeight], 5, [0, 1]),
            sprite: null
        };
        qBert.sprite = qBert.spriteA;
        createGameBoard();
        positionQBert(false);
        main();
    }

    function init() {
        configureSound();
        resetGame();
    }

    function configureSound() {
        configureSoundContext();
        if (!disabledAudio) {
            loadBgMusicBuffer();
            loadSfxSoundsBuffer();
        }
    }

    function loadBgMusicBuffer() {
        const bufferLoader = new BufferLoader(
            audioContext,
            [ 'game/sounds/when-a-child-is-bored.mp3' ],
            finishedLoadingBgMusic);
        bufferLoader.load();
    }

    function loadSfxSoundsBuffer() {
        const bufferLoader = new BufferLoader(
            audioContext,
            [ 'game/sounds/gameboy-pluck.mp3',
              'game/sounds/dead.mp3',
              'game/sounds/game-over.mp3' ],
            finishedLoadingSfxSounds);
        bufferLoader.load();
    }

    function finishedLoadingSfxSounds(bufferList) {
        sfxBuffers = bufferList;
    }
    
    function playSfxSoundBuffer(buffer) {
        sfxSource = audioContext.createBufferSource();
        sfxSource.buffer = buffer;
        // Connect the source to the gain node.
        sfxSource.connect(sfxGainNode);
        // Connect the gain node to the destination.
        sfxGainNode.connect(audioContext.destination);
        sfxSource.start(0);
    }

    function playSfxSound(sfxIndex) {
        if (sfxBuffers && sfxBuffers.length > sfxIndex) {
            if (sfxSource) {
                sfxSource.stop();
            }
            playSfxSoundBuffer(sfxBuffers[sfxIndex]);
        }
    }

    function finishedLoadingBgMusic(bufferList) {
        bgSource = audioContext.createBufferSource();
        bgSource.buffer = bufferList[0];
        bgSource.loop = true;
        // Connect the source to the gain node.
        bgSource.connect(musicGainNode);
        // Connect the gain node to the destination.
        musicGainNode.connect(audioContext.destination);
        bgSource.start(0);
    }

    function stopBgMusic() {
        bgSource.stop();
    }

    function resumeBgMusic() {
        bgSource.start(0);
    }
    
    function configureSoundContext() {
        try {
            // for legacy browsers
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            // Create gain nodes
            musicGainNode = audioContext.createGain();
            musicGainNode.gain.value = GAME.musicGainValue;
            sfxGainNode = audioContext.createGain();
            sfxGainNode.gain.value = GAME.sfxGainValue;
            // Mute button
            const muteButton = document.getElementById("mute");
            muteButton.addEventListener(
                "click",
                () => {
                    if (musicGainNode.gain.value === 0) {
                        musicGainNode.gain.value = GAME.musicGainValue;
                        sfxGainNode.gain.value = GAME.sfxGainValue;
                        muteButton.innerText = "Mute"
                    } else {
                        musicGainNode.gain.value = 0;
                        sfxGainNode.gain.value = 0;
                        muteButton.innerText = "Sound"
                    }
                },
                false);
            
        } catch(e) {
            disabledAudio = true;
            console.error('Web Audio API is not supported in this browser');            
        }        
    }

    function createGameBoard() {
        board = [];
        const boardStartingY = canvas.height / 2 - GAME.boardRows / 2 * GAME.qubeHeight * 0.75;
        for (var row=0; row < GAME.boardRows; row++) {
            for (var col=0; col < row + 1; col++) {
                const x = col;
                const y = row;
                const z = col + row;
                const rowStartingX = (canvas.width / 2) - ((row + 1) * GAME.qubeWidth / 2);
                const position = [ rowStartingX + col * GAME.qubeWidth , boardStartingY + (y * GAME.qubeHeight * 0.75)];
                const isVisited = false;
                board.push(new Qube(x, y, z, position, isVisited))
            }
        }
    }

    function positionQBert(visitTile) {
        const tileX = qBert.tilePosition[0];
        const tileY = qBert.tilePosition[1];
        qBert.position = getQubePosition(tileX, tileY);        
        qBert.position[0] += GAME.qBertWidth / 2;
        qBert.position[1] -= GAME.qBertHeight / 2;
        if (visitTile) {
            const qube = getQube(tileX, tileY);
            if (!qube.isVisited) {
                visitedQubes++;
                qube.isVisited = true;
                playSfxSound(0);
                score += GAME.scorePerTileVisited;
                if ((availableLives < GAME.maxLives) &&
                    (score >= GAME.scoreExtraLive) &&
                    (score % GAME.scoreExtraLive === 0)) {
                    availableLives++;
                }
            }
        }
    }

    function positionEnemy(enemy) {
        const tileX = enemy.tilePosition[0];
        const tileY = enemy.tilePosition[1];
        enemy.position = getQubePosition(tileX, tileY);
        enemy.position[0] += 16;
        enemy.position[1] -= 16;
    }

    function getQube(x, y) {
        for (var i = 0; i < board.length; i++) {
            if (board[i].x === x && board[i].y === y) {
                return board[i];
            }
        }
        throw new Error(`Tile (${x}, ${y}) not found!`);        
    }
 
    function getQubePosition(x, y) {
        const qube = getQube(x, y)
        return [...qube.position];
    }
   
    function loadResources() {
        resources.load([
            "game/images/qbert.png"
        ]);
        resources.onReady(init);        
    }
    
    function loadingScreen() {
        ctx.save();
        ctx.fillStyle = GAME.loadingFgColor;
        ctx.font = (canvas.height / 10) + "px \"Press Start 2P\", sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Loading Assets...", canvas.width/2, canvas.height/2);
        ctx.restore();
    }

    function createGameCanvas() {
        var canvasElement = document.createElement("canvas");
        canvasElement.width = GAME.canvasWidth;
        canvasElement.height = GAME.canvasHeight;
        //var gameContainer = document.getElementsByClassName("ooo-qbert")[0];
        document.body.appendChild(canvasElement);
        return canvasElement;
    }

    function hideGameCover() {
        var decora = document.getElementsByClassName("ooo-decora")[0];
        decora.style.display = 'none';
        var gameContainer = document.getElementById("ooo-game");
        gameContainer.style.display = 'none';
        /*
        var gameContainer = document.getElementsByClassName("ooo-qbert")[0];
        var qBertImage = gameContainer.getElementsByTagName("img")[0];
        qBertImage.style.display = 'none';
        var buttons = gameContainer.getElementsByClassName("ooo-buttons")[0];
        buttons.style.display = 'none';
        */
    }

    function createMuteButton() {
        var gameContainer = document.getElementsByClassName("ooo-qbert")[0];
        var mute = document.createElement("button");
        mute.id = 'mute';
        mute.innerText = 'Mute';
        mute.className = 'ooo-btn';
        document.body.appendChild(mute);
    }

    function loadGame() {
        running = true;
        hideGameCover();
        canvas = createGameCanvas();
        createMuteButton();
        ctx = canvas.getContext("2d");
        if (!ctx) {
            canvasNotSupported();
        }
        loadingScreen();
        loadResources();
    }

    // Start game event
    document.getElementById("start-game").addEventListener(
        "click",
        () => {
            if (!running) {
                loadGame();
            }
        },
        false);
})();
