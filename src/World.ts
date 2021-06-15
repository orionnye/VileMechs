import Unit from "./Unit";
import Grid from "./Grid";
import Canvas from "./Canvas";
import { Vector } from "./math";
import { findPath } from "./pathfinding";
import Game from "./Game";

import ashyTileSrc from "../www/images/AshyTileV2.png";
const ashyTileImg = new Image();
ashyTileImg.src = ashyTileSrc;

import hillTileSrc from "../www/images/tiles/flat/hill5.png";
const hillTileImg = new Image();
hillTileImg.src = hillTileSrc;

import grassTileSrc from "../www/images/tiles/flat/grass.png"
const grassTileImg = new Image();
grassTileImg.src = grassTileSrc;

export default class World {

    map: Grid
    units: Unit[]

    static tileSize = 32;
    static tileDimensions = new Vector( World.tileSize, World.tileSize )

    constructor() {
        this.map = new Grid( 10, 10 )
        this.units = [
            new Unit( new Vector( 0, 0 ) ),
            new Unit( new Vector( 1, 1 ) ),
            new Unit( new Vector( 8, 9 ) ),
            new Unit( new Vector( 7, 8 ) ),
        ]

        let randomTerrain = false;
        if ( randomTerrain ) {
            this.map.randomize( 0.3 );
        } else {
            //custom map
            this.map.setBlock( new Vector( 2, 2 ), new Vector( 4, 4 ), 1 );
            this.map.set( new Vector( 2, 2 ), 0 )
        }
    }

    onClick( cursor: Vector, game: Game ) {
        let cell = cursor.floor()
        let selectedUnit = game.ui.getSelectedUnit( this )
        for ( let unit of this.units ) {
            if ( unit.pos.equals( cell ) ) {
                console.log( unit )
                if ( unit == selectedUnit )
                    game.ui.deselectUnit()
                else
                    game.ui.selectUnit( this, unit )
                return
            }
        }
        if ( selectedUnit ) {
            let path = findPath( this, selectedUnit.pos, cell )
            if ( path )
                selectedUnit.pos = cell
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

        this.drawMap( cv )
        if ( cursorWalkable && selectedUnit != undefined ) {
            let path = findPath( this, selectedUnit.pos, cursor )
            if ( path ) {
                cv.c.save()
                cv.makePath( path.map( x => x.add( Vector.one.scale( 0.5 ) ).scale( tileSize ) ) )
                cv.c.strokeStyle = "#c2eaff"
                cv.c.lineJoin = "round"
                cv.c.lineWidth = 2
                cv.c.stroke()

                cv.c.beginPath()
                let endpoint = cursor.add( Vector.one.scale( 0.5 ) ).scale( tileSize )
                cv.c.arc( endpoint.x, endpoint.y, 2, 0, Math.PI * 2 )
                cv.c.fillStyle = "#c2eaff"
                cv.c.fill()

                cv.c.restore()
            }
        }

        for ( let unit of this.units ) {
            cv.c.save()
            if ( unit == selectedUnit ) {
                cv.c.shadowBlur = 10
                cv.c.shadowColor = "black"
            }
            unit.render( cv, unit.pos.scale( tileSize ) )
            cv.c.restore()
        }
    }

    drawMap( cv: Canvas, numbered: boolean = false ) {
        let map = this.map
        let tileSize = World.tileSize
        let tileDimensions = World.tileDimensions
        for ( let y = 0; y < map.height; y++ ) {
            for ( let x = 0; x < map.width; x++ ) {
                let currentPos = new Vector( x * tileSize, y * tileSize )
                let tile = map.getFromXY( x, y )
                //default square
                if ( tile.content == map.wall ) {
                    // cv.drawRect( currentPos, tileDimensions, "grey" );
                    cv.c.drawImage( hillTileImg, currentPos.x, currentPos.y )
                } else {
                    cv.c.drawImage( grassTileImg, currentPos.x, currentPos.y )
                }
                // cv.strokeRect( currentPos, tileDimensions );
                if ( numbered ) {
                    let textPos = new Vector( x * tileSize + 1, y * tileSize + 1 )
                    let currentText = x.toString() + ", " + y.toString()
                    cv.drawText( textPos, ( tileSize / 8 ) | 0, currentText )
                }
            }
        }
    }
}