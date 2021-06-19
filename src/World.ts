import Unit from "./Unit";
import Grid from "./Grid";
import Graphics from "./Graphics";
import { Vector } from "./math";
import { findPath } from "./pathfinding";
import Game from "./Game";
import { getImg } from "./utils";

const ashyTileImg = getImg( require( "../www/images/AshyTileV2.png" ) )
const hillTileImg = getImg( require( "../www/images/tiles/flat/hill5.png" ) )
const grassTileImg = getImg( require( "../www/images/tiles/flat/grass.png" ) );

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

        let randomTerrain = true;
        if ( randomTerrain ) {
            this.map.randomize( 0.3 )
            for ( let unit of this.units )
                this.map.set( unit.pos, 0 )
        } else {
            //custom map
            this.map.setBlock( new Vector( 2, 2 ), new Vector( 4, 4 ), 1 );
            this.map.setBlock( new Vector( 3, 3 ), new Vector( 2, 2 ), 0 );
            this.map.set( new Vector( 3, 2 ), 0 )
            this.map.set( new Vector( 4, 5 ), 0 )
        }
    }

    onClick( cursor: Vector ) {
        let cell = cursor.floor()
        let selectedUnit = Game.instance.unitTray.getSelectedUnit()
        for ( let unit of this.units ) {
            if ( unit.pos.equals( cell ) ) {
                console.log( unit )
                if ( unit == selectedUnit )
                    Game.instance.unitTray.deselectUnit()
                else
                    Game.instance.unitTray.selectUnit( unit )
                return
            }
        }
        if ( selectedUnit ) {
            let path = findPath( this, selectedUnit.pos, cell, 100 )
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

    render() {
        let g = Graphics.instance
        let tileSize = World.tileSize

        let cursor = Game.instance.worldCursor().floor()
        let selectedUnit = Game.instance.unitTray.getSelectedUnit()
        let cursorWalkable = this.isWalkable( cursor )

        this.drawMap()

        //  Draw unit path
        if ( cursorWalkable && selectedUnit != undefined ) {
            let path = findPath( this, selectedUnit.pos, cursor, 100 )
            if ( path ) {
                let radius = 3
                g.c.save()
                g.makePath( path.map( x => x.add( Vector.one.scale( 0.5 ) ).scale( tileSize ) ) )
                g.c.strokeStyle = "#f0ead8"
                g.c.lineWidth = radius
                g.c.stroke()
                g.c.beginPath()
                let endpoint = cursor.add( Vector.one.scale( 0.5 ) ).scale( tileSize )
                g.c.fillStyle = "#f0ead8"
                g.c.fillRect( endpoint.x - radius, endpoint.y - radius, radius * 2, radius * 2 )
                g.c.restore()
            }
        }

        for ( let unit of this.units ) {
            g.c.save()
            if ( unit == selectedUnit ) {
                g.c.shadowBlur = 10
                g.c.shadowColor = "black"
            }
            unit.render( unit.pos.scale( tileSize ) )
            g.c.restore()
        }
    }

    drawMap( numbered: boolean = false ) {
        let g = Graphics.instance
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
                    g.c.drawImage( hillTileImg, currentPos.x, currentPos.y )
                } else {
                    g.c.drawImage( grassTileImg, currentPos.x, currentPos.y )
                }
                // cv.strokeRect( currentPos, tileDimensions );
                if ( numbered ) {
                    let textPos = new Vector( x * tileSize + 1, y * tileSize + 1 )
                    let currentText = x.toString() + ", " + y.toString()
                    g.drawText( textPos, ( tileSize / 8 ) | 0, currentText )
                }
            }
        }
    }
}