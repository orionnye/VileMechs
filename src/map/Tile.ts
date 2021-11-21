import Graphics from "../Graphics"

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
    constructor( options: { name: string, traversalCost: number, elevation: number, texture: HTMLImageElement } ) {
        super( options )
        this.traversalCost = options.traversalCost
        this.elevation = options.elevation
        this.texture = options.texture
    }
    getTraversalCost(): number { return this.traversalCost }
    getElevation(): number { return this.elevation }
    render( x: number, y: number ): void { Graphics.instance.c.drawImage( this.texture, x, y ) }
}