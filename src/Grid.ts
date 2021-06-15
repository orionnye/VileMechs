import { Vector } from "./math"
import Tile from "./tile"

export default class Grid {
    private content: Tile[]
    width: number
    height: number
    wall: number = 1
    empty: number = 0
    constructor( width, height ) {
        this.width = width
        this.height = height
        this.content = []
        for ( let i = 0; i < width * height; i++ )
            this.content.push( new Tile( this.empty ) )
    }
    randomize( blockChance: number ) {
        for ( let y = 0; y < this.height; y++ ) {
            for ( let x = 0; x < this.width; x++ ) {
                let isBlock = Math.random() < blockChance
                if ( isBlock )
                    this.setFromXY( x, y, this.wall )
            }
        }
    }
    set( pos: Vector, value ) {
        this.setFromXY( pos.x, pos.y, value )
    }
    setFromXY( x: number, y: number, value ) {
        if ( y >= this.height || x >= this.width ) {
            console.error( "tried setting value on grid that does not exist" )
            return
        }
        this.content[ y * this.width + x ].content = value
    }
    get( pos: Vector ) {
        return this.getFromXY( pos.x, pos.y )
    }
    getFromXY( x: number, y: number ) {
        return this.content[ y * this.width + x ]
    }
    setBlock( pos: Vector, size: Vector, value ) {
        if (
            pos.y < 0 || pos.x < 0 ||
            pos.y >= this.height || pos.x >= this.width ||
            pos.y + size.y >= this.height || pos.x + size.x >= this.width
        ) {
            console.error( "tried setting value on grid that does not exist" )
            return
        }
        for ( let y = pos.y; y < pos.y + size.y; y++ ) {
            for ( let x = pos.x; x < pos.x + size.x; x++ ) {
                this.setFromXY( x, y, value )
            }
        }
    }
    contains( pos: Vector ) {
        return pos.y >= 0 && pos.x >= 0 && pos.x < this.width && pos.y < this.height
    }
    isEmpty( pos: Vector ) {
        return this.get( pos ).content == this.empty
    }
}