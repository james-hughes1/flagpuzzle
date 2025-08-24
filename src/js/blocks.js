import { SHAPES } from './shapes.js';

export class Block {
  constructor(numCols) {
    this.numCols = numCols;
    this.reset();
  }
  reset() {
    this.topLeftPosition = {
      row: 0,
      col: Math.floor(this.numCols * Math.random()),
    };
    let shapeId = Math.floor(SHAPES.length * Math.random());
    this.shape = SHAPES[shapeId];
    // Power blocks
    if (Math.random() < 0.5) {
      if (Math.random() < 0.5) {
        this.blockType = 3; // Water
      } else {
        this.blockType = 6; // Fire
      }
    } else {
      this.blockType = 2; // Normal
    }
  }
  shapePositions() {
    return this.shape.map((x) => [
      x[0] + this.topLeftPosition.row,
      (x[1] + this.topLeftPosition.col) % this.numCols,
    ]);
  }
  contactPositions(dir) {
    if (dir === 'down') {
      return this.shape.map((x) => [
        x[0] + this.topLeftPosition.row + 1,
        (x[1] + this.topLeftPosition.col) % this.numCols,
      ]);
    } else if (dir === 'left') {
      return this.shape.map((x) => [
        x[0] + this.topLeftPosition.row,
        (x[1] + this.topLeftPosition.col + this.numCols - 1) % this.numCols,
      ]);
    } else if (dir === 'right') {
      return this.shape.map((x) => [
        x[0] + this.topLeftPosition.row,
        (x[1] + this.topLeftPosition.col + 1) % this.numCols,
      ]);
    }
  }
  move(dir) {
    if (dir === 'down') {
      this.topLeftPosition.row++;
    } else if (dir === 'left') {
      this.topLeftPosition.col =
        (this.topLeftPosition.col + this.numCols - 1) % this.numCols;
    } else if (dir === 'right') {
      this.topLeftPosition.col =
        (this.topLeftPosition.col + this.numCols + 1) % this.numCols;
    }
  }
}

export class Water {
  constructor() {
    this.active = false;
    this.spawned = false;
  }
  spawn(cellStates, row, col) {
    this.position = { row: row, col: col };
    cellStates[this.position.row][this.position.col] = 4;
    this.active = true;
    this.spawned = true;
    this.percolation = 0;
    this.maxRow = cellStates.length - 1;
    while (cellStates[this.maxRow][this.position.col] != 0) {
      this.maxRow--;
    }
  }
  move(cellStates) {
    cellStates[this.position.row][this.position.col] = 0;
    // Don't move if at bottom
    if (this.position.row < this.maxRow && this.active) {
      // If cell below empty, move down once
      if (cellStates[this.position.row + 1][this.position.col] === 0) {
        this.position.row++;
        // For any obstacle besides water, move through it until the bottom, or empty, or inactive water below
      } else {
        if (this.percolation < 2) {
          this.percolation++;
          this.position.row++;
          while (
            this.position.row < this.maxRow &&
            cellStates[this.position.row][this.position.col] != 0 &&
            cellStates[this.position.row + 1][this.position.col] != 5
          ) {
            this.position.row++;
          }
        } else {
          // Water that can't percolate any further
          this.active = false;
          cellStates[this.position.row][this.position.col] = 5;
        }
      }
      if (this.position.row < this.maxRow) {
        if (cellStates[this.position.row + 1][this.position.col] === 5) {
          // Water collects on top of other water
          this.active = false;
          cellStates[this.position.row][this.position.col] = 5;
        } else {
          cellStates[this.position.row][this.position.col] = 4;
        }
      } else {
        // Water at the bottom
        this.active = false;
        cellStates[this.position.row][this.position.col] = 5;
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

export class WaterGroup {
  constructor(numCols) {
    this.active = false;
    this.spawned = false;
    this.numCols = numCols;
  }
  spawn(cellStates) {
    this.waterArray = [];
    this.active = true;
    this.spawned = true;
    this.numWater = 0;
    for (let row = 2; row >= 0; row--) {
      for (let col = 0; col < this.numCols; col++) {
        if (Math.random() > 0.5) {
          this.waterArray.push(new Water());
          this.waterArray[this.numWater].spawn(cellStates, row, col);
          this.numWater++;
        }
      }
    }
  }
  move(cellStates) {
    let numActive = this.numWater;
    for (let i = 0; i < this.numWater; i++) {
      this.waterArray[i].move(cellStates);
      if (!this.waterArray[i].active) {
        numActive--;
      }
    }
    if (numActive === 0) {
      this.active = false;
    }
  }
  solidify(cellStates) {
    for (let i = 0; i < this.numWater; i++) {
      cellStates[this.waterArray[i].position.row][
        this.waterArray[i].position.col
      ] = 1;
    }
    this.spawned = false;
  }
}

export class Fire {
  constructor(numCols) {
    this.active = false;
    this.spawned = false;
    this.numCols = numCols;
  }
  spawn(cellStates, row, col) {
    this.position = { row: row, col: col };
    cellStates[this.position.row][this.position.col] = 6;
    this.active = true;
    this.spawned = true;
  }
  move(cellStates) {
    cellStates[this.position.row][this.position.col] = 0;
    // Don't move if at bottom
    if (this.position.row < cellStates.length - 1 && this.active) {
      // If cell below empty, move down once
      if (
        [0, 7].includes(cellStates[this.position.row + 1][this.position.col])
      ) {
        this.position.row++;
        cellStates[this.position.row][this.position.col] = 6;
      } else {
        this.active = false;
        this.explode(cellStates);
      }
    } else {
      this.active = false;
      this.explode(cellStates);
    }
  }
  explode(cellStates) {
    if (this.spawned) {
      for (
        let row = this.position.row - 1;
        row <= Math.min(cellStates.length - 1, this.position.row + 1);
        row++
      ) {
        cellStates[row][(this.position.col - 1) % this.numCols] = 7;
        cellStates[row][this.position.col] = 7;
        cellStates[row][(this.position.col + 1) % this.numCols] = 7;
      }
    }
    this.spawned = false;
  }
}

export class FireGroup {
  constructor(numCols) {
    this.active = false;
    this.spawned = false;
    this.numCols = numCols;
  }
  spawn(cellStates) {
    this.fireArray = [];
    this.active = true;
    this.spawned = true;
    this.numFire = 0;
    for (let row = 4; row >= 0; row--) {
      for (let col = 0; col < this.numCols; col++) {
        if (Math.random() < 0.05) {
          this.fireArray.push(new Fire(this.numCols));
          this.fireArray[this.numFire].spawn(cellStates, row, col);
          this.numFire++;
        }
      }
    }
  }
  move(numRows, numCols, cellStates) {
    // Clear explosions
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        if (cellStates[row][col] === 7) {
          cellStates[row][col] = 0;
        }
      }
    }
    let numActive = this.numFire;
    for (let i = 0; i < this.numFire; i++) {
      this.fireArray[i].move(cellStates);
      if (!this.fireArray[i].active) {
        numActive--;
      }
    }
    if (numActive === 0) {
      this.active = false;
    }
  }
  despawn(numRows, numCols, cellStates) {
    // Clear explosions
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        if (cellStates[row][col] === 7) {
          cellStates[row][col] = 0;
        }
      }
    }
    this.spawned = false;
  }
}
