import { Vector } from "./math"
import Tile from "./tile"

export default class Grid {
    content: Tile[][]
    width: number
    height: number
    wall: number
    empty: number
    constructor( width, height ) {
        this.width = width
        this.height = height
        this.content = []
        //temporary fixed numbers
        this.wall = 1
        this.empty = 0
        for ( let r = 0; r < this.height; r++ ) {
            this.content.push( [] )
            for ( let c = 0; c < this.width; c++ ) {
                this.content[ r ].push( new Tile( this.empty ) )
            }
        }
    }
    randomize( blockChance: number ) {
        //TEMPORARY PLACEHOLDER NUMBER
        this.content.forEach( ( row, IRow ) => {
            row.forEach( ( tile, ICol ) => {
                let currentPos = new Vector( ICol, IRow )
                let isBlock = Math.random() < blockChance
                if ( isBlock )
                    this.set( currentPos, this.wall )
            } )
        } )
    }
    set( pos: Vector, value ) {
        if ( pos.y >= this.height || pos.x >= this.width )
            console.error( "tried setting value on grid that does not exist" )
        this.content[ pos.y ][ pos.x ].content = value
    }
    get( pos: Vector ) {
        return this.content[ pos.y ][ pos.x ]
    }
    setBlock( pos: Vector, size: Vector, value ) {
        if ( pos.y >= this.height || pos.x >= this.width )
            console.error( "tried setting value on grid that does not exist" )
        if ( pos.y + size.y >= this.height || pos.x + size.x >= this.width )
            console.error( "tried setting value on grid that does not exist" )
        for ( let r = pos.y; r < pos.y + size.y; r++ ) {
            for ( let c = pos.x; c < pos.x + size.x; c++ ) {
                this.content[ r ][ c ].content = value
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