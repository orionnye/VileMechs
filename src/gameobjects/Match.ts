import AI from "../AI"
import Input from "../common/Input"
import Game from "../Game"
import Graphics, { TextAlignX } from "../Graphics"
import Matrix from "../math/Matrix"
import { Vector } from "../math/Vector"
import Scene, { SceneNode } from "../Scene"
import Camera from "./Camera"
import CardTray from "./CardTray"
import Unit from "./Unit"
import UnitTray from "./UnitTray"
import World from "./World"

type Team = { name: string, flipUnits: boolean }

export default class Match {
    static instance: Match

    camera = new Camera()
    world: World = new World()
    unitTray = new UnitTray()
    cardTray = new CardTray()

    scene: SceneNode = { localMatrix: Matrix.identity }

    playerTeamNumber = 0
    aiTeamNumbers = [ -1, 1 ]
    ai = new AI()

    teams: Team[] = [
        { name: "Drunken Scholars", flipUnits: false },
        { name: "Choden Warriors", flipUnits: true },
        // { name: "Thermate Embalmers", flipUnits: false }
    ]
    turn = 0
    isPlayerDone = false

    constructor() {
        Match.instance = this
    }

    //----------------MODEL------------------
    isAITurn() { return this.aiTeamNumbers.includes( this.turn ) }
    playerUnits() { return this.world.units.filter( unit => unit.teamNumber == this.turn ) }
    enemyUnits() { return this.world.units.filter( unit => this.aiTeamNumbers.includes( unit.teamNumber ) ) }
    selectedUnit() { return this.unitTray.selectedUnit() }
    selectedCard() { return this.cardTray.selectedCard() }
    isPickingTarget() { return this.cardTray.isPickingTarget }
    onSelectUnit() {
        this.cardTray.onSelectUnit()
        let selectedUnit = this.selectedUnit()
        if ( selectedUnit )
            this.moveCamToUnit( selectedUnit )
    }
    moveCamToUnit( unit: Unit ) { this.camera.setCameraTarget( unit.pos.addXY( .5, .5 ).scale( World.tileSize ) ) }
    moveCamToFirstUnit() {
        let units = this.playerUnits()
        if ( units.length == 0 ) return
        this.moveCamToUnit( units[ 0 ] )
    }
    goBack() {
        let { unitTray, cardTray } = this
        if ( cardTray.isPickingTarget )
            cardTray.deselect()
        else
            unitTray.deselect()
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
                unit.discard.cards.push( card )
                let world = this.world
                card.apply( unit, pos, world.getUnit( pos ) )
            }
        }
    }
    endTurn() {
        console.log( "Ending turn" )
        this.turn++
        this.turn %= this.teams.length
        //Health ReCapped at turn start
        this.world.units.forEach( unit => {
            //turnStart
            if ( unit.teamNumber == this.turn ) {
                unit.statCap()
            }
        } )
        this.unitTray.deselect()
        this.moveCamToFirstUnit()
        if ( this.isGameOver ) {
            console.log( "GAME OVER" )
            // console.log("EnemyUnits:", this.playerUnits)
            this.isPlayerDone = true
            this.turn = 0
        }
    }
    get isGameOver() {
        if ( this.enemyUnits().length == 0 ) {
            return true
        }
        return false
    }

    //----------------------UPDATE----------------------------
    update() {
        this.doAiUpdate()
        this.world.update()
        this.cardTray.update()
        this.camera.update()
    }

    doAiUpdate() {
        if ( this.isAITurn() ) {
            let aiTurn = false

            if ( this.selectedUnit() == undefined ) {
                // console.log("FINDING")
                this.world.units.forEach( unit => {
                    if ( unit.teamNumber == this.turn && !this.ai.isDone( unit ) ) {
                        aiTurn = true
                        this.unitTray.selectUnit( unit )
                        this.onSelectUnit()
                    }
                } )
            } else {
                //Trigger to keep aiTurn active as long as ai has cards
                aiTurn = true
                if ( this.ai.startTime == undefined ) {
                    this.ai.startTime = Date.now()
                    //selecting Unit for control
                }
                //AI DELAY
                let actionDelay = 700
                //Taking delayed Action!
                if ( Date.now() - this.ai.startTime >= actionDelay ) {
                    let unit = this.selectedUnit()!
                    if ( !this.ai.isDone( unit ) ) {
                        console.log( "thinking" )
                        this.ai.think( unit )
                    } else {
                        this.unitTray.deselect()
                    }
                }
            }
            if ( !aiTurn ) {
                this.endTurn()
            }
        }
    }
    //---------------------------User Input---------------------------
    onMousedown( ev: MouseEvent, node?: SceneNode ) {
        let input = Input.instance
        let shiftDown = input.keys.get( "shift" )
        let button = ev.button
        let leftClick = button == 0
        let middleClick = button == 1
        let rightClick = button == 2
        if ( leftClick || middleClick ) {
            let worldClicked = node == this.world.scene
            let nothingClicked = node == undefined
            let unitSelected = this.unitTray.selectedUnit() !== undefined
            let isMovingUnit = unitSelected && !this.isPickingTarget()
            let canLeftClickDrag = ( ( worldClicked || nothingClicked ) && !isMovingUnit ) || shiftDown
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
        if ( ev.key == "Escape" )
            this.goBack()
        if ( ev.key == "Enter" ) {
            //stops you from skipping enemies turn
            if ( !this.isAITurn() ) {
                this.endTurn()
            }
        }
    }
    //--------------------------RENDER-----------------------------
    makeSceneNode() {
        let game = Game.instance
        let g = Graphics.instance
        let { world, unitTray, cardTray } = this
        let selectedUnit = this.selectedUnit()
        this.scene = Scene.node( {
            localMatrix: Matrix.identity,
            onRenderPost: () => {
                let center = game.screenCenter()
                g.setFont( 6, "pixel" )
                g.drawTextBox( new Vector( center.x, 0 ), this.teams[ this.turn ].name, { textColor: "#c2c2c2", boxColor: "#6969698f", alignX: TextAlignX.center } )
            },
            content: () => {
                world.makeSceneNode()
                unitTray.makeSceneNode( this.playerUnits() )
                if ( selectedUnit )
                    cardTray.makeSceneNode()
            }
        } )
    }
    cameraTransform() {
        let game = Game.instance
        let screenDims = game.screenDimensions()
        return this.camera.worldToCamera( screenDims.x, screenDims.y )
    }

}