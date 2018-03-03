/**
 * GameCell
 * A single game cell that exists on the "table"
 * @author geo.ariton
 */
class GameCell {
    /**
     * @param y
     * @param x
     * @param value
     * @param cellSize
     * @param parent
     * @param padding
     */
    constructor(y, x, value, cellSize, parent, padding) {
        this.y = y;
        this.x = x;
        this.parent = $(parent);
        this.cellSize = cellSize;
        this.value = value;
        this.uuid = y + "-" + x;
        this.padding = padding;
        this.combined = false;
    }

    /**
     * Set the current value and create an element if needed
     * @param val
     */
    set value(val) {
        this._value = val;

        if (this.value) {
            if (!this.elt) {
                this.elt = $(this.cellTemplate());
                this.elt.appendTo(this.parent);
            }
            this.elt.html(`<span>${(this.value)}</span>`);
        }
    }

    /**
     * Gets the current value of the cell
     * @returns {*}
     */
    get value() {
        return this._value;
    }

    /**
     * Pushes the X value of the current move
     * @param value
     */
    set tempX(value) {
        if (value || value === 0) {
            if (this._tempX) {
                this._tempX.push(value);
            } else {
                this._tempX = [value];
            }
        }
    }

    /**
     * Gets the latest X value pushed into the array
     * @returns {*}
     */
    get tempX() {
        if (this._tempX) {
            return this._tempX[this._tempX.length-1];
        } else {
            return false;
        }
    }

    /**
     * Pushes the Y value of the current move
     * @param value
     */
    set tempY(value) {
        if (value || value === 0) {
            if (this._tempY) {
                this._tempY.push(value);
            } else {
                this._tempY = [value];
            }
        }
    }
    /**
     * Gets the latest Y value pushed into the array
     * @returns {*}
     */
    get tempY() {
        if (this._tempY) {
            return this._tempY[this._tempY.length-1];
        } else {
            return false;
        }
    }

    /**
     * Checks if the cell is dirty and removes the "new" DOM class
     * @returns {Array|boolean}
     */
    get isDirty() {
        if (this.elt) {
            this.elt.removeClass("new");
        }

        return (this._tempX && this._tempX.length != 0) || (this._tempY && this._tempY.length != 0);
    }

    /**
     * Gets the changes if the cell if there are any pushed
     * @returns {{x: *, y: *}}
     */
    get changes() {
        return {
            x: (this._tempX && this._tempX.length > 0 ? this.tempX : this.x) + 0,
            y: (this._tempY && this._tempY.length > 0 ? this.tempY : this.y) + 0
        };
    }

    /**
     * The template of the cell
     * @returns {*}
     */
    cellTemplate() {
        let top = ((this.cellSize * this.y) + this.padding) + "px";
        let left = ((this.cellSize * this.x) + this.padding) + "px";
        return `<div class='cell bounce-in new' style='width: ${this.cellSize-this.padding}px; height: ${this.cellSize-this.padding}px; top: ${top}; left: ${left}'></div>`;
    }

    /**
     * Move cell to the position of the current cell, and if the values are the same
     * their values merge
     * @param otherCell
     */
    transitionTo(otherCell) {
        var newX = this.x + 0;
        var newY = this.y + 0;

        this.x = otherCell.x + 0;
        this.y = otherCell.y + 0;

        otherCell.x = newX;
        otherCell.y = newY;

        if (otherCell.value == this.value) {
            otherCell.value = 0;
            otherCell.reset();
            otherCell.clear();
            this.value += this.value;
            this.combined = true;
        }
    }

    /**
     * Does the actual change to the cells position - currently using CSS
     */
    commit() {
        if (this.isDirty && this.elt) {
            let top = ((this.cellSize * this.y) + this.padding) + "px";
            let left = ((this.cellSize * this.x) + this.padding) + "px";
            this.elt.css({
                top: top,
                left: left
            });
        }
        this.reset();
    }

    /**
     * Resets internal values
     */
    reset() {
        this.combined = false;
        this._tempX = [];
        this._tempY = [];
    }

    /**
     * Clears the DOM element from the grid
     */
    clear() {
        if (this.elt) {
            var self = this;
            var toRemove = this.elt;
            setTimeout(function() {
                toRemove.remove();
            }, 150);
            self.elt = null;
        }
    }
}