import { Vector } from "./math";

export default class Canvas {
    canvas: HTMLCanvasElement
    c: CanvasRenderingContext2D
    size: Vector
    constructor() {
        this.canvas = <HTMLCanvasElement>document.getElementById( "canvas1" );
        this.c = this.canvas.getContext( "2d" ) as CanvasRenderingContext2D;
        this.size = new Vector( this.canvas.width, this.canvas.height );
    }

    clear() {
        // Clear the page
        this.c.fillStyle = "beige";
        this.c.fillRect( 0, 0, this.size.x, this.size.y );
    }

    drawRect( pos: Vector, size: Vector, color: string = "red" ) {
        this.c.fillStyle = color;
        this.c.fillRect( pos.x, pos.y, size.x, size.y );
    }

    strokeRect( pos: Vector, size: Vector, color: string = "black" ) {
        this.c.strokeStyle = color;
        this.c.strokeRect( pos.x, pos.y, size.x, size.y );
    }

    drawText( pos: Vector, size: number, text: string, color: string = "black" ) {
        this.c.fillStyle = color;
        // this.c.font = size + "px Times New Roman";
        this.c.font = size + "px pixel";
        let metrics = this.c.measureText( text )
        this.c.fillText( text, pos.x, pos.y + metrics.actualBoundingBoxAscent );
    }
}