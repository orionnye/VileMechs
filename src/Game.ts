import { Vector } from "./math/Vector"
import Matrix from "./math/Matrix"
import World from './gameobjects/World'
import Input from "./common/Input"
import Graphics, { TextAlignX } from "./Graphics"
import "./GlobalTypes"
import UnitTray from './gameobjects/UnitTray'
import { PickingResult, SceneNode } from "./Scene"
import Scene from "./Scene"
import CardTray from "./gameobjects/CardTray"
import Camera from "./gameobjects/Camera"
import Clock from "./common/Clock"
import Unit from "./gameobjects/Unit"
import content from "*.css"
import AI from "./AI"
import Card from "./gameobjects/Card"
import CardTypes from "./CardTypes"
import Match from "./gameobjects/Match"


type Team = { name: string, flipUnits: boolean }

export default class Game {
    static instance: Game
    static uiScale = 3
    static camVelocityDecay = 0.85
    graphics = new Graphics()
    input = new Input()
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    mouseOverData: PickingResult = { node: undefined, point: Vector.zero }

    showSceneDebug = false
    showFPS = false
    clock = new Clock()

    match = new Match()

    constructor() {
        Game.instance = this
        window.addEventListener( "click", ev => this.onClick( ev ) )
        window.addEventListener( "mousedown", ev => this.onMousedown( ev ) )
        window.addEventListener( "mouseup", ev => this.onMouseup( ev ) )
        window.addEventListener( "wheel", ev => this.onWheel( ev ) )
        window.addEventListener( "resize", ev => this.graphics.onResize() )
        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )
        this.match.moveCamToFirstUnit()
    }

    //----------------------UPDATE----------------------------
    update() {
        this.clock.nextFrame()
        this.makeSceneNode()
        this.match.update()
        this.mouseOverData = Scene.pick( this.scene, this.input.cursor )
        let { node, point } = this.mouseOverData
        if ( node?.onHover )
            node.onHover( node, point )
    }
    //---------------------------User Input---------------------------
    onClick( ev: MouseEvent ) {
        //switch that shuts off player input during enemy turn
        if ( !this.match.isAITurn() ) {
            let cursor = this.input.cursor
            let { node, point } = Scene.pick( this.scene, cursor )
            if ( node && !this.input.keys.get( "shift" ) ) {
                if ( node.onClick )
                    node.onClick( node, point )
            }
        }
    }
    onMousedown( ev: MouseEvent ) {
        let cursor = this.input.cursor
        let node = Scene.pickNode( this.scene, cursor )
        this.match.onMousedown( ev, node )
    }
    onMouseup( ev: MouseEvent ) {
        this.match.onMouseup( ev )
    }
    onWheel( ev: WheelEvent ) {
        this.match.onWheel( ev )
    }
    onKeyup( ev: KeyboardEvent ) {
        this.match.onKeyup( ev )
        if ( ev.key == "`" )
            this.showSceneDebug = !this.showSceneDebug
        if ( ev.key == "," )
            this.showFPS = !this.showFPS
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
        this.scene = Scene.node( {
            localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ),
            content: () => this.match.makeSceneNode()
        } )
    }
    screenDimensions() { return this.graphics.size.scale( 1 / Game.uiScale ) }
    screenCenter() { return this.graphics.size.scale( 0.5 / Game.uiScale ) }
}