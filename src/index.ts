import Game from "./Game"
import { FleshBot, JellyBot } from "./gameobjects/mech/RigTypes"
import World from "./gameobjects/map/World"
import { randomFloor } from "./math/math"
import { Vector } from "./math/Vector"
import Store from "./stages/Store"
let game = new Game()
//this is where we navigate between menus and game

function loop() {
    // if (matchActive) {
        game.update()
        game.render()
    // } else {
    //     store.update()
    //     store.render()
    // }
    window.requestAnimationFrame( loop )
}
loop()