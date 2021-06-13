import { Vector } from './math';
import World from './World';
import Input from "./input";
import Canvas from "./canvas";
import "./GlobalTypes";
import UI from './UI';

export default class Game {
    static grunitSize = 4

    canvas = new Canvas()
    input = new Input()

    world = new World()
    ui = new UI()

    camPos = new Vector( 0, 0 ) // grunit space
    camVelocity = new Vector( 0, 0 )

    update() {
        let { input, camVelocity, camPos } = this
        if ( input.keys.get( "w" ) )
            camVelocity.y += -1
        if ( input.keys.get( "s" ) )
            camVelocity.y += 1
        if ( input.keys.get( "a" ) )
            camVelocity.x += -1
        if ( input.keys.get( "d" ) )
            camVelocity.x += 1
        this.camPos = camPos.add( camVelocity )
        this.camVelocity = camVelocity.scale( 0.8 )
        if ( camVelocity.length < 0.5 ) {
            camVelocity = new Vector( 0, 0 )
            camPos.x |= 0
            camPos.y |= 0
        }
    }

    render() {
        let grunitSize = Game.grunitSize
        let { canvas, camPos, world, ui } = this
        let { c } = canvas
        canvas.clear();
        c.save()
        c.scale( grunitSize, grunitSize )
        c.imageSmoothingEnabled = false
        c.save()
        {
            c.translate( -camPos.x, -camPos.y )
            world.render( canvas )
        }
        c.restore()
        ui.render( canvas, world )
        c.restore()
    }
}