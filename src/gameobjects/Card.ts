import Game from "../Game"
import Graphics from "../Graphics"
import { Vector } from "../math/Vector"
import Unit from "./Unit"
import { getImg, randomColor } from "../common/utils"
import World from "./World"
import CardTypes, { CardType, randomCardType } from "../CardTypes"

//this requires two periods while Cardtypes require only one period, idk why...
// const backing = getImg( require( "../www/images/cards/RedCardBase.png" ) )

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

        //background
        // g.strokeRect( Vector.zero, Card.dimensions, "#ffddff")
        // g.drawRect( Vector.zero, Card.dimensions, this.type.color)
        g.c.drawImage( this.type.backing, 0, 0, Card.dimensions.x, Card.dimensions.y, 0, 0, Card.dimensions.x, Card.dimensions.y )
        //graphic
        g.c.drawImage( this.type.sprite, 0, 0, Card.dimensions.x, Card.dimensions.y, 2, 0, Card.dimensions.x, Card.dimensions.y )
        //title
        g.setFont( 5, "pixel2" )
        g.drawText( new Vector(3, 1), this.type.name, "#f0ead8" )

        //card description
        g.drawRect( new Vector(4, 40), new Vector(40, 20), "grey")
        let lines = this.type.description.split("\n")
        lines.forEach( (line, index) => {
            g.setFont( 3, "pixel2" )
            g.drawText( new Vector(6, 42 + index*3 ), line, "#f0ead8" )
        })
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