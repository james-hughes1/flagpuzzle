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
const hintCountry = document.getElementById('hintCountry');
const tick = document.getElementById('tick');
const keys = document.querySelectorAll(".key");
const spaceButton = document.getElementById("space");
const backspaceButton = document.getElementById("backspace");
const clearButton = document.getElementById("clear");
const powerImgArray = document.querySelectorAll('.powerImg');
const powerSlotArray = document.querySelectorAll('.powerSlot');
const ROWBUFFER = 10;

// Read in number of rows and columns from html code and set CSS style
const numRows = parseInt(blockGrid.dataset.rows, 10) + ROWBUFFER;
blockGrid.style.setProperty("--rows", numRows - ROWBUFFER);
const numCols = parseInt(blockGrid.dataset.columns, 10);
blockGrid.style.setProperty("--columns", numCols);

let blockMoveUnlocked = false;
let blockMove = 'none';
let pause = false;

const NUMCOUNTRIES = 249;

// Async function to country code mapping
async function loadCountries() {
    const response = await fetch('assets/iso-alpha-2.json');
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
    hintCountry.textContent = answer;
}

// Update powers
function updatePowers(powerStates) {
    console.log(powerStates);
    for (let powerId=0; powerId < 3; powerId++) {
        if (powerId < powerStates.length) {
            if (powerStates[powerId] === "water") {
                powerImgArray[powerId].style.display = "block";
                powerImgArray[powerId].src = "assets/rain.png";
            } else {
                powerImgArray[powerId].style.display = "none";
            }
        } else {
            powerImgArray[powerId].style.display = "none";
        }
    }
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
    let qIndex = 0;
    if (seenIndices.length === 0) {
        let i = Math.floor(Math.random() * unseenIndices.length);
        qIndex = unseenIndices[i];
    } else if (unseenIndices.length === 0) {
        let i = Math.floor(Math.random() * seenIndices.length);
        qIndex = seenIndices[i];
    } else {
        // At the start choose unseen flags more frequently
        let newRate = 0.0;
        if (seenIndices.length > 50) {
            newRate = 0.2;
        } else if (seenIndices.length > 5) {
            newRate = 0.4;
        } else {
            newRate = 0.8;
        }
        let seenAgain = (Math.random() > newRate);
        if (seenAgain) {
            let i = Math.floor(Math.random() * seenIndices.length);
            qIndex = seenIndices[i];
        } else {
            let i = Math.floor(Math.random() * unseenIndices.length);
            qIndex = unseenIndices[i];
        }
    }
    return qIndex;
}

function updateRecord(record, index, result) {
    if (result === "correct") {
        record[index].correct++;
    } else {
        record[index].incorrect++;
    }
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
                square.classList.add('ground');
            } else if (cellStates[row][col] === 2) {
                // Falling square
                square.classList.add('falling')
            } else if ([3,4,5].includes(cellStates[row][col])) {
                // Water block, water object, inactive water object
                square.classList.add('rain')
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
        // Power blocks
        if (Math.random() > 0.5) {
            this.blockType = 3; // Water
        } else {
            this.blockType = 2; // Normal
        }
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

class Water {
    constructor() {
        this.active = false;
        this.spawned = false;
    }
    spawn(cellStates, row, col) {
        this.position = {row: row, col: col};
        cellStates[this.position.row][this.position.col] = 4;
        this.active = true;
        this.spawned = true;
        this.percolation = 0;
    }
    move(cellStates) {
        cellStates[this.position.row][this.position.col] = 0;
        // Don't move if at bottom
        if ((this.position.row < cellStates.length - 1) && this.active) {
            // If cell below empty, move down once
            if (cellStates[this.position.row+1][this.position.col] === 0) {
                this.position.row++;
            // For any obstacle besides water, move through it until the bottom, or empty, or inactive water below
            } else if (this.percolation < 2) {
                this.percolation++;
                this.position.row++;
                while ((this.position.row < cellStates.length - 1) && (cellStates[this.position.row][this.position.col] != 0) && (cellStates[this.position.row+1][this.position.col] != 5)) {
                    this.position.row++;
                }
            }
            if (this.position.row+1 < cellStates.length) {
                if (cellStates[this.position.row+1][this.position.col] === 5) {
                    // Water collects on top of other water
                    this.active = false;
                    cellStates[this.position.row][this.position.col] = 5;
                } else {
                    cellStates[this.position.row][this.position.col] = 4;
                }
            }
        } else {
            this.active = false;
            cellStates[this.position.row][this.position.col] = 5;
        }
    }
    solidify(cellStates) {
        cellStates[this.position.row][this.position.col] = 1;
        this.spawned = false;
    }
}

class WaterGroup {
    constructor(numCols) {
        this.active = false;
        this.spawned = false;
        this.waterArray = [];
        this.numWater = Math.ceil(Math.sqrt(Math.random()) * 3 * numCols);
        this.numCols = numCols;
        for (let i=0; i < this.numWater; i++) {
            this.waterArray.push(new Water());
        }
    }
    spawn(cellStates) {
        this.active = true;
        this.spawned = true;
        let i = 0;
        for (let row=2; row >=0; row--) {
            for (let col=0; col < this.numCols; col++) {
                if ((Math.random() < this.numWater / (3 * this.numCols)) && (i<this.numWater)) {
                    this.waterArray[i].spawn(cellStates, row, col);
                    i++;
                }
            }
        }
    }
    move(cellStates) {
        let numActive = this.numWater;
        for (let i=0; i < this.numWater; i++) {
            this.waterArray[i].move(cellStates);
            if (!this.waterArray[i].active) {
                numActive--;
            }
        }
        if (numActive === 0) {this.active = false};
    }
    solidify(cellStates) {
        for (let i=0; i < this.numWater; i++) {
            cellStates[this.waterArray[i].position.row][this.waterArray[i].position.col] = 1;
        }
        this.spawned = false;
    }
}

function eliminateRows(cellStates) {
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
    return cellStates;
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
                cellStates[cellPosition[0]][cellPosition[1]] = fallingBlock.blockType;
            }
        }
        return moveValid;
    }

    // Game loop
    intervalId = setInterval(() => {
        // Check unpaused
        if (!pause) {
            if (!powerActive) {
                // Square movement
                if (!falling) {
                    // Square falling
                    fallingBlock.reset();
                    blockPositions = fallingBlock.shapePositions();
                    for (let cell = 0; cell < 4; cell++) {
                        let cellPosition = blockPositions[cell];
                        cellStates[cellPosition[0]][cellPosition[1]] = fallingBlock.blockType;
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
                            cellStates[cellPosition[0]][cellPosition[1]] = fallingBlock.blockType;
                        }
                    } else {
                        // Handle hitting the floor
                        falling = false;
                        blockMoveUnlocked = false;
                        // Increase game speed
                        timeInterval *= 0.99;
                        clearInterval(intervalId);
                        playGame();
                        // Update record and show hint
                        if (answerCorrect) {
                            countryRecord = updateRecord(countryRecord, countryIndex, "correct");
                            answerCorrect = false;
                            // New flag
                            countryIndex = smartIndex(countryRecord);
                            updateCountry();
                            tick.style.display = 'none';
                        } else {
                            countryRecord = updateRecord(countryRecord, countryIndex, "incorrect");
                            // Show hint of flag
                            pause = true;
                            hintMenu.style.display = 'block';
                            setTimeout(() => {
                                pause = false;
                                hintMenu.style.display = 'none';
                                // New flag
                                countryIndex = smartIndex(countryRecord);
                                updateCountry();
                                tick.style.display = 'none';
                            }, 3000)
                        }
                        // Switch to power if used
                        if (powerUsed != "none") {
                            powerActive = true;
                        }
                        // Change to fixed cells
                        blockPositions = fallingBlock.shapePositions();
                        for (let cell = 0; cell < 4; cell++) {
                            let cellPosition = blockPositions[cell];
                            cellStates[cellPosition[0]][cellPosition[1]] = 1;
                        }
                        // Eliminate rows
                        cellStates = eliminateRows(cellStates);
                    }
                }
            } else {
                // Powers
                if (powerUsed === "water") {
                    if (!waterGroup.spawned) {
                        // Initialise
                        waterGroup.spawn(cellStates);
                    } else if (waterGroup.active) {
                        // Move
                        waterGroup.move(cellStates)
                    } else {
                        // End
                        waterGroup.solidify(cellStates);
                        powerUsed = "none";
                        powerActive = false;
                        // Eliminate rows
                        cellStates = eliminateRows(cellStates);
                    }
                    createGrid(numRows, numCols, cellStates);
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
            if (!pause) {
                if (answerInput.value.toLowerCase() != answer.toLowerCase()) {
                    blockMove = 'down';
                } else {
                    tick.style.display = 'block';
                    score++;
                    if ((fallingBlock.blockType === 3) && (powers.length < 3)) {
                        powers.push("water");
                        updatePowers(powers);
                    }
                    updateScoreCounter(score);
                    answerCorrect = true;
                }
                blockMoveUnlocked = true;
                answerInput.value = '';
            }
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
            if (answerCorrect) {
                blockMove = 'right';
            }
        } else {
            if (answerCorrect) {
                blockMove = 'left';
            }
        }
    }
    // If the swipe is vertical
    else {
        if (yDiff > 0) {
            if (answerCorrect) {
                blockMove = 'down';
            }
        }
    }
}

// Enter button - same as clicking Enter
enterBtn.addEventListener('click', () => {
    if (!pause) {
        if (answerInput.value.toLowerCase() != answer.toLowerCase()) {
            blockMove = 'down';
        } else {
            tick.style.display = 'block';
            score++;
            if ((fallingBlock.blockType === 3) && (powers.length < 3)) {
                powers.push("water");
                updatePowers(powers);
            }
            updateScoreCounter(score);
            answerCorrect = true;
        }
        blockMoveUnlocked = true;
        answerInput.value = '';
    }
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

// Keyboard actions
// Add event listeners for the keys
keys.forEach(key => {
    key.addEventListener("click", function() {
        const keyValue = key.getAttribute("data-key");
        answerInput.value += keyValue;
    });
});

// Space button
spaceButton.addEventListener("click", function() {
    answerInput.value += " ";
});

// Backspace button
backspaceButton.addEventListener("click", function() {
    answerInput.value = answerInput.value.slice(0, -1);
});

// Clear button
clearButton.addEventListener("click", function() {
    answerInput.value = "";
});

// Power buttons
powerSlotArray.forEach(slot => {
    slot.addEventListener("click", function() {
        const slotNumber = parseInt(slot.getAttribute("data-number"), 10);
        if ((powers.length > slotNumber) && (powerUsed === "none")) {
            powerUsed = powers[slotNumber];
            powers.splice(slotNumber, 1);
            updatePowers(powers);
        }
    });
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
    cellStates[cellPosition[0]][cellPosition[1]] = fallingBlock.blockType;
}
let falling = true;
let answerCorrect = false;

// Create water
waterGroup = new WaterGroup(numCols);

// Initial country
let answer = "";
let countryIndex = 0;
let countryCode = "";
updateCountry();

// Powers
let powers = [];
updatePowers(powers);
let powerUsed = "none";
let powerActive = false;

// Initial display
createGrid(numRows, numCols, cellStates);

playGame();
