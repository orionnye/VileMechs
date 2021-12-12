import CardTypes from "../CardTypes"
import { getImg } from "../common/utils"
import Card from "./Card"
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
        
        this.draw.cards = []
        
        //custom stats
        this.maxHealth += 3
        this.drawSpeed = 4
        this.maxEnergy = 3
        //custom cards
        this.draw.add( CardTypes.repair, 1 )
        this.draw.add( CardTypes.shieldCharge, 2 )
        this.draw.add( CardTypes.laser, 2 )
        this.draw.add( CardTypes.chargeBeam, 1 )

        this.statReset()
    }
    // Damage reception overload to check for any energy armor and reduce damage recieved
    addHealth( amount: number ) {
        let { energyArmor } = CardTypes
        let reduction = 0
        if (amount < 0) {
            console.log(this.hand.typeCount(energyArmor))
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
            this.hand.cards.forEach( (card, index) => {
                if (card.type == energyArmor && reduction < Math.abs(amount)) {
                    reduction += 2
                    this.hand.cards.splice(index, 1)
                }
            })
        }
        console.log( "Reduction:", reduction )
        this.health += amount + reduction
    }
}

export class Treant extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = treant

        this.maxSpeed -= 2
        this.speed = this.maxSpeed

        this.drawSpeed = 5

        this.maxEnergy += 1
        this.energy = this.maxEnergy

        this.draw.cards = []
        this.draw.add( CardTypes.bouldertoss, 4 )
        this.draw.add( CardTypes.mine, 3 )

        this.cardCycle()
    }

}
export class Flesh extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = flesh

        this.maxSpeed += 2
        this.speed = this.maxSpeed

        this.draw.add( CardTypes.claw, 3 )
        this.draw.add( CardTypes.tentacle, 2 )

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
export class FleshBot extends Flesh {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )

        this.maxSpeed = 4
        this.speed = this.maxSpeed
        
        this.draw.cards = []
        this.draw.add( CardTypes.claw, 3)
        
        this.cardCycle()
    }
}
export class JellyBot extends Jelly {
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