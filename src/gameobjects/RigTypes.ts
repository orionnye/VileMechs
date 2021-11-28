import CardTypes from "../CardTypes"
import { getImg } from "../common/utils"
import { Deck } from "./Deck"
import Unit from "./Unit"

// const treant = getImg( require( "../www/images/units/Vinecent1.png" ) )
const treant = getImg( require( "../www/images/units/Vinecent2.png" ) )
const chrome = getImg( require( "../www/images/units/MinigunMech_sheet.png" ) )
const flesh = getImg( require( "../www/images/units/FleshBase.png" ) )
const jelly = getImg( require( "../www/images/units/GellyMech.png" ) )

export class Chrome extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = chrome

        this.maxHealth += 3
        this.health = this.maxHealth

        this.draw.add( CardTypes.laser, 2 )
        this.draw.add( CardTypes.repair )

        this.cardCycle()
    }
}

export class Treant extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = treant

        this.maxSpeed -= 2
        this.speed = this.maxSpeed

        this.draw.max += 1

        this.maxEnergy += 1
        this.energy = this.maxEnergy

        this.draw.add( CardTypes.bouldertoss, 2 )
        this.draw.add( CardTypes.mine )

        this.cardCycle()
    }

}
export class Flesh extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = flesh

        this.maxSpeed += 2
        this.speed = this.maxSpeed

        this.draw.add( CardTypes.claw, 5 )
        this.draw.add( CardTypes.tentacle )

        this.cardCycle()
    }
}

export class Jelly extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = jelly
        
        this.maxSpeed += 2
        this.speed = this.maxSpeed
        
        this.draw.cards = []
        this.draw.add( CardTypes.bubbletoss, 6 )
        this.draw.add( CardTypes.tentacle, 2 )
        
        this.cardCycle()
    }
}
export class FleshBot extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = flesh
        
        this.maxSpeed += 2
        this.speed = this.maxSpeed
        
        this.draw.cards = []
        this.draw.add( CardTypes.claw, 3)
        
        this.cardCycle()
    }
}
export class JellyBot extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = jelly
        
        this.maxSpeed += 2
        this.speed = this.maxSpeed
        
        this.draw.cards = []
        this.draw.add( CardTypes.bubbletoss, 3 )
        
        this.cardCycle()
    }
}