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
import Card from "./Card"

export default class Game {
    static instance: Game
    static uiScale = 3
    static camVelocityDecay = 0.85
    static minSeekDistance = World.tileSize * 15 / Game.uiScale
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
    camPos = new Vector( 0, 0 )
    camVelocity = new Vector( 0, 0 )
    camTarget?: Vector = undefined
    averageFPS = 0
    lastFrame?: number

    constructor() {
        Game.instance = this
        window.addEventListener( "click", ev => this.onClick( ev ) )
        window.addEventListener( "mousedown", ev => this.onMousedown( ev ) )
        window.addEventListener( "mouseup", ev => this.onMouseup( ev ) )
        window.addEventListener( "resize", ev => this.graphics.onResize() )
        window.addEventListener( "keyup", ev => {
            //DEV COMMANDS
            if ( ev.key == "`" )
                this.showSceneDebug = !this.showSceneDebug
            if ( ev.key == "," )
                this.showFPS = !this.showFPS

            //Player buttons
            if ( ev.key == "Escape" )
                this.goBack()
            if (ev.key == "Enter") {
                console.log("This needs to cycle cards")
            }
        } )
        this.world = new World()
    }

    playerUnits() { return this.world.units }
    selectedUnit() { return this.unitTray.selectedUnit() }
    selectedCard() { return this.cardTray.selectedCard() }
    isPickingTarget() { return this.cardTray.isPickingTarget }
    onSelectUnit() {
        this.cardTray.deselect()
        let selectedUnit = this.selectedUnit()
        if ( selectedUnit )
            this.setCameraTarget( selectedUnit.pos.addXY( .5, .5 ).scale( World.tileSize ) )
    }
    goBack() {
        let { unitTray, cardTray } = this
        if ( cardTray.isPickingTarget )
            cardTray.deselect()
        else
            unitTray.deselect()
    }

    update() {
        this.cardTray.update()
        this.makeSceneNode()
        this.updateDrag()
        this.updateCamera()
        this.mouseOverData = Scene.pick( this.scene, this.input.cursor )
        let { node, point } = this.mouseOverData
        if ( node?.onHover )
            node.onHover( node, point )
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
        if ( this.showFPS ) {
            g.drawText( Vector.one.scale( 10 ), 12, this.averageFPS.toFixed( 2 ), "red" )
        }
    }

    screenDimensions() { return this.graphics.size.scale( 1 / Game.uiScale ) }
    screenCenter() { return this.graphics.size.scale( 0.5 / Game.uiScale ) }
    distFromViewport( pos: Vector ) {
        let center = this.screenCenter()
        let diff = pos.subtract( center )
        diff.x = Math.abs( diff.x ) - center.x
        diff.y = Math.abs( diff.y ) - center.y
        return Math.max( diff.x, diff.y )
    }
    isInFocusArea( pos: Vector ) { return this.distFromViewport( pos.subtract( this.camPos ) ) < -World.tileSize * 2 }
    setCameraTarget( pos: Vector ) {
        if ( this.isInFocusArea( pos ) )
            return
        this.camTarget = pos
    }

    onClick( ev: MouseEvent ) {
        let cursor = this.input.cursor
        let { node, point } = Scene.pick( this.scene, cursor )
        if ( node ) {
            if ( node.onClick )
                node.onClick( node, point )
        }
    }

    onMousedown( ev: MouseEvent ) {
        let button = ev.button
        if ( button == 0 ) {
            let cursor = this.input.cursor
            let node = Scene.pickNode( this.scene, cursor )
            let worldClicked = node == this.world.scene
            let nothingClicked = node == undefined
            let unitSelected = this.unitTray.selectedUnit() !== undefined
            if ( ( worldClicked || nothingClicked ) && !unitSelected )
                this.lastDragPosition = this.input.cursor
        } else if ( button == 2 ) {
            this.goBack()
        }
    }

    onMouseup( ev: MouseEvent ) {
        this.lastDragPosition = undefined
    }

    updateDrag() {
        if ( this.lastDragPosition ) {
            let cursor = this.input.cursor
            let diff = this.lastDragPosition.subtract( cursor )
            let mat = Scene.relativeMatrix( this.world.scene )
            let diffPrime = mat.inverse().multiplyVec( diff, 0 )
            this.camVelocity = diffPrime
            this.lastDragPosition = cursor
        }
    }

    updateFPS() {
        let time = performance.now()
        if ( this.lastFrame ) {
            let dt = time - this.lastFrame
            let currFPS = 1000 / dt
            this.averageFPS = lerp( this.averageFPS, currFPS, 0.05 )
        }
        this.lastFrame = time
    }

    updateCamera() {
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
        this.camVelocity = camVelocity.scale( Game.camVelocityDecay )
        if ( camVelocity.length < 0.5 ) {
            camVelocity = new Vector( 0, 0 )
            camPos.x |= 0
            camPos.y |= 0
        }

        if ( this.camTarget ) {
            let targetCamPos = this.camTarget.subtract( this.screenCenter() )
            let lerpTarget = this.camPos.lerp( targetCamPos, 0.05 )
            this.camVelocity = lerpTarget.subtract( this.camPos )
            if ( this.isInFocusArea( this.camTarget ) )
                this.camTarget = undefined
        }
    }

    makeSceneNode() {
        let { world, unitTray, cardTray } = this
        let selectedUnit = this.selectedUnit()
        this.scene = Scene.startNode( { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) } )
        {
            world.makeSceneNode()
            unitTray.makeSceneNode()
            if ( selectedUnit )
                cardTray.makeSceneNode()
        }
        Scene.endNode()
    }
}