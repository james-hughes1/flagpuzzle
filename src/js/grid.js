import { Block, WaterGroup, FireGroup } from './blocks.js';

// Function to display grid

export class GridController {
  constructor(numRows, numCols, rowBuffer, blockGrid, document) {
    let cellStates = [];
    for (let row = 0; row < numRows; row++) {
      cellStates[row] = [];
      for (let col = 0; col < numCols; col++) {
        cellStates[row][col] = 0;
      }
    }
    this.cellStates = cellStates;
    this.numRows = numRows;
    this.numCols = numCols;
    this.rowBuffer = rowBuffer;
    this.blockGrid = blockGrid;
    this.document = document;
    this.waterGroup = new WaterGroup(numCols);
    this.fireGroup = new FireGroup(numCols);
  }

  render() {
    this.blockGrid.innerHTML = ''; // Clear existing grid

    for (let row = this.rowBuffer; row < this.numRows; row++) {
      for (let col = 0; col < this.numCols; col++) {
        const square = this.document.createElement('div');
        square.classList.add('square');
        square.dataset.row = row;
        square.dataset.col = col;
        if (this.cellStates[row][col] === 1) {
          // Stationary square
          square.classList.add('ground');
        } else if (this.cellStates[row][col] === 2) {
          // Falling square
          square.classList.add('falling');
        } else if ([3, 4, 5].includes(this.cellStates[row][col])) {
          // Water block, water object, inactive water object
          square.classList.add('rain');
        } else if ([6, 7, 8].includes(this.cellStates[row][col])) {
          // Fire block, fire object, inactive fire object
          square.classList.add('fire');
        }
        this.blockGrid.appendChild(square);
      }
    }
  }

  createFallingBlock() {
    // Create and render fallingBlock
    this.fallingBlock = new Block(this.numCols);
    let blockPositions = this.fallingBlock.shapePositions();
    for (let cell = 0; cell < 4; cell++) {
      let cellPosition = blockPositions[cell];
      this.cellStates[cellPosition[0]][cellPosition[1]] =
        this.fallingBlock.blockType;
    }
  }

  moveBlockCheck(blockMove) {
    // Moves blocks whilst checking that move is valid
    let moveValid = true;
    let contactPositions = this.fallingBlock.contactPositions(blockMove);
    for (let cell = 0; cell < 4; cell++) {
      let cellPosition = contactPositions[cell];
      moveValid =
        moveValid &&
        cellPosition[0] < this.numRows &&
        this.cellStates[cellPosition[0]][cellPosition[1]] != 1;
    }
    if (moveValid) {
      let blockPositions = this.fallingBlock.shapePositions();
      for (let cell = 0; cell < 4; cell++) {
        let cellPosition = blockPositions[cell];
        this.cellStates[cellPosition[0]][cellPosition[1]] = 0;
      }
      this.fallingBlock.move(blockMove);
      blockPositions = this.fallingBlock.shapePositions();
      for (let cell = 0; cell < 4; cell++) {
        let cellPosition = blockPositions[cell];
        this.cellStates[cellPosition[0]][cellPosition[1]] =
          this.fallingBlock.blockType;
      }
    }
    return moveValid;
  }

  resetFallingBlock() {
    // Changes shape of block and pushes to top
    this.fallingBlock.reset();
    let blockPositions = this.fallingBlock.shapePositions();
    for (let cell = 0; cell < 4; cell++) {
      let cellPosition = blockPositions[cell];
      this.cellStates[cellPosition[0]][cellPosition[1]] =
        this.fallingBlock.blockType;
    }
  }

  fallOneStep() {
    // Handle falling; simple one step fall
    // Make current cells air
    let blockPositions = this.fallingBlock.shapePositions();
    for (let cell = 0; cell < 4; cell++) {
      let cellPosition = blockPositions[cell];
      this.cellStates[cellPosition[0]][cellPosition[1]] = 0;
    }
    // Move block down
    this.fallingBlock.move('down');
    // Make new current cells block
    blockPositions = this.fallingBlock.shapePositions();
    for (let cell = 0; cell < 4; cell++) {
      let cellPosition = blockPositions[cell];
      this.cellStates[cellPosition[0]][cellPosition[1]] =
        this.fallingBlock.blockType;
    }
  }

  stillFallingCheck() {
    let stillFalling = true;
    let contactPositions = this.fallingBlock.contactPositions('down');
    for (let cell = 0; cell < 4; cell++) {
      let cellPosition = contactPositions[cell];
      stillFalling =
        stillFalling &&
        cellPosition[0] < this.numRows &&
        this.cellStates[cellPosition[0]][cellPosition[1]] != 1;
    }
    return stillFalling;
  }

  eliminateRows() {
    // Check for full rows to eliminate
    for (let row = this.rowBuffer; row < this.numRows; row++) {
      let fullRow = true;
      for (let col = 0; col < this.numCols; col++) {
        fullRow = fullRow && this.cellStates[row][col] === 1;
      }
      if (fullRow) {
        // Shift cell values down
        for (let aboveRow = row; aboveRow >= 0; aboveRow--) {
          for (let col = 0; col < this.numCols; col++) {
            if (aboveRow > 0) {
              this.cellStates[aboveRow][col] =
                this.cellStates[aboveRow - 1][col];
            } else {
              this.cellStates[aboveRow][col] = 0;
            }
          }
        }
      }
    }
  }

  solidify() {
    let blockPositions = this.fallingBlock.shapePositions();
    for (let cell = 0; cell < 4; cell++) {
      let cellPosition = blockPositions[cell];
      this.cellStates[cellPosition[0]][cellPosition[1]] = 1;
    }
  }

  waterMove() {
    let powerEnd = false;
    if (!this.waterGroup.spawned) {
      // Initialise
      this.waterGroup.spawn(this.cellStates);
    } else if (this.waterGroup.active) {
      // Move
      this.waterGroup.move(this.cellStates);
    } else {
      // End
      this.waterGroup.solidify(this.cellStates);
      powerEnd = true;
      // Eliminate rows
      this.eliminateRows();
    }
    return powerEnd;
  }

  fireMove() {
    let powerEnd = false;
    if (!this.fireGroup.spawned) {
      // Initialise
      this.fireGroup.spawn(this.cellStates);
    } else if (this.fireGroup.active) {
      // Move
      this.fireGroup.move(this.numRows, this.numCols, this.cellStates);
    } else {
      // End
      this.fireGroup.despawn(this.numRows, this.numCols, this.cellStates);
      powerEnd = true;
    }
    return powerEnd;
  }

  gameOver() {
    // Game over
    let gameOver = false;
    for (let row = 0; row < this.rowBuffer; row++) {
      for (let col = 0; col < this.numCols; col++) {
        if (this.cellStates[row][col] === 1) {
          gameOver = true;
        }
      }
    }
    return gameOver;
  }
}
