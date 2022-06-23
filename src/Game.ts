import { Vector } from "./math/Vector"
import Matrix from "./math/Matrix"
import Match from './stages/Match'
import Input from "./common/Input"
import Graphics, { TextAlignX } from "./common/Graphics"
import "./common/GlobalTypes"
import { PickingResult, SceneNode } from "./common/Scene"
import Scene from "./common/Scene"
import Camera from "./gameobjects/Camera"
import Clock from "./common/Clock"
import Unit from "./gameobjects/mech/Unit"
import content from "*.css"
import Team from "./gameobjects/mech/Team"
import { Chrome, Earth, Flesh, Treant } from "./gameobjects/mech/RigTypes"
import Store from "./stages/Store"
import Grid from "./gameobjects/map/Grid"
import { randomFloor } from "./math/math"
const vacationurl = require( './www/audio/Vacation.mp3' )
let vacation = new Audio( vacationurl )
const knockurl = require( './www/audio/Knock.mp3' )
let knock = new Audio( knockurl )

export default class Game {
    static instance: Game
    static uiScale = 3
    static camVelocityDecay = 0.85
    graphics = new Graphics()
    camera = new Camera()
    input = new Input()
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    mouseOverData: PickingResult = { node: undefined, point: new Vector( 0, 0 ) }
    match: Match
    level: number = 1

    store: Store
    scrip: number

    showSceneDebug = false
    showFPS = false
    clock = new Clock()

    isPlayerDone = false
    shopping = false

    constructor() {
        this.store = new Store()
        this.store.reset()
        let playerTeam = new Team( "Choden Warriors", false, 0 )
        this.scrip = 50
        playerTeam.units = [
            new Chrome(new Vector(1, 0), 0),
            new Flesh(new Vector(1, 0), 0),
            new Earth(new Vector(2, 0), 0),
            new Treant(new Vector(1, 0), 0),
        ]
        this.match = new Match( playerTeam )
        Game.instance = this
        window.addEventListener( "click", ev => this.onClick( ev ) )
        window.addEventListener( "mousedown", ev => this.onMousedown( ev ) )
        window.addEventListener( "mouseup", ev => this.onMouseup( ev ) )
        window.addEventListener( "wheel", ev => this.onWheel( ev ) )
        window.addEventListener( "resize", ev => this.graphics.onResize() )
        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )
        window.addEventListener( "keydown", ev => this.onKeydown( ev ) )
        this.match.activeTeam().cycleUnits()
        if ( this.match.activeTeam().selectedUnit() !== undefined ) {
            this.moveCamToUnit( this.match.activeTeam().selectedUnit()! )
        }
    }
    generateEnemies( amount: number ) {
        this.match.teams[ 1 ] = new Team( "Drunken Scholars", true, 1 )
        let mechList = [
            new Chrome( new Vector( 0, 0 ), 1 ),
            new Treant( new Vector( 0, 0 ), 1 ),
            new Flesh( new Vector( 0, 0 ), 1 ),
            new Earth( new Vector( 0, 0 ), 1 ),
        ]
        // console.log(mechList[0])
        for ( let i = 0; i < amount; i++ ) {
            let random = randomFloor( mechList.length )
            this.match.teams[ 1 ].units.push( mechList[ random ] )
            mechList = [
                new Chrome( new Vector( 0, 0 ), 1 ),
                new Treant( new Vector( 0, 0 ), 1 ),
                new Flesh( new Vector( 0, 0 ), 1 ),
                new Earth( new Vector( 0, 0 ), 1 ),
            ]
        }
    }
    //----------------MODEL------------------
    moveCamToUnit( unit: Unit ) { this.camera.setCameraTarget( unit.pos.addXY( .5, .5 ).scale( Match.tileSize ) ) }
    moveCamToFirstUnit() {
        let units = this.match.activeTeam().units
        if ( units.length == 0 ) return
        this.moveCamToUnit( units[ 0 ] )
    }
    //----------------------UPDATE----------------------------
    update() {
        let { match } = this
        this.clock.nextFrame()

        this.match.update()
        //toggle to determine if AI should be feeding input
        if ( !this.match.playerTurn() ) {
            let AI = this.match.ai
            AI.update()
            if ( AI.startTime == undefined ) {
                AI.think( this.match.activeTeam() )
            }
            if ( AI.chodiness >= AI.maxChodiness ) {
                if ( match.activeTeam().selectedUnitIndex >= match.activeTeam().units.length - 1 ) {
                    match.endTurn()
                    match.activeTeam().cycleUnits()
                    if ( match.playerUnits.length > 0 )
                        this.moveCamToUnit( match.selectedUnit()! )
                    AI.reset()
                } else {
                    match.activeTeam().cycleUnits()
                    this.moveCamToUnit( match.selectedUnit()! )
                    AI.reset()
                }
            }
        }
        this.makeSceneNode()
        this.camera.update()
        //user Input Display
        this.mouseOverData = Scene.pick( this.scene, this.input.cursor )
        let { node, point } = this.mouseOverData
        if ( node?.onHover )
            node.onHover( node, point )
    }

    //---------------------------User Input---------------------------
    onClick( ev: MouseEvent ) {
        let cursor = this.input.cursor
        let { node, point } = Scene.pick( this.scene, cursor )
        if ( node && !this.input.keys.get( "shift" ) ) {
            if ( node.onClick )
                node.onClick( node, point )
        }
    }
    onMousedown( ev: MouseEvent ) {
        let button = ev.button
        let leftClick = button == 0
        let middleClick = button == 1
        let rightClick = button == 2
        if ( leftClick || middleClick ) {
            let cursor = this.input.cursor
            let node = Scene.pickNode( this.scene, cursor )
            let worldClicked = node == this.match.scene
            let nothingClicked = node == undefined
            let unitSelected = this.match.activeTeam().selectedUnit() !== undefined
            let isMovingUnit = unitSelected && !this.match.isPickingCard()
            let canLeftClickDrag = ( ( worldClicked || nothingClicked ) && !isMovingUnit ) || this.input.keys.get( "shift" )
            if ( canLeftClickDrag || middleClick )
                this.camera.startDragging()
        } else if ( rightClick ) {
            this.match.goBack()
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
        if ( ev.key == "`" )
            this.showSceneDebug = !this.showSceneDebug
        if ( ev.key == "," )
            this.showFPS = !this.showFPS
        if ( ev.key == "Escape" ) {
            if ( this.match.playerTurn() )
                this.match.goBack()
        }
        if ( ev.key == "Tab" ) {
            if ( this.match.playerTurn() ) {
                this.match.activeTeam().cycleUnits()
                if ( this.match.activeTeam().selectedUnit() !== undefined ) {
                    this.moveCamToUnit( this.match.activeTeam().selectedUnit()! )
                }
            }
        }
        if ( ev.key == "Enter" ) {
            //stops you from skipping enemies turn
            if ( this.match.playerTurn() ) {
                this.match.endTurn()
                if ( this.match.teams[ 1 ].units.length == 0 && !this.shopping ) {
                    //----GO Shopping!------
                    this.store.reset()
                    this.match.turn = 0
                    this.shopping = true
                    this.scrip += 10
                } else if ( this.shopping ) {
                    //----GO Fighting!------
                    this.match.teams[ 0 ].units.forEach( unit => {
                        unit.statReset()
                    } );
                    this.match.map = new Grid( 20, 20 )
                    this.match.teams[ 1 ] = new Team( "Choden Warriors", true, 1 )
                    //Generate enemies to fight
                    this.generateEnemies( this.level )
                    this.match.map.newMap()
                    this.match.placeUnits()
                    this.match.turn = 0
                    this.shopping = false
                    this.level += 1
                }
                //Team Selection
                this.match.activeTeam().cycleUnits()
                this.moveCamToUnit( this.match.activeTeam().selectedUnit()! )
                //Enemy Turn?
                // if (!this.match.playerTurn()) {
                //     this.match.ai.think(this.match.activeTeam())
                // }
            }
        }
    }
    onKeydown( ev: KeyboardEvent ) {
        if ( ev.key == "Tab" ) {
            ev.preventDefault()
        }
    }

    //--------------------------RENDER-----------------------------
    render() {
        let g = this.graphics
        g.c.imageSmoothingEnabled = false
        g.c.fillStyle = "#2b69f5"
        g.c.fillRect( 0, 0, g.size.x, g.size.y )
        g.c.textBaseline = "top"
        let picked = Scene.pickNode( this.scene, this.input.cursor )
        if ( this.showSceneDebug ) {
            if ( picked ) picked.debugColor = "white"
            Scene.render( g.c, this.scene, true )
            g.setFont( 12, "pixel" )
            g.drawText( this.input.cursor.add( Vector.one.scale( 20 ) ), picked?.description ?? "", "white" )
        } else {
            Scene.render( g.c, this.scene, false )
        }

        if ( this.showFPS ) {
            g.setFont( 24, "impact" )
            g.drawText( Vector.one.scale( 2 ), this.clock.averageFPS.toFixed( 2 ), "red" )
        }
    }
    makeSceneNode() {
        let g = Graphics.instance
        let { match } = this
        let { unitTray, cardTray } = this.match
        let selectedUnit = this.match.activeTeam().selectedUnit()
        let center = Game.instance.screenCenter()
        this.scene = Scene.node( {
            localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ),
            onRenderPost: () => {
                if ( !this.shopping ) {
                    //TEAM NAME DISPLAY
                    g.setFont( 6, "pixel" )
                    g.drawTextBox( new Vector( center.x, 0 ), this.match.activeTeam().name, {
                        textColor: "#c2c2c2", boxColor: "#6969698f", alignX: TextAlignX.center
                    } )
                }
            },
            content: () => {
                if ( this.shopping ) {
                    //-----------------Shopping Display-------------------
                    this.store.makeSceneNode()
                    unitTray.makeSceneNode( new Vector( 0, 0 ), match.teams[ 0 ] )
                } else {
                    //-----------------Match Display-----------------------
                    match.makeSceneNode()
                    //displays unitTray forward for first player
                    g.c.restore()
                    if ( this.match.turn == 0 ) {
                        unitTray.makeSceneNode( new Vector( 0, 0 ), match.teams[ 0 ] )
                    } else {
                        //display Unit Tray backwords for second player
                        unitTray.makeSceneNode( new Vector( this.screenDimensions().x, 0 ), match.activeTeam(), true )
                    }
                    if ( selectedUnit )
                        cardTray.makeSceneNode( selectedUnit )
                }
            }
        } )
    }
    cameraTransform() {
        let screenDims = this.screenDimensions()
        return this.camera.worldToCamera( screenDims.x, screenDims.y )
    }
    screenDimensions() { return this.graphics.size.scale( 1 / Game.uiScale ) }
    screenCenter() { return this.graphics.size.scale( 0.5 / Game.uiScale ) }
}