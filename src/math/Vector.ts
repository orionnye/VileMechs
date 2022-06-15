import { clamp, equals } from "./math"

export class Vector {
    readonly x: number
    readonly y: number

    static zero = new Vector( 0, 0 )
    static one = new Vector( 1, 1 )
    static right = new Vector( 1, 0 )
    static left = new Vector( -1, 0 )
    static down = new Vector( 0, 1 )
    static up = new Vector( 0, -1 )
    static upLeft = new Vector( -1, -1 )
    static upRight = new Vector( 1, -1 )
    static downLeft = new Vector( -1, 1 )
    static downRight = new Vector( 1, 1 )

    static cardinalDirections = [ Vector.right, Vector.down, Vector.left, Vector.up ]

    constructor( x, y ) {
        this.x = x
        this.y = y
    }
    subtract( other: Vector ) { return new Vector( this.x - other.x, this.y - other.y ) }
    add( other: Vector ) { return new Vector( this.x + other.x, this.y + other.y ) }
    addXY( x: number, y: number ) { return new Vector( this.x + x, this.y + y ) }
    product( other: Vector ) { return new Vector( this.x * other.x, this.y * other.y ) }
    scale( other: number ) { return new Vector( this.x * other, this.y * other ) }
    floor() { return new Vector( Math.floor( this.x ), Math.floor( this.y ) ) }
    ceil() { return new Vector( Math.ceil( this.x ), Math.ceil( this.y ) ) }
    distance( other: Vector ) { return this.subtract( other ).length }
    equals( other: Vector | null ) {
        if ( other == null ) return false
        return equals( this.x, other.x ) && equals( this.y, other.y )
    }
    signs() {
        return new Vector( Math.sign( this.x ), Math.sign( this.y ) )
    }
    lerp( other: Vector, alpha: number ) {
        let beta = 1 - alpha
        return new Vector( this.x * beta + other.x * alpha, this.y * beta + other.y * alpha )
    }
    get length() {
        let dist = Math.sqrt( this.x ** 2 + this.y ** 2 )
        return dist
    }
    toString() {
        return this.x + "," + this.y
    }

    unit() {
        return this.scale( 1 / this.length )
    }

    clampLength( min, max ) {
        let length = this.length
        let unit = this.scale( 1 / length )
        length = clamp( min, max, length )
        return unit.scale( length )
    }

    static lissajous( t, xFreq, yFreq, xAmplitude = 1, yAmplitude = xAmplitude, xPhase = 0, yPhase = 0 ) {
        return new Vector(
            Math.cos( Math.PI * 2 * ( t + xPhase ) * xFreq ) * xAmplitude,
            Math.sin( Math.PI * 2 * ( t + yPhase ) * yFreq ) * yAmplitude
        )
    }
}
