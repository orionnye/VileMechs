const epsilon = 0.00001

function equals( a: number, b: number ) {
    return Math.abs( a - b ) < epsilon
}

export class Vector {
    x: number
    y: number
    static zero = new Vector( 0, 0 )
    static one = new Vector( 1, 1 )
    static right = new Vector( 1, 0 )
    static down = new Vector( 0, 1 )
    constructor( x, y ) {
        this.x = x
        this.y = y
    }
    subtract( other: Vector ) {
        return new Vector( this.x - other.x, this.y - other.y )
    }
    add( other: Vector ) {
        return new Vector( this.x + other.x, this.y + other.y )
    }
    product( other: Vector ) {
        return new Vector( this.x * other.x, this.y * other.y )
    }
    scale( other: number ) {
        return new Vector( this.x * other, this.y * other )
    }
    equals( other: Vector | null ) {
        if ( other == null ) return false
        return equals( this.x, other.x ) && equals( this.y, other.y )
    }
    floor() {
        return new Vector( Math.floor( this.x ), Math.floor( this.y ) )
    }
    lerp( other: Vector, alpha: number ) {
        let beta = 1 - alpha
        return new Vector( this.x * beta + other.x * alpha, this.y * beta + other.y * alpha )
    }
    distance( other: Vector ) {
        return this.subtract( other ).length
    }
    get length() {
        let dist = Math.sqrt( this.x ** 2 + this.y ** 2 )
        return dist
    }
    toString() {
        return this.x + "," + this.y
    }
}

export function randomFloor( upperLimit: number ) {
    return Math.floor( Math.random() * upperLimit );
}

export class AABB {
    minx: number
    miny: number
    maxx: number
    maxy: number

    constructor( minx: number, miny: number, maxx: number, maxy: number ) {
        this.minx = minx
        this.miny = miny
        this.maxx = maxx
        this.maxy = maxy
    }

    static fromDimensions( pos: Vector, dimensions: Vector ) {
        return new AABB( pos.x, pos.y, pos.x + dimensions.x, pos.y + dimensions.y )
    }

    hull( a: AABB, b: AABB ) {
        function min( x, y ) { return Math.min( x, y ) }
        function max( x, y ) { return Math.max( x, y ) }
        return new AABB(
            min( a.minx, b.minx ),
            min( a.miny, b.miny ),
            max( a.maxx, b.maxx ),
            max( a.maxy, b.maxy ),
        )
    }

    contains( p: Vector ) {
        let { minx, miny, maxx, maxy } = this
        return p.x >= minx && p.x <= maxx && p.y >= miny && p.y <= maxy
    }
}

export function contains( min: number, max: number, x: number ) {
    return min >= x && max >= x
}