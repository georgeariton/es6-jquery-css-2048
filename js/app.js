/**
 * Game
 * Main game class - keep in mind, this requires jQuery
 * @author geo.ariton
 */
class Game {
    constructor() {
        this.gridSize = 4;
        this.cellSize = 128;
        this.padding = 12;
        this.gridClass = ".game";
        this.scoreContainer = $(".score").find("span").first();
        this.grid = this.emptyGrid;
        this.rollDegree = 0;
        this.generateCells();
        this.populate();
        this.populate();
        this.drawGame();
        //this.handleListeners();
        this.handleRollListeners();
        this.moveLockTimout = 150;
        this.gameOver = false;
        this.canMove = true;
        this._score = 0;
    }

    /**
     * Sets the current score
     * @param value {number|*|val}
     */
    set score(value) {
        let val = this._score + (value*2);
        this.scoreContainer.text(val);
        this._score = val;
    }

    /**
     * Gets the current score
     * @returns {number|*|val}
     */
    get score() {
        return this._score;
    }

    /**
     * Computed value - generates an empty grid
     * @returns {Array}
     */
    get emptyGrid() {
        let self = this;
        let data = [];
        for (let y = 0; y < this.gridSize; y++) {
            data.push([]);
            for (let x = 0; x < this.gridSize; x++) {
                data[y].push(0);
            }
        }
        return data;
    }

    /**
     * Random number generator
     * @param min
     * @param max
     * @returns {*}
     */
    static randomNumber(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    /**
     * Populate with GridCell
     */
    generateCells() {
        let self = this;
        this.grid.forEach(function (row, y) {
            row.forEach(function (cell, x) {
                self.grid[y][x] = new GameCell(parseInt(y), parseInt(x), 0, self.cellSize, self.gridClass, self.padding);
            });
        })

    }

    /**
     * Populates the grid with 2 or 4, with 70% chance of being 2
     * @returns {*}
     */
    populate() {
        let x = Game.randomNumber(0, this.gridSize);
        let y = Game.randomNumber(0, this.gridSize);

        if (this.grid[y][x].value) {
            return this.populate();
        }

        let randomVal = Game.randomNumber(1, 10);
        this.grid[y][x].value = randomVal < 7 ? 2 : 4;
    }

    /**
     * Here we have all of the listeners for the game
     */
    handleListeners() {
        let self = this;
        $("body").on("keydown", function (e) {
            let key = e.keyCode;
            if (self.canMove) {
                switch (key) {
                    case 39:
                        self.moveRows(true);
                        self.lockMoves();
                        break;
                    case 37:
                        self.moveRows(false);
                        self.lockMoves();
                        break;
                    case 40:
                        self.moveCols(true);
                        self.lockMoves();
                        break;
                    case 38:
                        self.moveCols(false);
                        self.lockMoves();
                        break;
                }
            }
        });
    }

    /**
     * This will set the game to roll instead of just using the arrow keys
     */
    handleRollListeners() {
        let self = this;
        $("body").on("keydown", function (e) {
            let key = e.keyCode;
            if (self.canMove && [37, 39].indexOf(key) !== -1) {
                switch (key) {
                    // Right
                    case 39:
                        self.rollDegree += 90;
                        break;
                    // Left
                    case 37:
                        self.rollDegree -= 90;
                        break;
                }


                $(".game").css({
                    "transform": "rotate(" + self.rollDegree + "deg)"
                });

                $("#cell-dynamic-style").text(`
                    .game .cell span {
                        transform: rotate(` + (360 - self.rollDegree) + `deg);
                    }
                `);
                setTimeout(function() {
                    let rollDegree = 0;
                    if (self.rollDegree < 0) {
                        rollDegree = (self.rollDegree % 360) + 360;
                    } else {
                        rollDegree = self.rollDegree % 360;
                    }

                    console.log(self.rollDegree, rollDegree);

                    if (!(rollDegree%360)) {
                        console.log(360);
                        self.moveCols(true);
                    } else if (!(rollDegree%270)) {
                        console.log(270);
                        self.moveRows(false);
                    } else if (!(rollDegree%180)) {
                        console.log(180);
                        self.moveCols(false);
                    } else if (!(rollDegree%90)) {
                        console.log(90);
                        self.moveRows(true);
                    }
                }, 150);
                self.lockMoves();
            }
        });
    }

    /**
     * Draw the game
     * @param gameClass
     */
    drawGame() {
        this.gameLayout = new GameLayout(this.grid, this.gridClass, this.cellSize, this.padding);
    }

    /**
     * Handles moving on the X direction
     * @param reverse
     */
    moveRows(reverse) {
        let rows = [];
        let self = this;
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].value && rows.indexOf(y) == -1) {
                    rows.push(y);
                }
            }
        }

        rows.forEach(function(row) {
            self.moveRow(row, reverse);
        });

        this.commitAll();
    }

    /**
     * Moves a single row by the row id
     * @param rowId
     * @param reverse
     * @returns {*}
     */
    moveRow(rowId, reverse) {
        let self = this;
        let row = this.grid[rowId];
        let clonedRow = row.slice(0);
        if (reverse) {
            clonedRow.reverse();
        }

        let moved = false;

        for (let x = 0; x < self.gridSize; x++) {
            let nextIndex = x+1;
            if (nextIndex >= self.gridSize) {
                break;
            }

            let cell = clonedRow[x];
            let nextCell = clonedRow[nextIndex];

            if (nextCell.value && cell.value == 0) {
                nextCell.tempX = cell.x + 0;
                moved = true;
                break;
            } else if (cell.value && cell.value == nextCell.value && !cell.combined && !nextCell.combined) {
                self.score = cell.value;
                nextCell.tempX = cell.x + 0;
                moved = true;
                break;
            }
        }

        if (reverse) {
            clonedRow.reverse();
        }

        row = clonedRow;

        row.forEach(function (item) {
            if (item.isDirty) {
                let coords = item.changes;
                self.transitionTo(item.y, item.x, coords.y, coords.x);
            }
        });

        if (moved) {
           return self.moveRow(rowId, reverse);
        }
    }

    /**
     * Handles moving on the Y direction
     * @param reverse
     */
    moveCols(reverse) {
        let cols = [];
        let self = this;
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].value && cols.indexOf(x) == -1) {
                    cols.push(x);
                }
            }
        }

        cols.forEach(function(col) {
            self.moveCol(col, reverse);
        });

        this.commitAll();
    }

    /**
     * Move a single column by column id
     * @param colId
     * @param reverse
     * @returns {*}
     */
    moveCol(colId, reverse) {
        let self = this;
        let col = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (x == colId) {
                    col.push(this.grid[y][x]);
                }
            }
        }

        let clonedCol = col.slice(0);
        if (reverse) {
            clonedCol.reverse();
        }

        let moved = false;

        for (let x = 0; x < self.gridSize; x++) {
            let nextIndex = x+1;
            if (nextIndex >= self.gridSize) {
                break;
            }

            let cell = clonedCol[x];
            let nextCell = clonedCol[nextIndex];

            if (nextCell.value && cell.value == 0) {
                nextCell.tempY = cell.y + 0;
                moved = true;
                break;
            } else if (cell.value && cell.value == nextCell.value && !cell.combined &&  !nextCell.combined) {
                self.score = cell.value;
                nextCell.tempY = cell.y + 0;
                moved = true;
                break;
            }
        }

        if (reverse) {
            clonedCol.reverse();
        }

        col = clonedCol;

        col.forEach(function (item) {
            if (item.isDirty) {
                let coords = item.changes;
                self.transitionTo(item.y, item.x, coords.y, coords.x);
            }
        });

        if (moved) {
            return self.moveCol(colId, reverse);
        }

    };

    /**
     * Move a cell to another cell
     * @param y
     * @param x
     * @param newY
     * @param newX
     */
    transitionTo(y, x, newY, newX) {
        //@TODO: why is this happening?
        if (y == newY && x == newX) {
            return;
        }

        let cell = this.grid[y][x];
        let otherCell = this.grid[newY][newX];
        cell.transitionTo(otherCell);

        let newGrid = this.emptyGrid;

        this.grid.forEach(function (row) {
            row.forEach(function (cell) {
                newGrid[cell.y][cell.x] = cell;
            })
        });

        this.grid = newGrid;
    }


    /**
     * Check to see if there are any empty spots
     * @returns {boolean}
     */
    checkGameOver() {
        let found = false;
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].value == 0) {
                    found = true;
                }
            }
        }

        if (!found) {
            this.gameOver = true;
            this.alert();
        }

        return found;
    }

    /**
     * If there are any dirty cells, commit the changes
     */
    commitAll() {
        let self = this;
        this.changed = false;
        this.grid.forEach(function (row) {
            row.forEach(function (newCell) {
                if (newCell.isDirty) {
                    newCell.commit();
                    self.changed = true;
                }
            })
        });
    }

    /**
     * Locks the moves while the animations complete
     */
    lockMoves() {
        let self = this;
        self.canMove = false;
        setTimeout(function() {
            self.canMove = true;
            if (self.checkGameOver() && self.changed) {
                self.populate();
            }
        }, this.moveLockTimout);
    }

    /**
     * Alert stuff
     */
    alert() {
        if (this.gameOver) {
            console.log("Game Over");
        }
    }
}


let game;
$(document).ready(function () {
    game = new Game();
});