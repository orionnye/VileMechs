import { Vector } from "./math/Vector"
import Matrix from "./math/Matrix"
import World from './World'
import Input from "./input"
import Graphics from "./Graphics"
import "./GlobalTypes"
import UnitTray from './UnitTray'
import { getImg } from "./utils"
import { PickingResult, SceneNode } from "./scene/Scene"
import Scene from "./scene/Scene"
import CardTray from "./CardTray"

const UIImg = getImg( require( "../www/images/UI.png" ) )

export default class Game {
    static instance: Game

    static uiScale = 3 // Size of one "pixel" in screen pixels.
    graphics = new Graphics()
    input = new Input()
    scene: SceneNode = { localMatrix: Matrix.identity }
    debug = false
    mouseOverData: PickingResult = { node: undefined, point: Vector.zero }
    world: World
    unitTray = new UnitTray()
    cardTray = new CardTray()
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
        this.world = new World()
    }

    setCameraTarget( pos: Vector ) {
        let halfScreenDims = this.graphics.size.scale( 0.5 / Game.uiScale ) // in ui space
        let adjustedTarget = pos.subtract( halfScreenDims )
        if ( adjustedTarget.distance( this.camPos ) < Game.minSeekDistance )
            return
        this.camTarget = pos.subtract( halfScreenDims )
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

        this.cardTray.update()

        {
            this.scene = this.makeSceneNode()
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
        if ( this.debug && picked !== undefined ) {
            picked.color = "white"
            Scene.render( g.c, this.scene, true )
            g.drawText( this.input.cursor.add( Vector.one.scale( 20 ) ), 12, picked.description ?? "a", "white" )
        } else {
            Scene.render( g.c, this.scene, false )
        }
    }

    static UIBackgroundNode = {
        description: "UI-static",
        localMatrix: Matrix.identity,
        onRender: () => Graphics.instance.c.drawImage( UIImg, 0, 0 )
    }

    makeSceneNode(): SceneNode {
        let { world, unitTray, cardTray } = this
        let selectedUnit = this.unitTray.getSelectedUnit()
        this.scene = {
            localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ),
            children: [
                world.makeSceneNode(),
                Game.UIBackgroundNode,
                unitTray.sceneNode(),
                selectedUnit ? cardTray.sceneNode( selectedUnit.cards ) : []
            ].flat()
        }
        Scene.addParentReferences(this.scene)
        return this.scene
    }
}