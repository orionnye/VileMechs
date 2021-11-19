import Graphics from "../Graphics"

// An instance of Tile does not represent an individual tile on the map.
// Each instance of Tile represents a type of tile.
export default abstract class Tile {
    readonly name: string
    constructor( options: { name: string } ) { this.name = options.name }
    abstract getTraversalCost(): number
    abstract render( x: number, y: number ): void
}

export class BasicTile extends Tile {
    readonly traversalCost: number
    readonly texture: HTMLImageElement
    constructor( options: { name: string, traversalCost: number, texture: HTMLImageElement } ) {
        super( options )
        this.traversalCost = options.traversalCost
        this.texture = options.texture
    }
    getTraversalCost(): number { return this.traversalCost }
    render( x: number, y: number ): void { Graphics.instance.c.drawImage( this.texture, x, y ) }
}