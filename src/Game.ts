import { Vector } from "./math/Vector"
import Matrix from "./math/Matrix"
import World from './World'
import Input from "./input"
import Graphics from "./Graphics"
import "./GlobalTypes"
import UnitTray from './UnitTray'
import { getImg } from "./utils"
import Card from './Card'
import { ParentSceneNode, PickingResult, SceneNode } from "./scene/Scene"
import Scene from "./scene/Scene"

const UIImg = getImg( require( "../www/images/UI.png" ) )

export default class Game {
    static instance: Game

    static uiScale = 3 // Size of one "pixel" in screen pixels.
    graphics = new Graphics()
    input = new Input()
    debug = false
    scene: ParentSceneNode = { transform: Matrix.scale( Game.uiScale, Game.uiScale ), children: [] }
    mouseOverData: PickingResult = { node: undefined, point: Vector.zero }
    world = new World()
    unitTray = new UnitTray()
    camPos = new Vector( 0, 0 ) // in ui space
    camVelocity = new Vector( 0, 0 )
    camTarget?: Vector = undefined
    static minSeekDistance = World.tileSize * 18 / Game.uiScale

    constructor() {
        Game.instance = this
        window.addEventListener( "click", ( ev ) => this.onClick() )
        window.addEventListener( "resize", ( ev ) => this.graphics.onResize() )
        window.addEventListener( "keydown", ( ev ) => {
            if ( ev.key == "`" )
                this.debug = !this.debug
        } )
    }

    setCameraTarget( pos: Vector ) {
        let halfScreenDims = this.graphics.size.scale( 0.5 / Game.uiScale ) // in ui space
        let adjustedTarget = pos.subtract( halfScreenDims )
        if ( adjustedTarget.distance( this.camPos ) < Game.minSeekDistance )
            return
        this.camTarget = pos.subtract( halfScreenDims )
    }

    pixelSpaceToWorldSpace( pos: Vector ) {
        return pos.scale( 1 / Game.uiScale ).add( this.camPos ).scale( 1 / World.tileSize )
    }

    pixelSpaceToUISpace( pos: Vector ) {
        return pos.scale( 1 / Game.uiScale )
    }

    worldSpaceToUISpace( pos: Vector ) {
        return pos.scale( World.tileSize ).subtract( this.camPos )
    }

    worldCursor() {
        return this.pixelSpaceToWorldSpace( this.input.cursor )
    }

    UICursor() {
        return this.pixelSpaceToUISpace( this.input.cursor )
    }

    onClick() {
        let { node, point } = Scene.pick( this.scene, this.input.cursor )
        if ( node ) {
            if ( node.onClick )
                node.onClick( node, point )
        }
    }

    update() {
        let { input, camVelocity, camPos } = this

        if ( input.keys.get( "w" ) ) {
            camVelocity.y += -1
            this.camTarget = undefined
        }
        if ( input.keys.get( "s" ) ) {
            camVelocity.y += 1
            this.camTarget = undefined
        }
        if ( input.keys.get( "a" ) ) {
            camVelocity.x += -1
            this.camTarget = undefined
        }
        if ( input.keys.get( "d" ) ) {
            camVelocity.x += 1
            this.camTarget = undefined
        }

        this.camPos = camPos.add( camVelocity )
        this.camVelocity = camVelocity.scale( 0.85 )
        if ( camVelocity.length < 0.5 ) {
            camVelocity = new Vector( 0, 0 )
            camPos.x |= 0
            camPos.y |= 0
        }

        if ( this.camTarget ) {
            this.camVelocity = this.camPos.lerp( this.camTarget, 0.075 ).subtract( this.camPos )
            if ( camPos.subtract( this.camTarget ).length < Game.minSeekDistance )
                this.camTarget = undefined
        }

        {
            this.buildScene()
            this.mouseOverData = Scene.pick( this.scene, this.input.cursor )
            let { node, point } = this.mouseOverData
            if ( node?.onHover )
                node.onHover( node, point )
        }
    }

    render() {
        let g = this.graphics
        g.c.fillStyle = "#5fb2de"
        g.c.fillRect( 0, 0, g.size.x, g.size.y )
        g.c.imageSmoothingEnabled = false
        let picked = Scene.pickNode( this.scene, this.input.cursor )
        if ( this.debug && picked !== undefined )
            picked.color = "white"
        Scene.render( g.c, this.scene, this.debug )
        if ( this.debug && picked !== undefined )
            g.drawText( this.input.cursor.add( Vector.one.scale( 20 ) ), 12, picked.description ?? "a", "white" )
    }

    buildScene() {
        let g = Graphics.instance
        this.scene.children.length = 0
        this.world.addSceneNodes( this.scene )
        this.scene.children.push( {
            description: "static UI layer",
            transform: Matrix.identity,
            onRender: () => g.c.drawImage( UIImg, 0, 0 )
        } )
        this.unitTray.addSceneNodes( this.scene )
        let selectedUnit = this.unitTray.getSelectedUnit()
        if ( selectedUnit ) {
            this.scene.children.push( selectedUnit.cardsSceneNode() )
        }
    }
}