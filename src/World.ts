import Unit from "./Unit";
import Grid from "./Grid";
import Canvas from "./Canvas";
import { Vector } from "./math";
import { findPath } from "./pathfinding";
import Game from "./Game";

export default class World {

    map: Grid
    units: Unit[]

    static tileSize = 32;
    static tileDimensions = new Vector( World.tileSize, World.tileSize )

    constructor() {
        this.map = new Grid( 10, 10 )
        // this.units = [
        //     new Unit( new Vector( 0, 0 ) ),
        //     new Unit( new Vector( 1, 1 ) ),
        //     new Unit( new Vector( 2, 0 ) ),
        //     new Unit( new Vector( 3, 1 ) ),
        // ]
        this.units = [
            new Unit( new Vector( 0, 0 ) ),
            new Unit( new Vector( 1, 1 ) ),
            new Unit( new Vector( 0, 9 ) ),
            new Unit( new Vector( 9, 9 ) ),
        ]

        let randomTerrain = false;
        if ( randomTerrain ) {
            this.map.randomize( 0.3 );
        } else {
            //custom map
            this.map.setBlock( new Vector( 2, 2 ), new Vector( 4, 4 ), 1 );
        }
    }

    isWalkable( pos: Vector ) {
        for ( let unit of this.units )
            if ( unit.pos.equals( pos ) )
                return false
        return this.map.contains( pos ) && this.map.isEmpty( pos )
    }

    render( cv: Canvas, game: Game ) {
        let tileSize = World.tileSize

        let cursor = game.worldCursor().floor()
        let selectedUnit = game.ui.getSelectedUnit( this )
        let cursorWalkable = this.isWalkable( cursor )

        if ( cursorWalkable && selectedUnit ) {
            let path = findPath( this, selectedUnit.pos, cursor )
            let tileDims = new Vector( tileSize, tileSize )
            if ( path )
                for ( let step of path )
                    cv.drawRect( step.scale( tileSize ), tileDims, "orange" )
        }
        this.drawMap( cv )
        if ( cursorWalkable ) {
            cv.strokeRect( cursor.scale( tileSize ), World.tileDimensions, "blue" )
        }

        for ( let unit of this.units ) {
            let pos = unit.pos
            cv.c.save()
            if ( unit == selectedUnit ) {
                cv.c.shadowBlur = 5
                cv.c.shadowColor = "black"
            }
            unit.render( cv, unit.pos.scale( tileSize ) )
            cv.c.restore()
        }
    }

    drawMap( cv: Canvas, numbered: boolean = true ) {
        let map = this.map
        let tileSize = World.tileSize
        let tileDimensions = World.tileDimensions
        map.content.forEach( ( row, indexR ) => {
            row.forEach( ( tile, indexC ) => {
                let currentPos = new Vector( indexC * tileSize, indexR * tileSize );
                if ( tile.content == map.wall )
                    cv.drawRect( currentPos, tileDimensions, "grey" );
                cv.strokeRect( currentPos, tileDimensions );
                if ( numbered ) {
                    let textPos = new Vector( indexC * tileSize + 1, indexR * tileSize + 1 );
                    let currentText = indexC.toString() + ", " + indexR.toString();
                    cv.drawText( textPos, ( tileSize / 8 ) | 0, currentText );
                }
            } );
        } );
    }
}