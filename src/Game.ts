import { Vector } from './math';
import World from './World';
import Input from "./input";
import Canvas from "./canvas";
import "./GlobalTypes";
import UI from './UI';

export default class Game {
    static instance: Game

    static uiScale = 3 // Size of one grunit in pixels.

    canvas = new Canvas()
    input = new Input()

    world = new World()
    ui = new UI()

    camPos = new Vector( 0, 0 ) // in ui space
    camVelocity = new Vector( 0, 0 )

    camTarget: Vector | null = null

    static minSeekDistance = World.tileSize * 12 / Game.uiScale

    constructor() {
        Game.instance = this
        window.addEventListener( "click", ( ev ) => this.onClick() )
        window.addEventListener( "resize", ( ev ) => this.canvas.onResize() )
        window.addEventListener( "keyup", ( ev ) => {
            if ( ev.key == "Enter" ) {
                console.log( "PUSHED ENTER" )
                if ( this.ui.cardIndex !== undefined ) {
                    this.ui.getSelectedUnit( this.world )?.hand.cards[ this.ui.cardIndex ].apply()
                }
            }
        } )
    }

    setCameraTarget( pos: Vector ) {
        let halfScreenDims = this.canvas.size.scale( 0.5 / Game.uiScale ) // in ui space
        let adjustedTarget = pos.subtract( halfScreenDims )
        if ( adjustedTarget.distance( this.camPos ) < Game.minSeekDistance )
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

    onClick() {
        this.world.onClick( this.worldCursor(), this )
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
        this.camVelocity = camVelocity.scale( 0.85 )
        if ( camVelocity.length < 0.5 ) {
            camVelocity = new Vector( 0, 0 )
            camPos.x |= 0
            camPos.y |= 0
        }

        if ( this.camTarget ) {
            this.camVelocity = this.camPos.lerp( this.camTarget, 0.075 ).subtract( this.camPos )
            // if ( camPos.subtract( this.camTarget ).length < Game.minSeekDistance )
            //     this.camTarget = null
        }

    }

    render() {
        let grunitSize = Game.uiScale
        let { canvas, camPos, world, ui } = this
        let { c } = canvas

        c.fillStyle = "#5fb2de"
        c.beginPath()
        c.fillRect( 0, 0, canvas.size.x, canvas.size.y )

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