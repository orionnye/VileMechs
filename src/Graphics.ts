import { Vector } from "./math/Vector"

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

    vTranslate( v: Vector ) {
        this.c.translate( v.x, v.y )
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
    strokeCircle( pos: Vector, radius: number, color: string = "black" ) {
        this.c.beginPath()
        this.c.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        this.c.strokeStyle = color
        this.c.stroke()
    }
    fillCircle( pos: Vector, radius: number, color: string = "black" ) {
        this.c.beginPath()
        this.c.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        this.c.fillStyle = color
        this.c.fill()
    }

    makePath( path: Vector[] ) {
        if ( path.length == 0 )
            return
        this.c.beginPath()
        this.c.moveTo( path[ 0 ].x, path[ 0 ].y )
        for ( let i = 1; i < path.length; i++ )
            this.c.lineTo( path[ i ].x, path[ i ].y )
    }

    setFont( size: number, font: string ) {
        this.c.font = size + "px " + font
    }

    textDimensions( text: string ) {
        let metrics = this.c.measureText( text )
        return new Vector( metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent )
    }

    drawText( pos: Vector, text: string, color: string = "black" ) {
        this.c.fillStyle = color
        this.c.fillText( text, pos.x, pos.y )
    }

    drawTextBox( pos: Vector, text: string, options: { padding?: number, textColor?: string, boxColor?: string, alignX?: TextAlignX, alignY?: TextAlignY } ) {
        let padding = options.padding ?? 1
        let textColor = options.textColor ?? "white"
        let boxColor = options.boxColor ?? "black"
        let alignX = options.alignX ?? TextAlignX.left
        let alignY = options.alignY ?? TextAlignY.top

        let metrics = this.c.measureText( text )

        let p = padding, p2 = padding * 2
        let textDims = new Vector( metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent )
        let textBoxDims = textDims.addXY( p2, p2 )
        let textBoxOffset = pos.addXY( -textBoxDims.x * alignX, -textBoxDims.y * alignY )
        let textOffset = textBoxOffset.addXY( p, p + metrics.actualBoundingBoxAscent )
        this.drawRect( textBoxOffset, textBoxDims, boxColor )
        this.drawText( textOffset, text, textColor )

        return textBoxDims
    }

    drawSheetFrame( img: HTMLImageElement, frameHeight: number, x: number, y: number, frame: number ) {
        let w = img.width
        let h = frameHeight
        this.c.drawImage( img, 0, h * frame, w, h, x, y, w, h )
    }
}

export enum TextAlignX { left = 0, center = .5, right = 1 }
export enum TextAlignY { top = 0, center = .5, bottom = 1 }