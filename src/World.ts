import Unit from "./Unit";
import Grid from "./Grid";
import Canvas from "./Canvas";
import { Vector } from "./math";
import { findPath } from "./pathfinding";

export default class World {

    map: Grid
    units: Unit[]

    static tileSize = 32;

    constructor() {
        this.map = new Grid( 10, 10 )
        this.units = [
            new Unit( new Vector( 0, 0 ) ),
            new Unit( new Vector( 1, 1 ) )
        ]

        let randomTerrain = false;
        if ( randomTerrain ) {
            this.map.randomize( 0.3 );
        } else {
            //custom map
            this.map.setBlock( new Vector( 2, 2 ), new Vector( 4, 4 ), 1 );
        }
    }

    render( c: Canvas ) {
        let tileSize = World.tileSize
        // let path = findPath( this, new Vector( 0, 0 ), new Vector( 6, 5 ) )
        // let tileDims = new Vector( tileSize, tileSize )
        // if ( path )
        //     for ( let step of path )
        //         c.drawRect( step.scale( tileSize ), tileDims, "red" )

        this.drawGrid( c, this.map )
        for ( let unit of this.units ) {
            let pos = unit.pos
            c.c.save()
            unit.render( c, unit.pos.scale( tileSize ) )
            c.c.restore()
        }
    }

    drawGrid( c: Canvas, grid: Grid, numbered: boolean = true ) {
        let tileSize = World.tileSize
        let tileDimensions = new Vector( tileSize, tileSize )
        grid.content.forEach( ( row, indexR ) => {
            row.forEach( ( tile, indexC ) => {
                let currentPos = new Vector( indexC * tileSize, indexR * tileSize );
                if ( tile.content == grid.wall ) {
                    c.drawRect( currentPos, tileDimensions, "grey" );
                }
                c.strokeRect( currentPos, tileDimensions );
                if ( numbered ) {
                    let textPos = new Vector( indexC * tileSize + 1, indexR * tileSize + 1 );
                    let currentText = indexC.toString() + ", " + indexR.toString();
                    c.drawText( textPos, ( tileSize / 8 ) | 0, currentText );
                }
            } );
        } );
    }
}