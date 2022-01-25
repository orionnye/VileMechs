import Game from "./Game"
import { Deck } from "./gameobjects/Deck"
import { FleshBot, JellyBot } from "./gameobjects/RigTypes"
import World from "./gameobjects/World"
import { randomFloor } from "./math/math"
import { Vector } from "./math/Vector"
import Store from "./Store"
let world = new World()
let game = new Game(world)
let store = new Store(world)
let level = 0
let matchActive = true
//this is where we navigate between menus and game

window.addEventListener( "keyup", ev => {
    if (ev.key == "Enter") {
        if (matchActive && game.isGameOver) {
            console.log("Ending Match")
            matchActive = false
            level += 1
            store.reset()
        } else if (!matchActive) {
            console.log("Starting Match")
            //Generate Enemies
            const enemyCount = 2 + level
            for (let i = 0; i < enemyCount; i++) {
                let randomI = Math.random()
                let JellyChance = 0.2
                let enemy = new FleshBot(new Vector(0, 0), 1)
                if (randomI < JellyChance) {
                    enemy = new JellyBot(new Vector(0, 0), 1)
                }
                game.world.units.push(enemy)
                game.world.map.placeUnits( game.world.units )
            }
            //Generate new Map
            game.world.map.randomize2( 0 )
            game.world.map.placeUnits( game.world.units )
            game.world.units.forEach(unit => {
                unit.statReset()
                unit.cardCycle()
            })
            //Match Toggle
            matchActive = true
        }
    }  
} )

function loop() {
    if (matchActive) {
        game.update()
        game.render()
    } else {
        store.update()
        store.render()
    }
    window.requestAnimationFrame( loop )
}
loop()