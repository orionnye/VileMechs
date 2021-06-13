import { Vector } from './math';
import World from './World';
import Input from "./input";
import Canvas from "./canvas";
import "./GlobalTypes";
import UI from './UI';

export default class Game {
    static uiScale = 4 // Size of one grunit in pixels.

    canvas = new Canvas()
    input = new Input()

    world = new World()
    ui = new UI()

    camPos = new Vector( 0, 0 ) // in ui space
    camVelocity = new Vector( 0, 0 )

    camTarget: Vector | null = null

    setCameraTarget( pos: Vector ) {
        let halfScreenDims = this.canvas.size.scale( 0.5 / Game.uiScale ) // in ui space
        let adjustedTarget = pos.subtract( halfScreenDims )
        if ( adjustedTarget.subtract( this.camPos ).length / World.tileSize < 3 )
            return
        this.camTarget = pos.subtract( halfScreenDims )
    }

    pixelSpaceToWorldSpace( pos: Vector ) {
        return pos.scale( 1 / Game.uiScale ).add( this.camPos ).scale( 1 / World.tileSize )
    }

    worldSpaceToUISpace( pos: Vector ) {
        return pos.scale( World.tileSize ).subtract( this.camPos )
    }

    worldCursor() {
        return this.pixelSpaceToWorldSpace( this.input.cursor )
    }

    update() {
        let { input, camVelocity, camPos } = this

        this.ui.update( this )

        if ( input.keys.get( "w" ) ) {
            camVelocity.y += -1
            this.camTarget = null
        }
        if ( input.keys.get( "s" ) ) {
            camVelocity.y += 1
            this.camTarget = null
        }
        if ( input.keys.get( "a" ) ) {
            camVelocity.x += -1
            this.camTarget = null
        }
        if ( input.keys.get( "d" ) ) {
            camVelocity.x += 1
            this.camTarget = null
        }

        this.camPos = camPos.add( camVelocity )
        this.camVelocity = camVelocity.scale( 0.8 )
        if ( camVelocity.length < 0.5 ) {
            camVelocity = new Vector( 0, 0 )
            camPos.x |= 0
            camPos.y |= 0
        }

        if ( this.camTarget )
            this.camPos = this.camPos.lerp( this.camTarget, 0.075 )

    }

    render() {
        let grunitSize = Game.uiScale
        let { canvas, camPos, world, ui } = this
        let { c } = canvas
        canvas.clear();
        c.save()
        c.scale( grunitSize, grunitSize )
        c.imageSmoothingEnabled = false
        c.save()
        {
            c.translate( -camPos.x, -camPos.y )
            world.render( canvas, this )
        }
        c.restore()
        ui.render( canvas, world )
        c.restore()
    }
}