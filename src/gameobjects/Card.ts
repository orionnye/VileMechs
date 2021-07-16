import Game from "../Game"
import Graphics from "../Graphics"
import { Vector } from "../math/Vector"
import Unit from "./Unit"
import { randomColor } from "../common/utils"
import World from "./World"
import CardTypes, { CardType, randomCardType } from "../CardTypes"

export default class Card {
    static dimensions = new Vector( 48, 64 )

    pos: Vector = Vector.zero
    color: string = randomColor()
    type = CardTypes.laser

    constructor() {
        this.type = randomCardType()
    }

    render() {
        let g = Graphics.instance
        g.drawRect( Vector.zero, Card.dimensions, this.type.color )
        g.strokeRect( Vector.zero, Card.dimensions, "#f0ead8" )
        g.setFont( 4, "pixel2" )
        g.drawText( Vector.one, this.type.name, "#f0ead8" )
    }

    getTilesInRange( user: Unit ) {
        return this.type.getTilesInRange( user )
    }

    apply( user: Unit, pos: Vector, target?: Unit ) {
        const type = this.type
        if ( type.onApplyToTile )
            type.onApplyToTile( user, pos, target )
    }
}