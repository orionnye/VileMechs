import Unit from "./Unit"
import Grid from "../map/Grid"
import Graphics from "../Graphics"
import { Vector } from "../math/Vector"
import { findPath } from "../pathfinding"
import Game from "../Game"
import { getImg } from "../common/utils"
import Matrix from "../math/Matrix"
import Scene, { SceneNode } from "../Scene"
import { Treant, Chrome, Flesh } from "./RigTypes"

const hillTileImg = getImg( require( "../www/images/tiles/flat/hill5.png" ) )
const grassTileImg = getImg( require( "../www/images/tiles/flat/grass.png" ) )

export default class World {
    static tileSize = 32
    map: Grid
    units: Unit[]
    scene: SceneNode = { localMatrix: Matrix.identity }

    constructor() {
        this.map = new Grid( 15, 15 )
        this.units = [
            new Flesh( new Vector( 1, 1 ), 0 ),
            new Treant( new Vector( 2, 2 ), 0 ),
            new Chrome( new Vector( 3, 1 ), 0 ),
            new Chrome( new Vector( 4, 2 ), 0 ),
            new Flesh( new Vector( 13, 13 ), 1 ),
            new Treant( new Vector( 12, 12 ), 1 ),
            new Chrome( new Vector( 11, 13 ), 1 ),
            new Chrome( new Vector( 10, 12 ), 1 )
        ]

        let randomTerrain = true
        if ( randomTerrain ) {
            this.map.randomize( 0.2 )
            for ( let unit of this.units ) {
                this.map.set( unit.pos, 0 )
            }
        } else {
            //custom map
            this.map.fillRect( new Vector( 3, 3 ), new Vector( 4, 4 ), 1 )
            this.map.fillRect( new Vector( 4, 4 ), new Vector( 2, 2 ), 0 )
            this.map.set( new Vector( 4, 3 ), 0 )
            this.map.set( new Vector( 5, 6 ), 0 )
        }
    }

    // Model
    getUnit( pos: Vector ) {
        for ( let unit of this.units )
            if ( unit.pos.equals( pos ) )
                return unit
    }

    isWalkable( pos: Vector, checkUnits = true ) {
        if ( checkUnits && this.getUnit( pos ) )
            return false
        return this.map.contains( pos ) && this.map.isEmpty( pos )
    }

    hasFocus() {
        return Game.instance.mouseOverData.node?.description == "world"
    }

    tileSpaceCursor() {
        let cursor = Game.instance.input.cursor
        return Scene.toLocalSpace( cursor, this.scene ).scale( 1 / World.tileSize ).floor()
    }

    update() {
        this.units = this.units.filter( unit => unit.health > 0 )
        for ( let unit of this.units )
            unit.update()
    }

    // View
    render() {
        let g = Graphics.instance
        let game = Game.instance
        let tileSize = World.tileSize

        if ( game.camera.zoom * Game.uiScale <= 1.5 ) {
            g.c.imageSmoothingEnabled = true
            g.c.imageSmoothingQuality = "low"
        }

        let cursor = this.tileSpaceCursor()
        let selectedUnit = Game.instance.unitTray.selectedUnit()
        let cursorWalkable = this.isWalkable( cursor )

        this.drawMap()

        //  Draw unit path
        if ( this.hasFocus() && cursorWalkable && selectedUnit != undefined && !game.isPickingTarget() ) {
            let path = findPath( this, selectedUnit.pos, cursor, 100 )
            if ( path && selectedUnit.canMove() ) {
                let pathLength = path.length
                let walkableLength = Math.min( path.length, selectedUnit.speed )
                let trimmedSteps = path.slice( walkableLength - 1 )
                let walkablePath = path.slice( 0, walkableLength )
                path.length = walkableLength
                let radius = 3
                g.c.save()
                {
                    const walkableColor = "#f0ead8", unwalkableColor = "#c9c5b9"
                    g.makePath( walkablePath.map( x => x.add( Vector.one.scale( 0.5 ) ).scale( tileSize ) ) )
                    g.c.strokeStyle = walkableColor
                    g.c.lineWidth = radius
                    g.c.stroke()

                    let pathTooLong = walkableLength != pathLength
                    if ( pathTooLong ) {
                        g.makePath( trimmedSteps.map( x => x.add( Vector.one.scale( 0.5 ) ).scale( tileSize ) ) )
                        g.c.strokeStyle = unwalkableColor
                        g.c.lineWidth = radius
                        g.c.stroke()
                        g.c.setLineDash( [] )

                        g.c.beginPath()
                        let endpoint = cursor.add( Vector.one.scale( 0.5 ) ).scale( tileSize )
                        g.c.fillStyle = unwalkableColor
                        g.c.fillRect( endpoint.x - radius, endpoint.y - radius, radius * 2, radius * 2 )
                    }

                    g.c.beginPath()
                    let endpoint = path[ path.length - 1 ].add( Vector.one.scale( 0.5 ) ).scale( tileSize )
                    g.c.fillStyle = walkableColor
                    g.c.fillRect( endpoint.x - radius, endpoint.y - radius, radius * 2, radius * 2 )
                }
                g.c.restore()
            }
        }
    }

    drawMap( numbered: boolean = false ) {
        let g = Graphics.instance
        let map = this.map
        let tileSize = World.tileSize
        for ( let y = 0; y < map.height; y++ ) {
            for ( let x = 0; x < map.width; x++ ) {
                let currentPos = new Vector( x * tileSize, y * tileSize )
                let tile = map.getFromXY( x, y )
                if ( tile.content == map.wall ) {
                    g.c.drawImage( hillTileImg, currentPos.x, currentPos.y )
                } else {
                    g.c.drawImage( grassTileImg, currentPos.x, currentPos.y )
                }
                if ( numbered ) {
                    let textPos = new Vector( x * tileSize + 1, y * tileSize + 1 )
                    let currentText = x.toString() + ", " + y.toString()
                    g.setFont( tileSize / 8 | 0, "pixel" )
                    g.drawText( textPos, currentText, "#f0ead8" )
                }
            }
        }
    }

    makeSceneNode() {
        let game = Game.instance
        let g = Graphics.instance
        let { units } = this
        let { width, height } = this.map
        let selectedUnit = game.selectedUnit()
        let pickingTarget = game.isPickingTarget()
        let tileSize = World.tileSize

        this.scene = Scene.node( {
            description: "world",
            localMatrix: game.cameraTransform(),
            rect: { width: width * tileSize, height: height * tileSize, },
            onClick: ( node, pos: Vector ) => {
                if ( selectedUnit && selectedUnit.canMove() && !pickingTarget ) {
                    let cell = pos.scale( 1 / tileSize ).floor()
                    let path = findPath( this, selectedUnit.pos, cell, 100 )
                    if ( path ) {
                        path.length = Math.min( path.length, selectedUnit.speed )
                        selectedUnit.walkPath( path )
                    }
                }
            },
            onRender: () => this.render(),
            content: () => {
                units.forEach( ( unit, i ) => {
                    Scene.node( {
                        description: "unit",
                        localMatrix: Matrix.vTranslation( unit.pos.scale( tileSize ) ),
                        rect: { width: tileSize, height: tileSize },
                        onClick: () => game.unitTray.toggleSelectUnit( unit ),
                        onRender: ( node ) => {
                            let hover = node == game.mouseOverData.node
                            let isSelected = unit == selectedUnit
                            if ( isSelected && !unit.isWalking() ) {
                                g.c.shadowBlur = 10
                                g.c.shadowColor = "black"
                            }
                            unit.render( true, isSelected || hover )
                        }
                    } )
                } )
                if ( pickingTarget ) {
                    let card = game.selectedCard()
                    if ( selectedUnit && card ) {
                        for ( let pos of card?.getTilesInRange( selectedUnit ) ) {
                            let unit = this.getUnit( pos )
                            let isValidTarget = unit || card?.type.canApplyToEmptyTiles
                            Scene.node( {
                                description: "card-target",
                                localMatrix: Matrix.vTranslation( pos.scale( tileSize ) ),
                                rect: { width: tileSize, height: tileSize },
                                onClick: () => {
                                    if ( isValidTarget )
                                        game.applyCardAt( pos )
                                },
                                onRender: ( node ) => {
                                    let hover = node == game.mouseOverData.node
                                    let highlight = hover && isValidTarget
                                    let alpha = isValidTarget ? .5 : .15
                                    g.c.fillStyle = highlight ? `rgba(135, 231, 255, ${ alpha })` : `rgba(3, 202, 252, ${ alpha })`
                                    g.c.strokeStyle = `rgba(0, 173, 217, ${ alpha })`
                                    g.c.beginPath()
                                    g.c.rect( 0, 0, tileSize, tileSize )
                                    g.c.fill()
                                    g.c.stroke()
                                }
                            } )
                        }
                    }
                }
            }
        } )
    }
}