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

export default class Game {
    static instance: Game

    static uiScale = 3 // Size of one "pixel" in screen pixels.
    graphics = new Graphics()
    input = new Input()
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    debug = false
    mouseOverData: PickingResult = { node: undefined, point: Vector.zero }
    world: World
    unitTray = new UnitTray()
    cardTray = new CardTray()
    camPos = new Vector( 0, 0 ) // in ui space
    camVelocity = new Vector( 0, 0 )
    camTarget?: Vector = undefined
    static minSeekDistance = World.tileSize * 15 / Game.uiScale

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

    playerUnits() {
        return this.world.units
    }

    screenDimensions() {  return this.graphics.size.scale( 1 / Game.uiScale ) }
    screenCenter() {  return this.graphics.size.scale( 0.5 / Game.uiScale ) }
    distFromViewport(pos: Vector) {
        let center = this.screenCenter()
        let diff = pos.subtract(center)
        diff.x = Math.abs(diff.x) - center.x
        diff.y = Math.abs(diff.y) - center.y
        return Math.max(diff.x, diff.y)
    }
    isInFocusArea(pos: Vector) { return this.distFromViewport(pos.subtract(this.camPos)) < -World.tileSize * 2 }
    setCameraTarget( pos: Vector ) {
        if (this.isInFocusArea(pos))
            return
        this.camTarget = pos
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
            let targetCamPos = this.camTarget.subtract(this.screenCenter())
            let lerpTarget = this.camPos.lerp(targetCamPos , 0.075 )
            this.camVelocity = lerpTarget.subtract( this.camPos )
            if (this.isInFocusArea(this.camTarget))
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

    makeSceneNode(): SceneNode {
        let { world, unitTray, cardTray } = this
        let selectedUnit = this.unitTray.getSelectedUnit()
        this.scene.children = [
            world.makeSceneNode(),
            unitTray.makeSceneNode(),
            selectedUnit ? cardTray.makeSceneNode( selectedUnit.cards ) : []
        ].flat()
        Scene.addParentReferences( this.scene )
        return this.scene
    }
}