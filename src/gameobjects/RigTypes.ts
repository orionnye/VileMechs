import CardTypes from "../CardTypes"
import { getImg } from "../common/utils"
import { Deck } from "./Deck"
import Unit from "./Unit"

const treant = getImg( require( "../www/images/units/Vinecent1.png" ) )
const chrome = getImg( require( "../www/images/units/MinigunMech_sheet.png" ) )
const flesh = getImg( require( "../www/images/units/FleshBase.png" ) )

export class Chrome extends Unit {
    constructor(pos, teamNumber) {
        super(pos, teamNumber)
        this.sprite = chrome

        this.maxHealth += 3
        this.health = this.maxHealth

        this.draw.add(CardTypes.laser, 2)
        this.draw.add(CardTypes.repair)

        this.cardCycle()
    }
}

export class Treant extends Unit {
    constructor(pos, teamNumber) {
        super(pos, teamNumber)
        this.sprite = treant

        this.maxSpeed -= 2
        this.speed = this.maxSpeed
        
        this.draw.max += 1

        this.maxEnergy += 1
        this.energy = this.maxEnergy

        this.draw.add(CardTypes.bouldertoss, 2)
        this.draw.add(CardTypes.mine)

        this.cardCycle()
    }
    
}
export class Flesh extends Unit {
    constructor(pos, teamNumber) {
        super(pos, teamNumber)
        this.sprite = flesh

        this.maxSpeed += 2
        this.speed = this.maxSpeed
        
        this.draw.add(CardTypes.tentacle)
        this.draw.add(CardTypes.claw, 2)

        this.cardCycle()
    }
}