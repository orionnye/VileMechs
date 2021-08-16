import Game from "./Game"
let game = new Game()

//this is where we navigate between menu and game
function loop() {
    game.update()
    game.render()
    window.requestAnimationFrame( loop )
}
loop()