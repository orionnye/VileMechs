import Game from "../Game"
import { clamp } from "../math/math"
import Matrix from "../math/Matrix"
import { Vector } from "../math/Vector"
import Scene from "../Scene"
import Match from "./Match"
import World from "./World"

export default class Camera {
    position: Vector
    targetPosition?: Vector
    velocity: Vector
    get zoom() { return Math.SQRT2 ** this.zoomLevel }
    zoomLevel: number
    rotation: number
    velocityDecay = 0.85
    lastDragPosition?: Vector

    constructor() {
        //position should be 0, 0
        this.position = new Vector( 600, 600 )
        this.velocity = new Vector( 0, 0 )
        //soomlevel should be 0
        this.zoomLevel = -3
        this.rotation = 0
    }

    worldToCamera( screenWidth: number, screenHeight: number ) {
        let { x, y } = this.position
        let { zoom, rotation } = this
        return Matrix.transformation(
            -x, -y,
            -rotation,
            zoom, zoom,
            screenWidth / 2, screenHeight / 2
        )
    }
    cameraToWorld( screenWidth: number, screenHeight: number ) { return this.worldToCamera( screenWidth, screenHeight ).inverse() }
    worldPosition( screenWidth: number, screenHeight: number, screenPosition: Vector ) {
        return this.cameraToWorld( screenWidth, screenHeight ).multiplyVec( screenPosition )
    }

    onKeyup( ev: KeyboardEvent ) {
        if ( ev.key == "=" )
            this.changeZoom( true )
        if ( ev.key == "-" )
            this.changeZoom( false )
    }
    onWheel( ev: WheelEvent ) {
        this.changeZoom( Math.sign( ev.deltaY ) < 0 )
    }
    changeZoom( zoomIn: boolean ) {
        let dz = zoomIn ? 1 : -1
        this.zoomLevel = clamp( -4, 4, this.zoomLevel + dz )
    }

    update() {
        let game = Game.instance
        let { input } = game

        let acceleration = 1 / this.zoom
        if ( input.keys.get( "w" ) ) {
            this.velocity.y += -acceleration
            this.targetPosition = undefined
        }
        if ( input.keys.get( "s" ) ) {
            this.velocity.y += acceleration
            this.targetPosition = undefined
        }
        if ( input.keys.get( "a" ) ) {
            this.velocity.x += -acceleration
            this.targetPosition = undefined
        }
        if ( input.keys.get( "d" ) ) {
            this.velocity.x += acceleration
            this.targetPosition = undefined
        }
        let rotationSpeed = 0.01
        if ( input.keys.get( "]" ) ) {
            this.rotation += rotationSpeed
        }
        if ( input.keys.get( "[" ) ) {
            this.rotation -= rotationSpeed
        }

        this.position = this.position.add( this.velocity )
        this.velocity = this.velocity.scale( this.velocityDecay )
        // if ( this.velocity.length < 0.5 ) {
        //     this.velocity = new Vector( 0, 0 )
        //     this.position.x |= 0
        //     this.position.y |= 0
        // }

        if ( this.targetPosition ) {
            let lerpTarget = this.position.lerp( this.targetPosition, 0.05 )
            this.velocity = lerpTarget.subtract( this.position )
            if ( this.isInFocusArea( this.targetPosition ) )
                this.targetPosition = undefined
        }

        if ( this.lastDragPosition ) {
            this.targetPosition = undefined
            let cursor = input.cursor
            let diff = this.lastDragPosition.subtract( cursor )
            let mat = Scene.relativeMatrix( Match.instance.world.scene )
            let diffPrime = mat.inverse().multiplyVec( diff, 0 )
            this.velocity = diffPrime
            this.lastDragPosition = cursor
        }
    }

    startDragging() {
        this.lastDragPosition = Game.instance.input.cursor
    }

    stopDragging() {
        this.lastDragPosition = undefined
    }

    distFromViewport( pos: Vector ) {
        let center = Game.instance.screenCenter()
        let diff = pos.subtract( center )
        let dx = Math.abs( diff.x ) - center.x
        let dy = Math.abs( diff.y ) - center.y
        return Math.max( dx, dy )
    }
    isInFocusArea( pos: Vector ) {
        let screenDims = Game.instance.screenDimensions()
        let pos2 = this.worldToCamera( screenDims.x, screenDims.y ).multiplyVec( pos )
        return this.distFromViewport( pos2 ) < -World.tileSize * 2
    }
    setCameraTarget( pos: Vector ) {
        if ( this.isInFocusArea( pos ) )
            return
        this.targetPosition = pos
    }
}