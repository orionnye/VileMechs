import { Vector } from "./math"
import Grid from "./grid"

//should recieve a world model
let canvas = <HTMLCanvasElement> document.getElementById("canvas1");
let canvasSize = new Vector(canvas.clientWidth, canvas.clientHeight);
let c = canvas.getContext('2d');

export function clearCanvas() {
        // Clear the page
        c.fillStyle = "beige";
        c.fillRect(0, 0, canvasSize.x, canvasSize.y);
}

//Grid Definition
export function drawGrid(grid: Grid, numbered: boolean = true) {
    let tileSize = grid.tileSize;
    grid.content.forEach((row, indexR) => {
        row.forEach((tile, indexC) => {
            let currentPos = new Vector(grid.pos.x + indexC * tileSize.x, grid.pos.y + indexR * tileSize.y);
            strokeRect(currentPos, tileSize);
            //type definition
            if (tile.content == 1) {
                drawRect(currentPos, tileSize, "grey");
            }
            //numbers
            if (numbered) {
                let textPos = new Vector(grid.pos.x + indexC * tileSize.x - tileSize.x / 3.3, grid.pos.y + indexR * tileSize.y);
                let currentText = indexC.toString() +", "+ indexR.toString();
                drawText(textPos, tileSize.x / 3.3, currentText);
            }
        });
    });
}

//Cell Definition
export function fillCell(cell: Vector, grid: Grid, color: string = "red") {
    let tileSize = new Vector(grid.size.x / grid.width, grid.size.y / grid.height);
    let currentPos = new Vector(grid.pos.x + cell.x * tileSize.x, grid.pos.y + cell.y * tileSize.y);
    drawRect(currentPos, tileSize, color);
}
export function drawRect(pos: Vector, size: Vector, color: string = "red") {
    c.fillStyle = color;
    c.fillRect(pos.x, pos.y, size.x, size.y);
}
export function strokeRect(pos: Vector, size: Vector, color: string = "black") {
    c.strokeStyle = color;
    c.strokeRect(pos.x, pos.y, size.x, size.y);
}

//Text
export function drawText(pos: Vector, size: number, text: string, color: string = "black") {
    c.fillStyle = color;
    c.font = size + "px Times New Roman";
    c.fillText(text, pos.x + size, pos.y + size);
}