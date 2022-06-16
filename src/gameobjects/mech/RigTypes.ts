import CardTypes from "../card/CardTypes"
import { getImg } from "../../common/utils"
import Unit from "./Unit"

// const treant = getImg( require( "../www/images/units/Vinecent1.png" ) )
const treant = getImg( require( "../../www/images/units/Vinecent2.png" ) )
const earth = getImg( require( "../../www/images/units/EarthMech.png" ) )
const chrome = getImg( require( "../../www/images/units/ChromeMech2.png" ) )
const flesh = getImg( require( "../../www/images/units/flesh3.png" ) )
const jelly = getImg( require( "../../www/images/units/GellyMech.png" ) )

export class Chrome extends Unit {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )
        this.sprite = chrome

        this.draw.cards = []

        //custom cards
        this.draw.add( CardTypes.shieldCharge, 1 )
        this.draw.add( CardTypes.laser, 1 )
        this.draw.add( CardTypes.rifle, 3 )

        this.cardCycle()
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

        this.draw.cards = []
        this.draw.add( CardTypes.root, 2 )
        // this.draw.add( CardTypes.mine, 2 )
        this.draw.add( CardTypes.perfume, 2 )
        // this.draw.add( CardTypes.fruit, 2 )
        this.draw.add( CardTypes.flower, 2 )

        this.cardCycle()
        this.statReset()
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
        this.draw.add( CardTypes.bouldertoss, 3 )
        // this.draw.add( CardTypes.fuel, 3 )
        // this.draw.add( CardTypes.laser, 2 )
        this.draw.add( CardTypes.mine, 2 )
        // this.draw.add( CardTypes.gorge, 5 )
        // this.draw.add( CardTypes.repair, 1 )

        this.cardCycle()
        this.statReset()
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
        // this.draw.add( CardTypes.tentacle, 2 )
        // this.draw.add( CardTypes.acid, 2)

        this.cardCycle()
        this.statReset()
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
        this.statReset()
    }
}
export class Dummy extends Flesh {
    constructor( pos, teamNumber ) {
        super( pos, teamNumber )

        this.maxSpeed = 10
        this.speed = this.maxSpeed
        this.drawSpeed = 5

        this.draw.cards = []
        this.hand.cards = []
        this.draw.add( CardTypes.repair, 5 )

        this.cardCycle()
    }
}