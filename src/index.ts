
import { Vector } from './math';
import World from './World';
import Input from "./input";
import Canvas from "./canvas";
import "./GlobalTypes";
import UI from './UI';


// DOM
let canvas = new Canvas()
const grunitSize = 4

// Input
let input = new Input()
input.watchCursor()
input.watchMouse()
input.watchKeys()

// State
let world = new World()
let ui = new UI()

let camPos = new Vector( 0, 0 ) // grunit space
let camVelocity = new Vector( 0, 0 )
function centerCamera( pos: Vector ) {
    console.log( canvas.size.toString() )
    camPos = pos.subtract( canvas.size.scale( 0.5 / grunitSize ) )
}
centerCamera( new Vector( World.tileSize, World.tileSize ).scale( 5 ) )

// Game logic
function update() {
    if ( input.keys.get( "w" ) )
        camVelocity.y += -1
    if ( input.keys.get( "s" ) )
        camVelocity.y += 1
    if ( input.keys.get( "a" ) )
        camVelocity.x += -1
    if ( input.keys.get( "d" ) )
        camVelocity.x += 1
    camPos = camPos.add( camVelocity )
    camVelocity = camVelocity.scale( 0.8 )
    if ( camVelocity.length < 0.5 ) {
        camVelocity = new Vector( 0, 0 )
        camPos.x |= 0
        camPos.y |= 0
    }
}

function render() {
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

function reload() {
    update()
    render()
    window.requestAnimationFrame( reload )
}
reload();