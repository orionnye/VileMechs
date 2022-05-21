import CardTypes from "../card/CardTypes"
import { getImg } from "../../common/utils"
import Unit from "./Unit"

// const treant = getImg( require( "../www/images/units/Vinecent1.png" ) )
const treant = getImg( require( "../../www/images/units/Vinecent2.png" ) )
const earth = getImg( require( "../../www/images/units/EarthMech.png" ) )
const chrome = getImg( require( "../../www/images/units/ChromeMech2.png" ) )
const flesh = getImg( require( "../../www/images/units/FleshBase.png" ) )
const jelly = getImg( require( "../../www/images/units/GellyMech.png" ) )

export class Chrome extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = chrome
        
        this.draw.cards = []
        
        //custom stats
        this.drawSpeed = 4
        //custom cards
        // this.draw.add( CardTypes.repair, 1 )
        this.draw.add( CardTypes.energyArmor, 1 )
        this.draw.add( CardTypes.laser, 3 )

        this.statReset()
    }
}

export class Treant extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = treant
        
        //Treant Stats
        this.maxEnergy += 1;
        this.energy = this.maxEnergy
        this.maxSpeed = 4
        this.speed = this.maxSpeed
        this.drawSpeed = 4

        this.draw.cards = []
        this.draw.add( CardTypes.bouldertoss, 2 )
        this.draw.add( CardTypes.mine, 4 )
        this.draw.add( CardTypes.repair, 2 )

        this.cardCycle()
    }

}
export class Earth extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = earth
        
        //Earth Stats
        this.maxSpeed = 5
        this.speed = this.maxSpeed

        this.drawSpeed = 5

        this.draw.cards = []
        this.draw.add( CardTypes.bouldertoss, 4 )
        this.draw.add( CardTypes.mine, 4 )
        // this.draw.add( CardTypes.repair, 1 )

        this.cardCycle()
    }

}
export class Flesh extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = flesh

        // Flesh Stats
        this.maxSpeed = 5
        this.speed = this.maxSpeed
        this.maxHealth = 9
        this.health = this.maxHealth

        this.draw.cards = []
        this.draw.add( CardTypes.claw, 5 )
        this.draw.add( CardTypes.tentacle, 2 )
        // this.draw.add( CardTypes.acid, 2)

        this.cardCycle()
    }
}

export class Jelly extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = jelly
        
        //Jelly Stats
        this.maxSpeed = 7
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
        
        this.maxSpeed = 6
        this.speed = this.maxSpeed
        
        this.draw.cards = []
        this.hand.cards = []
        this.draw.add( CardTypes.tentacle, 3 )
        this.draw.add( CardTypes.claw, 5)
        
        this.cardCycle()
    }
}
export class ChromeBot extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = chrome
        
        this.draw.cards = []
        
        //custom stats
        this.drawSpeed = 4
        //custom cards
        this.draw.add( CardTypes.repair, 2 )
        this.draw.add( CardTypes.shieldCharge, 3 )
        this.draw.add( CardTypes.laser, 5 )

        this.statReset()
    }
    // Damage reception overload to check for any energy armor and reduce damage recieved
    addHealth( amount: number ) {
        let { energyArmor } = CardTypes
        let reduction = 0
        if (amount < 0) {
            // console.log(this.hand.typeCount(energyArmor))
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
            this.hand.cards.forEach( (card, index) => {
                if (card.type == energyArmor && reduction < Math.abs(amount)) {
                    reduction += 2
                    this.hand.cards.splice(index, 1)
                }
            })
        }
        // console.log( "Reduction:", reduction )
        this.health += amount + reduction
    }
}
export class Dummy extends Flesh {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )

        this.maxSpeed = 10
        this.speed = this.maxSpeed
        
        this.draw.cards = []
        this.hand.cards = []
        this.draw.add( CardTypes.repair, 5)
        
        this.cardCycle()
    }
}
export class JellyBot extends Jelly {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = jelly
        
        this.draw.cards = []
        this.draw.add( CardTypes.bubbletoss, 3 )
        this.draw.add( CardTypes.tentacle, 1 )
        
        this.cardCycle()
    }
}