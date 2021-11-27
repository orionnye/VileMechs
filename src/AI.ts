import Game from "./Game"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"

export default class AI {
    //stats
    fear: number
    hunger: number
    //access
    unit: Unit
    world: World
    constructor(unit, fear, hunger) {
        //----------Stats--------
        //fear chance will be tested against a random number upon taking damage or being pushed on
        //fear will prioritize running away
        this.fear = fear
        //hunger chance will be tested every turn near an edible objective ie: Space-whale bodies or other mech corpses
        // hunger will prioritize non-player entities
        this.hunger = hunger

        //---------ACCESS----------
        this.unit = unit
        this.world = Game.instance.world
    }
    //here are a list of AI functions
    //each function will call another function until the unit has run out of energy
    
    //the real AI will be the function at the end of each call, that determines what function should go next

    //test function push
    selectBestCard() {
        console.log("selecting best card", "NOT REALLY" )
        this.useCard()
    }
    useCard() {
        console.log("using card", "NOT REALLY")

    }

}