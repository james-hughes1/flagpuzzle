const blockGrid = document.getElementById('blockGrid');
const pauseMenu = document.getElementById('pauseMenu');
const endMenu = document.getElementById('endMenu');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const dropBtn = document.getElementById('dropBtn');
const scoreElements = document.querySelectorAll(".score");
const answerInput = document.getElementById('answerInput');
const flagImg = document.getElementById('flagImg');

const ROWBUFFER = 5;

// Read in number of rows and columns from html code and set CSS style
const numRows = parseInt(blockGrid.dataset.rows, 10) + ROWBUFFER;
blockGrid.style.setProperty("--rows", numRows - ROWBUFFER);
const numCols = parseInt(blockGrid.dataset.columns, 10);
blockGrid.style.setProperty("--columns", numCols);

let blockMoveUnlocked = false;
let blockMove = 'none';
let pause = 0;

const NUMCOUNTRIES = 20;

// Async function to country code mapping
async function loadCountries() {
    const response = await fetch('assets/iso-alpha-2-easy.json');
    const data = await response.json();
    return data;
}

// Function to get random country
async function updateCountry() {
    const countriesData = await loadCountries();
    const countries = Object.entries(countriesData);
    console.log(countries[countryIndex][1]);
    countryCode = countries[countryIndex][1]["alpha-2"].toLowerCase();
    answer = countries[countryIndex][1]["name"];
    flagImg.src = "/assets/flags/"+countryCode+".svg"
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
        if (pause == 0) {
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
                    // New flag
                    countryIndex = Math.floor(Math.random() * NUMCOUNTRIES);
                    updateCountry();
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
                            // Add to score if row eliminated
                            score++;
                            updateScoreCounter(score);
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
            blockMove = 'left';
            break;
        case 'ArrowRight':
            blockMove = 'right';
            break;
        case 'ArrowDown':
            blockMove = 'down';
            break;
        case 'Enter':
            if (answerInput.value.toLowerCase() === answer.toLowerCase()) {
                blockMoveUnlocked = true;
            }
            answerInput.value = '';
    }
});

// Drop button - same as clicking Enter
dropBtn.addEventListener('click', () => {
    if (answerInput.value.toLowerCase() === answer.toLowerCase()) {
        blockMoveUnlocked = true;
    }
    answerInput.value = '';
});

// Pause & Resume Menu
pauseBtn.addEventListener('click', () => {
    pauseMenu.style.display = 'block'; // Show the pause menu
    pause = 1;
});

resumeBtn.addEventListener('click', () => {
    pauseMenu.style.display = 'none'; // Hide the pause menu
    pause = 0;
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

// Initial country
let answer = "";
let countryIndex = 0;
let countryCode = "";
updateCountry();

// Initial display
createGrid(numRows, numCols, cellStates);

playGame();
