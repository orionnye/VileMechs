import Graphics from "../../common/Graphics"
import { Vector } from "../../math/Vector"
import Match from "../../stages/Match"

// An instance of Tile does not represent an individual tile on the map.
// Each instance of Tile represents a type of tile.
export default abstract class Tile {
    readonly name: string
    constructor( options: { name: string } ) { this.name = options.name }
    abstract getTraversalCost(): number
    abstract getElevation(): number
    abstract render( x: number, y: number ): void
}

export class BasicTile extends Tile {
    readonly traversalCost: number
    readonly elevation: number
    readonly texture: HTMLImageElement
    readonly align: Vector // Controls which side to align to the grid, both vertically and horizontally.
    constructor( options: {
        name: string, traversalCost: number, elevation: number, texture: HTMLImageElement,
        align?: Vector
    } ) {
        super( options )
        this.traversalCost = options.traversalCost
        this.elevation = options.elevation
        this.texture = options.texture
        this.align = options.align ?? Vector.upLeft
    }
    getTraversalCost(): number { return this.traversalCost }
    getElevation(): number { return this.elevation }
    render( x: number, y: number ): void {
        let g = Graphics.instance
        let c = g.c

        let tileSize = new Vector( Match.tileSize, Match.tileSize )
        let texSize = new Vector( this.texture.width, this.texture.height )
        let offsetAlpha = this.align.addXY( 1, 1 ).scale( 0.5 )
        // Move UL corner to alignment-origin, then shift back by the dimensions of the texture.
        let offset = tileSize.product( offsetAlpha ).subtract( texSize.product( offsetAlpha ) )

        c.save()
        g.vTranslate( offset )
        c.drawImage( this.texture, x, y )
        c.restore()
    }
}