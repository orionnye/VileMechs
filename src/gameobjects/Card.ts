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

    getTargets( user: Unit ) {
        return this.type.getTargets( user )
        // let result: Vector[] = []
        // let { x, y } = user.pos
        // for ( let dy = -2; dy <= 2; dy++ )
        //     for ( let dx = -2; dx <= 2; dx++ )
        //         if ( Math.abs( dx ) + Math.abs( dy ) < 3 && Math.abs( dx ) + Math.abs( dy ) > 0 )
        //             result.push( new Vector( x + dx, y + dy ) )
        // return result
        // return [
        //     user.pos.addXY( 1, 0 ),
        //     user.pos.addXY( -1, 0 ),
        //     user.pos.addXY( 0, 1 ),
        //     user.pos.addXY( 0, -1 ),
        // ]
    }

    apply( user: Unit, pos: Vector, target?: Unit ) {
        const type = this.type
        if ( type.onApplyToTile )
            type.onApplyToTile( user, pos, target )
    }
}