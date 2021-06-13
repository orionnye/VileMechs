import Game from "./Game"
let game = new Game
function loop() {
    game.update()
    game.render()
    window.requestAnimationFrame( loop )
}
loop();