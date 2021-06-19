import { Vector } from "./math";

export default class Graphics {
    static instance: Graphics
    canvas: HTMLCanvasElement
    c: CanvasRenderingContext2D
    size!: Vector
    constructor() {
        Graphics.instance = this
        this.canvas = <HTMLCanvasElement>document.getElementById( "canvas1" )
        this.c = this.canvas.getContext( "2d" ) as CanvasRenderingContext2D
        this.onResize()
    }

    onResize() {
        let { canvas } = this
        let rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
        this.size = new Vector( this.canvas.width, this.canvas.height )
    }

    drawRect( pos: Vector, size: Vector, color: string = "red" ) {
        this.c.fillStyle = color
        this.c.beginPath()
        this.c.fillRect( pos.x, pos.y, size.x, size.y )
    }

    strokeRect( pos: Vector, size: Vector, color: string = "black" ) {
        this.c.strokeStyle = color
        this.c.beginPath()
        this.c.strokeRect( pos.x, pos.y, size.x, size.y )
    }

    makePath( path: Vector[] ) {
        if ( path.length == 0 )
            return
        this.c.beginPath()
        this.c.moveTo( path[ 0 ].x, path[ 0 ].y )
        for ( let i = 1; i < path.length; i++ )
            this.c.lineTo( path[ i ].x, path[ i ].y )
    }

    drawText( pos: Vector, size: number, text: string, color: string = "black" ) {
        this.c.fillStyle = color
        // this.c.font = size + "px Times New Roman"
        this.c.font = size + "px pixel";
        let metrics = this.c.measureText( text )
        this.c.fillText( text, pos.x, pos.y + metrics.actualBoundingBoxAscent )
    }
}