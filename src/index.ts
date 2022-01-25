import Game from "./Game"
import World from "./gameobjects/World"
import Store from "./Store"
let world = new World()
let game = new Game(world)
let store = new Store(world)
let matchActive = true
//this is where we navigate between menus and game

window.addEventListener( "keyup", ev => {
    if (ev.key == "Enter") {
        if (matchActive && game.isGameOver) {
            console.log("Ending Match")
            matchActive = false
        } else if (!matchActive) {
            console.log("Starting Match")
            //Generate Enemies
            
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