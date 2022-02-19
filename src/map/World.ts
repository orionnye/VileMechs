import Unit from "../gameobjects/mech/Unit"
import Grid from "./Grid"
import Graphics from "../common/Graphics"
import { Vector } from "../math/Vector"
import { findPath } from "./pathfinding"
import Game from "../Game"
import { getImg } from "../common/utils"
import Matrix from "../math/Matrix"
import Scene, { SceneNode } from "../common/Scene"
import { Treant, Chrome, Flesh, Jelly, FleshBot, JellyBot, Dummy } from "../gameobjects/mech/RigTypes"
import * as Tiles from "./Tiles"
import Team from "../gameobjects/mech/Team"

export default class World {
    static tileSize = 32
    map: Grid
    
    // units: Unit[]
    teams: Team[]
    scene: SceneNode = { localMatrix: Matrix.identity }

    constructor() {
        this.map = new Grid( 20, 20 )

        this.teams = [
            new Team( "Drunken Scholars", false, 0 ),
            new Team( "Choden Warriors", true, 1 ),
            // new Team( "Thermate Embalmers", true, 2 )
        ]

        // let randomTerrain = false
        let randomTerrain = true
        if ( randomTerrain ) {
            this.map.randomize2( 0 )
            // for ( let unit of this.units ) {
            //     this.map.set( unit.pos, 0 )
            // }
            this.teams.forEach(team => {
                this.map.placeUnits( team.units )
            })
        } else {
            //custom map
            this.map.fillRect( new Vector( 3, 3 ), new Vector( 4, 4 ), Tiles.GrassHill )
            this.map.fillRect( new Vector( 4, 4 ), new Vector( 2, 2 ), Tiles.Grass )
            this.map.set( new Vector( 4, 3 ), Tiles.Grass )
            this.map.set( new Vector( 5, 6 ), Tiles.Grass )
        }
    }

    // Model
    getUnit( pos: Vector ) {
        for (let team of this.teams ) {
            for ( let unit of team.units )
                if ( unit.pos.equals( pos ) )
                    return unit
        }
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
        this.teams.forEach(team => {
            team.update()
        })
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
        let AITurn = Game.instance.isAITurn()
        this.drawMap()

        //  Draw unit path
        if ( this.hasFocus() && cursorWalkable && selectedUnit != undefined && !game.isPickingTarget() && !AITurn) {
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
                tile.render( currentPos.x, currentPos.y )
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
        // let { units } = this
        let { teams } = this
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
                teams.forEach( ( team, i ) => {
                    team.makeSceneNode()
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