import Game from "./Game"
import Matrix from "./math/Matrix"
import { Vector } from "./math/Vector"
import Scene from "./scene/Scene"
import World from "./World"

export default class Camera {
    position: Vector
    targetPosition?: Vector
    velocity: Vector
    zoom: number
    rotation: number
    velocityDecay = 0.85
    lastDragPosition?: Vector

    constructor() {
        this.position = new Vector( 0, 0 )
        this.velocity = new Vector( 0, 0 )
        this.zoom = 1
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
    cameraToWorld( screenWidth: number, screenHeight: number ) {
        let { x, y } = this.position
        let { zoom, rotation } = this
        let invZoom = 1 / zoom
        return Matrix.transformation(
            -screenWidth / 2, -screenHeight / 2,
            rotation,
            invZoom, invZoom,
            x, y
        )
    }
    worldPosition( screenWidth: number, screenHeight: number, screenPosition: Vector ) {
        return this.cameraToWorld( screenWidth, screenHeight ).multiplyVec( screenPosition )
    }

    update() {
        let game = Game.instance
        let { input } = game

        if ( input.keys.get( "w" ) ) {
            this.velocity.y += -1
            this.targetPosition = undefined
        }
        if ( input.keys.get( "s" ) ) {
            this.velocity.y += 1
            this.targetPosition = undefined
        }
        if ( input.keys.get( "a" ) ) {
            this.velocity.x += -1
            this.targetPosition = undefined
        }
        if ( input.keys.get( "d" ) ) {
            this.velocity.x += 1
            this.targetPosition = undefined
        }

        this.position = this.position.add( this.velocity )
        this.velocity = this.velocity.scale( this.velocityDecay )
        if ( this.velocity.length < 0.5 ) {
            this.velocity = new Vector( 0, 0 )
            this.position.x |= 0
            this.position.y |= 0
        }

        if ( this.targetPosition ) {
            let lerpTarget = this.position.lerp( this.targetPosition, 0.05 )
            this.velocity = lerpTarget.subtract( this.position )
            if ( this.isInFocusArea( this.targetPosition ) )
                this.targetPosition = undefined
        }

        if ( this.lastDragPosition ) {
            let cursor = input.cursor
            let diff = this.lastDragPosition.subtract( cursor )
            let mat = Scene.relativeMatrix( game.world.scene )
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
        let dx = Math.abs( pos.x ) - center.x
        let dy = Math.abs( pos.y ) - center.y
        return Math.max( dx, dy )
    }
    isInFocusArea( pos: Vector ) {
        return this.distFromViewport( pos.subtract( this.position ) ) < -World.tileSize * 2
    }
    setCameraTarget( pos: Vector ) {
        if ( this.isInFocusArea( pos ) )
            return
        this.targetPosition = pos
    }
}