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
import { lerp } from "./math/math"

export default class Game {
    static instance: Game

    static uiScale = 3 // Size of one "pixel" in screen pixels.
    graphics = new Graphics()
    input = new Input()
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    showSceneDebug = false
    showFPS = false
    mouseOverData: PickingResult = { node: undefined, point: Vector.zero }
    lastDragPosition?: Vector
    world: World
    unitTray = new UnitTray()
    cardTray = new CardTray()
    camPos = new Vector( 0, 0 ) // in ui space
    camVelocity = new Vector( 0, 0 )
    camTarget?: Vector = undefined
    static minSeekDistance = World.tileSize * 15 / Game.uiScale

    averageFPS = 0
    lastFrame?: number

    constructor() {
        Game.instance = this
        window.addEventListener( "click", ev => this.onClick() )
        window.addEventListener( "mousedown", ev => this.onMousedown() )
        window.addEventListener( "mouseup", ev => this.onMouseup() )
        window.addEventListener( "resize", ev => this.graphics.onResize() )
        window.addEventListener( "keydown", ev => {
            if ( ev.key == "`" )
                this.showSceneDebug = !this.showSceneDebug
            if ( ev.key == "," )
                this.showFPS = !this.showFPS
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
        let cursor = this.input.cursor
        let { node, point } = Scene.pick( this.scene, cursor)
        if ( node ) {
            if ( node.onClick )
                node.onClick( node, point )
        }
    }

    onMousedown() {
        console.log("!!!")
        let cursor = this.input.cursor
        let node = Scene.pickNode( this.scene, cursor)        
        let worldClicked = node == this.world.scene
        let nothingClicked = node == undefined
        let unitSelected = this.unitTray.getSelectedUnit() !== undefined
        if ((worldClicked || nothingClicked) && !unitSelected)
            this.lastDragPosition = this.input.cursor
    }

    onMouseup() {
        this.lastDragPosition = undefined
    }

    updateDrag() {
        if (this.lastDragPosition) {
            let cursor = this.input.cursor
            let diff = cursor.subtract(this.lastDragPosition)
            let mat = Scene.relativeMatrix(this.world.scene)
            let diffPrime = mat.inverse().multiplyVec(diff, 0)
            this.camPos = this.camPos.subtract(diffPrime)
            this.lastDragPosition = cursor
        }
    }

    updateFPS() {
        let time = performance.now()
        if (this.lastFrame) {
            let dt = time - this.lastFrame
            let currFPS = 1000 / dt
            this.averageFPS = lerp(this.averageFPS, currFPS, 0.01)
        }
        this.lastFrame = time
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

        this.scene = this.makeSceneNode()
        this.mouseOverData = Scene.pick( this.scene, this.input.cursor )
        let { node, point } = this.mouseOverData
        if ( node?.onHover )
            node.onHover( node, point )

        this.updateDrag()
        this.updateFPS()
    }

    render() {
        let g = this.graphics
        g.c.fillStyle = "#5fb2de"
        g.c.fillRect( 0, 0, g.size.x, g.size.y )
        g.c.imageSmoothingEnabled = false
        let picked = Scene.pickNode( this.scene, this.input.cursor )
        if ( this.showSceneDebug && picked !== undefined ) {
            picked.color = "white"
            Scene.render( g.c, this.scene, true )
            g.drawText( this.input.cursor.add( Vector.one.scale( 20 ) ), 12, picked.description ?? "a", "white" )
        } else {
            Scene.render( g.c, this.scene, false )
        }
        if (this.showFPS) {
            g.drawText(Vector.one.scale(10), 12, this.averageFPS.toFixed(2), "red")
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