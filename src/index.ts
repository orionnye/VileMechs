
import { Vector } from './math';
import World from './World';
import Input from "./input";
import Canvas from "./canvas";
import "./GlobalTypes";


// DOM
let canvas = new Canvas()

// Input
let input = new Input();
input.watchCursor();
input.watchMouse();
input.watchKeys();

// State
let world = new World()
let camera = new Vector(0, 0)
let cameraVelocity = new Vector(0, 0)

function update() {
    if (input.keys.get("w"))
        cameraVelocity.y += -1
    if (input.keys.get("s"))
        cameraVelocity.y += 1
    if (input.keys.get("a"))
        cameraVelocity.x += -1
    if (input.keys.get("d"))
        cameraVelocity.x += 1
    camera = camera.add(cameraVelocity)
    cameraVelocity = cameraVelocity.scale(0.8)
}

function render() {
    canvas.clear();
    canvas.c.translate(-camera.x, -camera.y)
    world.render(canvas)
    canvas.c.translate(camera.x, camera.y)
}

function reload() {
    update();
    render();
    window.requestAnimationFrame(reload);
}
reload();