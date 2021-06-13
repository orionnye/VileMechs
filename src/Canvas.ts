import { Vector } from "./math";

export default class Context {
    canvas: HTMLCanvasElement
    c: CanvasRenderingContext2D
    size: Vector
    constructor() {
        this.canvas = <HTMLCanvasElement> document.getElementById("canvas1");
        this.c = this.canvas.getContext("2d");
        this.size = new Vector(this.canvas.clientWidth, this.canvas.clientHeight);
    }

    clear() {
        // Clear the page
        this.c.fillStyle = "beige";
        this.c.fillRect(0, 0, this.size.x, this.size.y);
}

    drawRect(pos: Vector, size: Vector, color: string = "red") {
        this.c.fillStyle = color;
        this.c.fillRect(pos.x, pos.y, size.x, size.y);
    }

    strokeRect(pos: Vector, size: Vector, color: string = "black") {
        this.c.strokeStyle = color;
        this.c.strokeRect(pos.x, pos.y, size.x, size.y);
    }

    drawText(pos: Vector, size: number, text: string, color: string = "black") {
        this.c.fillStyle = color;
        this.c.font = size + "px Times New Roman";
        this.c.fillText(text, pos.x + size, pos.y + size);
    }
}