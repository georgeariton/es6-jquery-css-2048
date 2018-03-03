/**
 * GameLayout
 * Handles the grid, it will also handle other aspects eventually
 * @author geo.ariton
 */
class GameLayout {
    /**
     * @param grid
     * @param parent
     * @param cellSize
     * @param padding
     */
    constructor(grid, parent, cellSize, padding) {
        this.grid = grid;
        this.padding = padding;
        this.gridLength = this.grid[0].length;
        this.parent = $(parent);
        this.cellSize = cellSize;
        this.drawnCells = [];
        this.initializeGrid();
    }

    /**
     * Void
     */
    initializeGrid() {
        let self = this;
        let gridSizePX = ((this.gridLength * this.cellSize) + this.padding) + "px";

        this.parent.css({
            "width": gridSizePX,
            "height": gridSizePX
        });
    }
}
