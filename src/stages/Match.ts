import Grid from "../gameobjects/map/Grid"
import Graphics from "../common/Graphics"
import { Vector } from "../math/Vector"
import { findPath } from "../gameobjects/map/pathfinding"
import Game from "../Game"
import Matrix from "../math/Matrix"
import Scene, { SceneNode } from "../common/Scene"
import * as Tiles from "../gameobjects/map/Tiles"
import Team from "../gameobjects/mech/Team"
import CardTray from "../gameobjects/ui/CardTray"
import UnitTray from "../gameobjects/ui/UnitTray"
import { CardType, targetsWithinRange } from "../gameobjects/card/CardTypes"
import { Chrome, Earth, Flesh, Treant } from "../gameobjects/mech/RigTypes"
import AI from "../gameobjects/mech/AI"
import { randomFloor } from "../math/math"
import { match } from "assert"
import Unit from "../gameobjects/mech/Unit"
import Camera from "../gameobjects/Camera"


export default class Match {
    //Map
    static tileSize = 32
    map: Grid
    camera = new Camera()

    //timer
    timer: number = 0

    //Units
    teams: Team[]
    turn = 0

    //UI
    //should be ported to another class
    cardTray = new CardTray()
    unitTray = new UnitTray()

    //ai
    aiTeamNumbers = [ -1, 1 ]
    ai = new AI()

    //Card Animation
    cardAnim = {
        rate: 0.02,
        cap: 1,
        step: 1,
        type: <CardType | undefined> undefined,
        pos: <Vector> new Vector( 0, 0 )
    }

    //Node
    scene: SceneNode = { localMatrix: Matrix.identity }

    constructor( playerTeam: Team = Game.instance.team ) {
        this.map = new Grid( 15, 15 )

        this.teams = [
            playerTeam,
            this.generateEnemies(2)
            // new Team( "Thermate Embalmers", true, 2 )
        ]

        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )

        //Move camera to first Unit
        // this.moveCamToFirstUnit()
    }

    get units() {
        let teams = this.teams
        function* unitsGenerator() {
            for ( let team of teams )
                for ( let unit of team.units )
                    yield unit
        }
        return unitsGenerator()
    }
    moveCamToUnit( unit: Unit ) { this.camera.setCameraTarget( unit.pos.addXY( .5, .5 ).scale( Match.tileSize ) ) }
    moveCamToFirstUnit() {
        let units = this.activeTeam().units
        if ( units.length == 0 ) return
        this.moveCamToUnit( units[ 0 ] )
    }
    generateMap() {
        let randomTerrain = true
        if ( randomTerrain ) {
            this.map.newMap()
            this.placeUnits()
        } else {
            //custom map
            this.map.fillRect( new Vector( 3, 3 ), new Vector( 4, 4 ), Tiles.GrassHill )
            this.map.fillRect( new Vector( 4, 4 ), new Vector( 2, 2 ), Tiles.Grass )
            this.map.set( new Vector( 4, 3 ), Tiles.Grass )
            this.map.set( new Vector( 5, 6 ), Tiles.Grass )
        }
    }
    generateEnemies( amount: number ) {
        let units : Unit[] = []
        // console.log(mechList[0])
        for ( let i = 0; i < amount; i++ ) {
            units.push( Game.instance.randomUnit )
        }
        let team = new Team( "Drunken Scholars", units, true, 1 )
        return team
    }

    playerTurn() {
        return this.turn == 0
    }
    placeUnits() {
        this.teams.forEach( team => {
            this.map.placeUnits( team.units )
        } )
    }
    activeTeam() { return this.teams[ this.turn ] }
    playerUnits() { return this.teams[ 0 ].units }
    // enemyUnits() { return this.teams[1].units }
    selectedUnit() { return this.activeTeam().selectedUnit() }
    selectedCard() { return this.selectedUnit()?.hand.cards[ this.cardTray.index ] }
    isPickingCard() { return this.cardTray.isPickingTarget }
    goBack() {
        let { unitTray, cardTray } = this
        if ( cardTray.isPickingTarget )
            cardTray.deselect()
        else
            this.activeTeam().deselect()
    }
    applyCardAt( pos: Vector ) {
        let unit = this.selectedUnit()
        let card = this.selectedCard()
        this.cardTray.deselect()
        if ( unit && card ) {
            if ( unit.energy >= card.type.cost ) {
                let index = unit.hand.cards.indexOf( card )
                if ( index < 0 )
                    throw new Error( "Selected card is not in selected unit's hand." )
                unit.hand.cards.splice( index, 1 )
                if ( !card.type.exhaustive ) {
                    unit.discard.cards.push( card )
                }
                card.apply( unit, pos )

                //Triggers Card Animtaion
                this.cardAnim.step = 0
                this.cardAnim.type = card?.type
                this.cardAnim.pos = pos
            }
        }
    }

    getUnit( pos: Vector ) {
        for ( let team of this.teams ) {
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
        return Game.instance.mouseOverData.node?.description == "match"
    }

    tileSpaceCursor() {
        let cursor = Game.instance.input.cursor
        return Scene.toLocalSpace( cursor, this.scene ).scale( 1 / Match.tileSize ).floor()
    }

    endTurn() {
        // Health ReCapped at turn start
        // console.log( "Ending turn" )
        this.teams[ this.turn ].endTurn()
        this.turn++
        this.turn %= this.teams.length
        this.teams[ this.turn ].startTurn()
        this.timer += 1
        // console.log( "STEP: ", this.cardAnim.step )
        if (this.playerUnits().length == 0) {
            Game.instance.activity = "lose"
        }
    }
    start() {
        let game = Game.instance
        //Toggle!
        game.activity = "match"

        //----GO Fighting!------
        this.teams[ 0 ] = game.team
        game.team.units.forEach( unit => {
            unit.statReset()
        } )
        this.map = new Grid( 15, 15 )
        //Generate enemies to fight
        this.teams[ 1 ] = this.generateEnemies(game.level)
        this.generateMap()
        this.activeTeam().cycleUnits()
        if ( this.activeTeam().selectedUnit() !== undefined ) {
            this.moveCamToUnit( this.activeTeam().selectedUnit()! )
        }
        this.turn = 0
        game.level += 1
    }
    onMousedown( ev: MouseEvent ) {
        let game = Game.instance
        let button = ev.button
        let leftClick = button == 0
        let middleClick = button == 1
        let rightClick = button == 2
        if ( leftClick || middleClick ) {
            let cursor = game.input.cursor
            let node = Scene.pickNode( this.scene, cursor )
            let worldClicked = node == this.scene
            let nothingClicked = node == undefined
            let unitSelected = this.activeTeam().selectedUnit() !== undefined
            let isMovingUnit = unitSelected && !this.isPickingCard()
            let canLeftClickDrag = ( ( worldClicked || nothingClicked ) && !isMovingUnit ) || game.input.keys.get( "shift" )
            if ( canLeftClickDrag || middleClick )
                this.camera.startDragging()
        } else if ( rightClick ) {
            this.goBack()
        }
    }
    onMouseup( ev: MouseEvent ) {
        this.camera.stopDragging()
    }
    onWheel( ev: WheelEvent ) {
        this.camera.onWheel( ev )
    }

    onKeyup( ev: KeyboardEvent ) {
        this.camera.onKeyup( ev )
        if (Game.instance.activity == "match") {
            if (this.playerTurn()) {
                if ( ev.key == "Tab" ) {
                    this.activeTeam().cycleUnits()
                }
                if ( ev.key == "Escape" ) {
                    this.goBack()
                }
                if ( ev.key == "Enter" ) {
                    this.endTurn()
                    if ( this.teams[ 1 ].units.length == 0 ) {
                        let game = Game.instance
                        //----GO Shopping!------
                        game.match.turn = 0
                        game.scrip += game.scripReward
                        game.activity = "route"
                    } else {
                        // Team Selection
                        this.activeTeam().cycleUnits()
                        this.moveCamToUnit( this.activeTeam().selectedUnit()! )
                    }
                }
            }
        }
    }

    update() {
        this.camera.update()
        this.teams.forEach( team => {
            team.update()
        } )
        if ( this.activeTeam().selectedUnit() ) {
            this.cardTray.update( this.activeTeam().selectedUnit()! )
        }
        let { step, cap, type } = this.cardAnim
        if ( step < cap ) {
            if ( type ) {
                let rate = type.renderFrames ? this.cardAnim.cap / type.renderFrames : 0.1
                this.cardAnim.step += rate
            }
        }

        if ( !this.playerTurn() ) {
            let AI = this.ai
            AI.update()
            if ( AI.startTime == undefined ) {
                AI.think( this.activeTeam() )
            }
            if ( AI.chodiness >= AI.maxChodiness ) {
                if ( this.activeTeam().selectedUnitIndex >= this.activeTeam().units.length - 1 ) {
                    this.endTurn()
                    this.activeTeam().cycleUnits()
                    if ( this.playerUnits.length > 0 )
                        this.moveCamToUnit( this.selectedUnit()! )
                    AI.reset()
                } else {
                    this.activeTeam().cycleUnits()
                    this.moveCamToUnit( this.selectedUnit()! )
                    AI.reset()
                }
            }
        }
    }

    // View
    render() {
        let g = Graphics.instance
        let game = Game.instance
        let tileSize = Match.tileSize

        if ( this.camera.zoom * Game.uiScale <= 1.5 ) {
            g.c.imageSmoothingEnabled = true
            g.c.imageSmoothingQuality = "low"
        }

        //  Draws the match tiles
        this.drawMap()

        let cursor = this.tileSpaceCursor()
        let selectedUnit = this.activeTeam().selectedUnit()
        let cursorWalkable = this.isWalkable( cursor )

        // let elevation = this.map.getElevation( cursor )
        // console.log( elevation )

        //  Draw unit path
        if ( this.playerTurn() ) {
            if ( this.hasFocus() && cursorWalkable && selectedUnit != undefined && this.cardTray.index == -1 ) {
                let walkableTiles = targetsWithinRange( selectedUnit.pos, 0, selectedUnit.speed )
                walkableTiles.forEach( tile => {
                    let path = findPath( this, selectedUnit!.pos, tile, selectedUnit!.speed )
                    if ( path && path.length <= selectedUnit!.speed ) {

                        g.drawRect( tile.scale( tileSize ), new Vector( tileSize, tileSize ), "rgba(0, 0, 255, 0.1)" )
                        g.strokeRect( tile.scale( tileSize ), new Vector( tileSize, tileSize ), "rgba(0, 0, 255, 0.1)" )
                    }
                } )
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
                        // const walkableColor = "rgb(30, 125, 30)", unwalkableColor = "#c9c5b955"
                        const walkableColor = "rgb(0, 240, 0)", unwalkableColor = "#c9c5b955"
                        let pathBacking = "rgb(30, 115, 30)"
                        g.makePath( walkablePath.map( x => x.add( Vector.one.scale( 0.5 ) ).scale( tileSize ) ) )
                        g.c.strokeStyle = pathBacking
                        g.c.lineWidth = radius + 2
                        g.c.stroke()
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

        //Card Animation
        let { step, cap, type, pos } = this.cardAnim
        if ( selectedUnit ) {
            if ( step < cap ) {
                //--------------------------CARD ANIMATION SHOULD GO HERE, THEN INCREASE STEP BY RATE IN UPDATE
                if ( type?.render ) {
                    if ( selectedUnit ) {
                        // console.log("USING CARD ANIMATION")
                        type.render( step, selectedUnit, pos )
                    }
                }
            }
        }
    }

    drawMap( numbered: boolean = false ) {
        let g = Graphics.instance
        let map = this.map
        let tileSize = Match.tileSize
        for ( let y = 0; y < map.height; y++ ) {
            for ( let x = 0; x < map.width; x++ ) {
                let currentPos = new Vector( x * tileSize, y * tileSize )
                let tile = map.getFromXY( x, y )
                if ( tile.getElevation() <= 0 ) {
                    tile.render( currentPos.x, currentPos.y )
                }
            }
        }
        for ( let y = 0; y < map.height; y++ ) {
            for ( let x = 0; x < map.width; x++ ) {
                let currentPos = new Vector( x * tileSize, y * tileSize )
                let tile = map.getFromXY( x, y )
                if ( tile.getElevation() >= 0 ) {
                    Tiles.Grass.render( currentPos.x, currentPos.y )
                    tile.render( currentPos.x, currentPos.y )
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
        // let { units } = this
        let { teams } = this
        let { width, height } = this.map
        let selectedUnit = this.activeTeam().selectedUnit()
        // let pickingTarget = false
        let pickingCard = this.isPickingCard()
        let tileSize = Match.tileSize

        this.scene = Scene.node( {
            description: "match",
            localMatrix: this.cameraTransform(),
            rect: { width: width * tileSize, height: height * tileSize, },
            onClick: ( node, pos: Vector ) => {
                if ( this.playerTurn() ) {
                    if ( selectedUnit && selectedUnit.canMove() && !pickingCard ) {
                        let cell = pos.scale( 1 / tileSize ).floor()
                        let path = findPath( this, selectedUnit.pos, cell, 100 )
                        if ( path ) {
                            path.length = Math.min( path.length, selectedUnit.speed )
                            selectedUnit.walkPath( path )
                        }
                    }
                }
            },
            content: () => {
                for ( let unit of this.units )
                    unit.makeSceneNode()

                if ( pickingCard ) {
                    let card = this.selectedCard()
                    if ( selectedUnit && card ) {
                        for ( let pos of card?.getTilesInRange( selectedUnit ) ) {
                            let unit = this.getUnit( pos )
                            let isValidTarget = unit || card?.type.canApplyToEmptyTiles
                            Scene.node( {
                                description: "card-target",
                                localMatrix: Matrix.vTranslation( pos.scale( tileSize ) ),
                                rect: { width: tileSize, height: tileSize },
                                onClick: () => {
                                    if ( this.playerTurn() && isValidTarget ) {
                                        this.applyCardAt( pos )
                                    }
                                },
                                onRender: ( node ) => {
                                    let hover = node == game.mouseOverData.node
                                    let highlight = hover && isValidTarget
                                    let alpha = isValidTarget ? .5 : .15
                                    let highlightTarget = `rgba(135, 231, 255, ${ alpha })`
                                    let possibleTarget = `rgba(3, 202, 252, ${ alpha })`
                                    g.c.fillStyle = highlight ? highlightTarget : possibleTarget
                                    let cardImpactZone = [ pos ]
                                    if ( Game.instance.match.map.contains( pos ) ) {
                                        if ( card?.type.getTilesEffected ) {
                                            cardImpactZone = card?.type.getTilesEffected!( this.selectedUnit()!, pos )
                                        }
                                        if ( highlight ) {
                                            cardImpactZone.forEach( ( tile, i ) => {
                                                let adjustedPos = new Vector( tile.x, tile.y ).subtract( pos ).scale( tileSize )
                                                g.c.fillStyle = highlight ? highlightTarget : possibleTarget
                                                g.c.strokeStyle = `rgba(0, 173, 217, ${ alpha })`
                                                g.c.beginPath()
                                                g.c.rect( adjustedPos.x, adjustedPos.y, tileSize, tileSize )
                                                g.c.fill()
                                                g.c.stroke()
                                            } )
                                        }
                                        g.c.strokeStyle = `rgba(0, 173, 217, ${ alpha })`
                                        g.c.beginPath()
                                        g.c.rect( 0, 0, tileSize, tileSize )
                                        g.c.fill()
                                        g.c.stroke()
                                        unit?.drawStats()
                                    }
                                }
                            } )
                        }
                    }
                }
            },
            onRender: () => this.render(),
        } )
    }
    cameraTransform() {
        let game = Game.instance
        let screenDims = game.screenDimensions()
        return this.camera.worldToCamera( screenDims.x, screenDims.y )
    }
}