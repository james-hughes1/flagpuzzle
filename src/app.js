const blockGrid = document.getElementById('blockGrid');
const pauseMenu = document.getElementById('pauseMenu');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');

let blockMove = 'none';
let pause = 0;

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
            [[0,0],[0,1],[1,0],[1,1]]  // Square
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
            this.topLeftPosition.col--;
        } else if (dir === "right") {
            this.topLeftPosition.col++;
        }
    }
}

function playGame() {
    const numRows = 15;
    const numCols = 8;

    // Initialisation
    let cellStates = [];
    for (let row = 0; row < numRows; row++) {
        cellStates[row] = [];
        for (let col = 0; col < numCols; col++) {
            cellStates[row][col] = 0;
        }
    }
    let fallingBlock = new Block(numCols);
    // Render fallingBlock
    let blockPositions = fallingBlock.shapePositions();
    for (let cell = 0; cell < 4; cell++) {
        let cellPosition = blockPositions[cell];
        cellStates[cellPosition[0]][cellPosition[1]] = 2;
    }
    let falling = 1;

    // Initial display
    createGrid(numRows, numCols, cellStates);

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
                if (blockMove != 'none') {
                    let moveValid = true;
                    let contactPositions = fallingBlock.contactPositions(blockMove);
                    for (let cell = 0; cell < 4; cell++) {
                        let cellPosition = contactPositions[cell];
                        moveValid = moveValid && (cellStates[cellPosition[0]][cellPosition[1]] != 1);
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
                        blockMove = 'none';
                    }
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
                    // Transition from falling to stationary
                    falling = 0;
                    blockPositions = fallingBlock.shapePositions();
                    for (let cell = 0; cell < 4; cell++) {
                        let cellPosition = blockPositions[cell];
                        cellStates[cellPosition[0]][cellPosition[1]] = 1;
                    }
                }
            }
        }

        // Game over
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < numCols; col++) {
                if (cellStates[row][col] === 1) {
                    clearInterval(intervalId);
                }
            }
        }

        createGrid(numRows, numCols, cellStates);
    }, 200);
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
    }
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
