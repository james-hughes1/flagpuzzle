const blockGrid = document.getElementById('blockGrid');
const pauseMenu = document.getElementById('pauseMenu');
const endMenu = document.getElementById('endMenu');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const dropBtn = document.getElementById('dropBtn');
const scoreElements = document.querySelectorAll(".score");

let blockMove = 'none';
let pause = 0;

function updateScoreCounter(score) {
    // Update the text content of each element
    scoreElements.forEach(span => {
        span.textContent = score;
    });
}

// Function to create a grid
function createGrid(numRows, numCols, cellStates) {
    blockGrid.innerHTML = ''; // Clear existing grid

    for (let row = 0; row < numRows; row++) {
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
            } else if (row < 4) {
                square.classList.add('grey');
            }
            blockGrid.appendChild(square);
        }
    }
}

// 
class Block {
    constructor(numCols) {
        this.numCols = numCols;
        this.reset()
    }
    reset() {
        this.topLeftPosition = {row: 0, col: Math.floor(this.numCols * Math.random())};
        const shapeList = [
            [[0,1],[1,1],[1,0],[0,2]], // ZigZagR
            [[0,0],[0,1],[1,0],[1,1]], // Square
            [[2,0],[0,1],[1,1],[2,1]],  // J
            [[0,0],[0,1],[1,1],[0,2]], // T
            [[0,0],[1,0],[2,0],[3,0]], // I
            [[0,0],[1,0],[1,1],[2,1]]  // ZigZagD
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

function playGame() {
    const numRows = 15;
    const numCols = 8;
    const timeInterval = 500;

    // Initialisation
    let cellStates = [];
    for (let row = 0; row < numRows; row++) {
        cellStates[row] = [];
        for (let col = 0; col < numCols; col++) {
            cellStates[row][col] = 0;
        }
    }
    let fallingBlock = new Block(numCols);
    let score = 0;

    // Hide end menu
    let end = false;
    endMenu.style.display = 'none'

    // Render fallingBlock
    let blockPositions = fallingBlock.shapePositions();
    for (let cell = 0; cell < 4; cell++) {
        let cellPosition = blockPositions[cell];
        cellStates[cellPosition[0]][cellPosition[1]] = 2;
    }
    let falling = 1;

    // Initial display
    createGrid(numRows, numCols, cellStates);

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
            if (falling === 0) {
                // Square falling
                fallingBlock.reset();
                blockPositions = fallingBlock.shapePositions();
                for (let cell = 0; cell < 4; cell++) {
                    let cellPosition = blockPositions[cell];
                    cellStates[cellPosition[0]][cellPosition[1]] = 2;
                }
                falling = 1;
            } else {
                // Moving block left, right, or down
                if (blockMove != 'none') {
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
                // Transition from falling to stationary
                let stillFalling = true;
                contactPositions = fallingBlock.contactPositions("down");
                for (let cell = 0; cell < 4; cell++) {
                    let cellPosition = contactPositions[cell];
                    stillFalling = stillFalling && (cellPosition[0] < numRows) && (cellStates[cellPosition[0]][cellPosition[1]] != 1);
                }
                if (stillFalling) {
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
                    falling = 0;
                    blockPositions = fallingBlock.shapePositions();
                    for (let cell = 0; cell < 4; cell++) {
                        let cellPosition = blockPositions[cell];
                        cellStates[cellPosition[0]][cellPosition[1]] = 1;
                    }
                    // Check for full rows to eliminate
                    for (let row = 4; row < numRows; row++) {
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
                            // Add to score
                            score++;
                            updateScoreCounter(score);
                        }
                    }
                }
            }
        }

        // Game over
        for (let row = 0; row < 4; row++) {
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
        case 'Enter':
            blockMove = 'down';
            break;
    }
});

// Drop button
dropBtn.addEventListener('click', () => {
    blockMove = 'down';
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

// Run game

playGame();

