const blockGrid = document.getElementById('blockGrid');
const pauseMenu = document.getElementById('pauseMenu');
const endMenu = document.getElementById('endMenu');
const hintMenu = document.getElementById('hintMenu')
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const enterBtn = document.getElementById('enterBtn');
const scoreElements = document.querySelectorAll(".score");
const answerInput = document.getElementById('answerInput');
const flagImg = document.getElementById('flagImg');
const hintImg = document.getElementById('hintImg');
const hintCountry = document.getElementById('hintCountry')
const tick = document.getElementById('tick')
const ROWBUFFER = 10;

// Read in number of rows and columns from html code and set CSS style
const numRows = parseInt(blockGrid.dataset.rows, 10) + ROWBUFFER;
blockGrid.style.setProperty("--rows", numRows - ROWBUFFER);
const numCols = parseInt(blockGrid.dataset.columns, 10);
blockGrid.style.setProperty("--columns", numCols);

let blockMoveUnlocked = false;
let blockMove = 'none';
let pause = false;

const NUMCOUNTRIES = 20;

// Async function to country code mapping
async function loadCountries() {
    const response = await fetch('assets/iso-alpha-2-easy.json');
    const data = await response.json();
    return data;
}

// Function to get country
async function updateCountry() {
    const countriesData = await loadCountries();
    const countries = Object.entries(countriesData);
    countryCode = countries[countryIndex][1]["alpha-2"].toLowerCase();
    answer = countries[countryIndex][1]["name"];
    flagImg.src = "/assets/flags/"+countryCode+".svg"
    hintImg.src = "/assets/flags/"+countryCode+".svg"
    hintCountry.textContent = answer
}

// Smart question selector
let countryRecord = [];
for (let qIndex = 0; qIndex < NUMCOUNTRIES; qIndex++) {
    countryRecord[qIndex] = {index: qIndex, correct: 0, incorrect: 0};
}

function smartIndex(record) {
    let seenIndices = [];
    let unseenIndices = [];
    for (let qIndex = 0; qIndex < NUMCOUNTRIES; qIndex++) {
        if (record[qIndex].correct + record[qIndex].incorrect > 0) {
            for (let i = 0; i < 1 + record[qIndex].incorrect; i++) {
                seenIndices.push(qIndex);
            }
        } else {
            unseenIndices.push(qIndex);
        }
    }
    let seenAgain = (Math.random() > 0.2);
    let qIndex = 0;
    if (seenAgain) {
        let i = Math.floor(Math.random() * seenIndices.length);
        qIndex = seenIndices[i];
    } else {
        let i = Math.floor(Math.random() * unseenIndices.length);
        qIndex = unseenIndices[i];
    }
    console.log(qIndex);
    return qIndex;
}

function updateRecord(record, index, result) {
    if (result === "correct") {
        record[index].correct++;
    } else {
        record[index].incorrect++;
    }
    console.log(record);
    return record;
}

function updateScoreCounter(score) {
    // Update the text content of each element
    scoreElements.forEach(span => {
        span.textContent = score;
    });
}

// Function to create a grid
function createGrid(numRows, numCols, cellStates) {
    blockGrid.innerHTML = ''; // Clear existing grid

    for (let row = ROWBUFFER; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.row = row;
            square.dataset.col = col;
            if (cellStates[row][col] === 1) {
                // Stationary square
                square.classList.add('red');
            } else if (cellStates[row][col] === 2) {
                // Falling square
                square.classList.add('blue')
            }
            blockGrid.appendChild(square);
        }
    }
}

class Block {
    constructor(numCols) {
        this.numCols = numCols;
        this.reset()
    }
    reset() {
        this.topLeftPosition = {row: 0, col: Math.floor(this.numCols * Math.random())};
        const shapeList = [
            [[0,0],[0,1],[1,1],[1,2]], // Z000
            [[2,0],[1,0],[1,1],[0,1]], // Z090
            [[0,1],[1,1],[1,0],[0,2]], // ZF000
            [[0,0],[1,0],[1,1],[2,1]], // ZF090
            [[0,0],[0,1],[1,0],[1,1]], // S000
            [[2,0],[0,1],[1,1],[2,1]], // J000
            [[0,0],[0,1],[0,2],[1,2]], // J090
            [[0,0],[1,0],[2,0],[0,1]], // J180
            [[0,0],[1,0],[1,1],[2,1]], // J270
            [[0,0],[1,0],[2,0],[2,1]], // L000
            [[1,0],[1,1],[2,1],[2,0]], // L090
            [[0,0],[0,1],[1,1],[2,1]], // L180
            [[0,0],[1,0],[0,1],[0,2]], // L270
            [[0,0],[0,1],[1,1],[0,2]], // T000
            [[0,0],[1,0],[2,0],[1,1]], // T090
            [[1,0],[1,1],[1,2],[0,1]], // T180
            [[1,0],[0,1],[1,1],[2,1]], // T270
            [[0,0],[1,0],[2,0],[3,0]], // I000
            [[0,0],[0,1],[0,2],[0,3]] // I090
        ];
        let shapeId = Math.floor(shapeList.length * Math.random());
        this.shape = shapeList[shapeId];
    }
    shapePositions() {
        return this.shape.map(x => [x[0]+this.topLeftPosition.row, (x[1]+this.topLeftPosition.col) % this.numCols]);
    }
    contactPositions(dir) {
        if (dir === "down") {
            return this.shape.map(x => [x[0]+this.topLeftPosition.row+1, (x[1]+this.topLeftPosition.col) % this.numCols]);
        } else if (dir === "left") {
            return this.shape.map(x => [x[0]+this.topLeftPosition.row, (x[1]+this.topLeftPosition.col+this.numCols-1) % this.numCols]);
        } else if (dir === "right") {
            return this.shape.map(x => [x[0]+this.topLeftPosition.row, (x[1]+this.topLeftPosition.col+1) % this.numCols]);
        }
    }
    move(dir) {
        if (dir === "down") {
            this.topLeftPosition.row++;
        } else if (dir === "left") {
            this.topLeftPosition.col = (this.topLeftPosition.col + this.numCols - 1) % this.numCols;
        } else if (dir === "right") {
            this.topLeftPosition.col = (this.topLeftPosition.col + this.numCols + 1) % this.numCols;
        }
    }
}

// Game loop function
function playGame() {
    // Block move function
    function moveBlockCheck() {
        let moveValid = true;
        let contactPositions = fallingBlock.contactPositions(blockMove);
        for (let cell = 0; cell < 4; cell++) {
            let cellPosition = contactPositions[cell];
            moveValid = moveValid && (cellPosition[0] < numRows) && (cellStates[cellPosition[0]][cellPosition[1]] != 1);
        }
        if (moveValid) {
            blockPositions = fallingBlock.shapePositions();
            for (let cell = 0; cell < 4; cell++) {
                let cellPosition = blockPositions[cell];
                cellStates[cellPosition[0]][cellPosition[1]] = 0;
            }
            fallingBlock.move(blockMove);
            blockPositions = fallingBlock.shapePositions();
            for (let cell = 0; cell < 4; cell++) {
                let cellPosition = blockPositions[cell];
                cellStates[cellPosition[0]][cellPosition[1]] = 2;
            }
        }
        return moveValid;
    }

    // Game loop
    intervalId = setInterval(() => {
        // Check unpaused
        if (!pause) {
            // Square movement
            if (!falling) {
                // Square falling
                fallingBlock.reset();
                blockPositions = fallingBlock.shapePositions();
                for (let cell = 0; cell < 4; cell++) {
                    let cellPosition = blockPositions[cell];
                    cellStates[cellPosition[0]][cellPosition[1]] = 2;
                }
                falling = true;
            } else {
                // Moving block left, right, or down
                if (blockMove != 'none') {
                    if (blockMoveUnlocked) {
                        if (blockMove != 'down') {
                            moveBlockCheck();
                        } else {
                            moveValid = moveBlockCheck();
                            while (moveValid) {
                                moveValid = moveBlockCheck();
                            }
                        }
                        blockMove = 'none';
                    }
                }
                // Transition from falling to stationary
                // Check if hit floor
                let stillFalling = true;
                contactPositions = fallingBlock.contactPositions("down");
                for (let cell = 0; cell < 4; cell++) {
                    let cellPosition = contactPositions[cell];
                    stillFalling = stillFalling && (cellPosition[0] < numRows) && (cellStates[cellPosition[0]][cellPosition[1]] != 1);
                }
                if (stillFalling) {
                    // Handle falling
                    blockPositions = fallingBlock.shapePositions();
                    for (let cell = 0; cell < 4; cell++) {
                        let cellPosition = blockPositions[cell];
                        cellStates[cellPosition[0]][cellPosition[1]] = 0;
                    }
                    fallingBlock.move("down");
                    blockPositions = fallingBlock.shapePositions();
                    for (let cell = 0; cell < 4; cell++) {
                        let cellPosition = blockPositions[cell];
                        cellStates[cellPosition[0]][cellPosition[1]] = 2;
                    }
                } else {
                    // Handle hitting the floor
                    falling = false;
                    blockMoveUnlocked = false;
                    // Increase game speed
                    timeInterval *= 0.99;
                    clearInterval(intervalId);
                    playGame();
                    // Update record
                    if (answerCorrect) {
                        countryRecord = updateRecord(countryRecord, countryIndex, "correct");
                        answerCorrect = false;
                    } else {
                        countryRecord = updateRecord(countryRecord, countryIndex, "incorrect");
                    }
                    // New flag
                    countryIndex = smartIndex(countryRecord);
                    updateCountry();
                    tick.style.display = 'none';
                    // Change to fixed cells
                    blockPositions = fallingBlock.shapePositions();
                    for (let cell = 0; cell < 4; cell++) {
                        let cellPosition = blockPositions[cell];
                        cellStates[cellPosition[0]][cellPosition[1]] = 1;
                    }
                    // Check for full rows to eliminate
                    for (let row = ROWBUFFER; row < numRows; row++) {
                        let fullRow = true;
                        for (let col = 0; col < numCols; col++) {
                            fullRow = fullRow && (cellStates[row][col] === 1);
                        }
                        if (fullRow) {
                            // Shift cell values down
                            for (let aboveRow = row; aboveRow >= 0; aboveRow--) {
                                for (let col = 0; col < numCols; col++) {
                                    if (aboveRow > 0) {
                                        cellStates[aboveRow][col] = cellStates[aboveRow - 1][col];
                                    } else {
                                        cellStates[aboveRow][col] = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Game over
        for (let row = 0; row < ROWBUFFER; row++) {
            for (let col = 0; col < numCols; col++) {
                if (cellStates[row][col] === 1) {
                    clearInterval(intervalId);
                    end = true;
                }
            }
        }

        if (end) {
            // Display end Menu and score
            endMenu.style.display = 'block';
        }

        createGrid(numRows, numCols, cellStates);
    }, timeInterval);
}

// Add listeners for arrow key controls
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'ArrowLeft':
            if (answerCorrect) {
                blockMove = 'left';
            }
            break;
        case 'ArrowRight':
            if (answerCorrect) {
                blockMove = 'right';
            }
            break;
        case 'ArrowDown':
            if (answerCorrect) {
                blockMove = 'down';
            }
            break;
        case 'Enter':
            if (answerInput.value.toLowerCase() != answer.toLowerCase()) {
                blockMove = 'down';
                pause = true;
                hintMenu.style.display = 'block';
                setTimeout(() => {
                    pause = false;
                    hintMenu.style.display = 'none';
                }, 3000)
            } else {
                tick.style.display = 'block';
                score++;
                updateScoreCounter(score);
                answerCorrect = true;
            }
            blockMoveUnlocked = true;
            answerInput.value = '';
    }
});

// Add listeners for swipe actions
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX; // Get the touch start position
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX; // Get the touch end position
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
});

function handleSwipe() {
    const xDiff = touchEndX - touchStartX;
    const yDiff = touchEndY - touchStartY;

    // If the swipe is horizontal
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            console.log("Swiped Right");
            if (answerCorrect) {
                blockMove = 'right';
            }
        } else {
            console.log("Swiped Left");
            if (answerCorrect) {
                blockMove = 'left';
            }
        }
    }
    // If the swipe is vertical
    else {
        if (yDiff > 0) {
            console.log("Swiped Down");
            if (answerCorrect) {
                blockMove = 'down';
            }
        }
    }
}

// Enter button - same as clicking Enter
enterBtn.addEventListener('click', () => {
    if (answerInput.value.toLowerCase() != answer.toLowerCase()) {
        pause = true;
        hintMenu.style.display = 'block';
        setTimeout(() => {
            pause = false;
            hintMenu.style.display = 'none';
        }, 3000)
    } else {
        tick.style.display = 'block';
        score++;
        updateScoreCounter(score);
        answerCorrect = true;
    }
    blockMoveUnlocked = true;
    answerInput.value = '';
});

// Pause & Resume Menu
pauseBtn.addEventListener('click', () => {
    pauseMenu.style.display = 'block'; // Show the pause menu
    pause = true;
});

resumeBtn.addEventListener('click', () => {
    pauseMenu.style.display = 'none'; // Hide the pause menu
    pause = false;
});

// Initialise game parameters
let timeInterval = 500;
blockMoveUnlocked = false;
let cellStates = [];
for (let row = 0; row < numRows; row++) {
    cellStates[row] = [];
    for (let col = 0; col < numCols; col++) {
        cellStates[row][col] = 0;
    }
}
let score = 0;

// Hide end menu
let end = false;
endMenu.style.display = 'none'

// Create and render fallingBlock
let fallingBlock = new Block(numCols);
let blockPositions = fallingBlock.shapePositions();
for (let cell = 0; cell < 4; cell++) {
    let cellPosition = blockPositions[cell];
    cellStates[cellPosition[0]][cellPosition[1]] = 2;
}
let falling = true;
let answerCorrect = false;

// Initial country
let answer = "";
let countryIndex = 0;
let countryCode = "";
updateCountry();

// Initial display
createGrid(numRows, numCols, cellStates);

playGame();
