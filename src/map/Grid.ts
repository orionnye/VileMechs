import { Vector } from "../math/Vector"
import Tile from "./Tile"
import * as Tiles from "./Tiles"

export default class Grid {
    private content: Tile[]
    width: number
    height: number
    constructor( width, height ) {
        this.width = width
        this.height = height
        this.content = []
        for ( let i = 0; i < width * height; i++ )
            this.content.push( Tiles.Grass )
    }
    randomize( blockChance: number, tile: Tile ) {
        for ( let y = 0; y < this.height; y++ ) {
            for ( let x = 0; x < this.width; x++ ) {
                let isBlock = Math.random() < blockChance
                if ( isBlock )
                    this.setFromXY( x, y, tile )
            }
        }
    }
    // // Use when you want guarenteed features.
    // addFeatures( tile: Tile, amount: number, canPlace: ( x, y ) => boolean ) {
    //     let { width, height } = this
    //     let count = 0
    //     while ( count < amount ) {
    //         let x = Math.random() * width | 0
    //         let y = Math.random() * height | 0
    //         if ( canPlace( x, y ) ) {
    //             this.setFromXY( x, y, tile )
    //             count++
    //         }
    //     }
    // }
    set( pos: Vector, value ) {
        this.setFromXY( pos.x, pos.y, value )
    }
    setFromXY( x: number, y: number, value ) {
        if ( y >= this.height || x >= this.width ) {
            console.error( "tried setting value on grid that does not exist" )
            return
        }
        this.content[ y * this.width + x ] = value
    }
    get( pos: Vector ) {
        return this.getFromXY( pos.x, pos.y )
    }
    getFromXY( x: number, y: number ) {
        return this.content[ y * this.width + x ]
    }
    fillRect( pos: Vector, size: Vector, value ) {
        let startX = Math.max( 0, pos.x )
        let startY = Math.max( 0, pos.y )
        let endX = Math.min( pos.x + size.x, this.width )
        let endY = Math.min( pos.y + size.y, this.height )
        for ( let y = startY; y < endY; y++ ) {
            for ( let x = startX; x < endX; x++ ) {
                this.setFromXY( x, y, value )
            }
        }
    }
    contains( pos: Vector ) {
        return pos.y >= 0 && pos.x >= 0 && pos.x < this.width && pos.y < this.height
    }
    isEmpty( pos: Vector ) {
        return this.get( pos ).getTraversalCost() != Infinity
    }
}