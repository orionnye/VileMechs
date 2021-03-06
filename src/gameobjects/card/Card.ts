// import Game from "../Game"
// import Graphics from "../Graphics"
// import { Vector } from "../math/Vector"
// import Unit from "./Unit"
// import { getImg, randomColor } from "../common/utils"
// import Match from "./Match"
// import CardTypes, { CardType, randomCardType } from "../CardTypes"

import { dirxml } from "console"
import Graphics from "../../common/Graphics"
import { randomColor } from "../../common/utils"
import Game from "../../Game"
import { Vector } from "../../math/Vector"
import Unit from "../mech/Unit"
import CardTypes, { randomCardType } from "./CardTypes"

//this requires two periods while Cardtypes require only one period, idk why...
// const backing = getImg( require( "../www/images/cards/RedCardBase.png" ) )

export default class Card {
    static dimensions = new Vector( 48, 64 )

    yRotation: number = 0
    pos: Vector = new Vector( 0, 0 )
    color: string = randomColor()
    type = CardTypes.laser

    constructor( cardType?: typeof CardTypes.laser ) {
        if ( cardType ) {
            this.type = cardType
        } else {
            this.type = randomCardType()
        }
    }

    render() {
        let g = Graphics.instance

        let c = Math.cos( -this.yRotation )
        g.vTranslate( Card.dimensions.scale( 0.5 ) )
        g.c.scale( c, 1 )
        g.vTranslate( Card.dimensions.scale( -0.5 ) )

        if ( this.yRotation >= Math.PI / 2 ) {
            // Back face
            g.strokeRect( new Vector( 0, 0 ), Card.dimensions, "#ffddff" )
            g.drawRect( new Vector( 0, 0 ), Card.dimensions, this.type.color )
        } else {
            // Front face
            g.c.drawImage( this.type.backing, 0, 0, Card.dimensions.x, Card.dimensions.y, 0, 0, Card.dimensions.x, Card.dimensions.y )
            //graphic
            g.c.drawImage( this.type.sprite, 0, 0, Card.dimensions.x, Card.dimensions.y, 7, 7, Card.dimensions.x * 0.75, Card.dimensions.y * 0.75 )
            //background boxing
            g.drawRect(new Vector(0, 0), new Vector(Card.dimensions.x, 8), this.type.color)
            //title
            g.setFont( 5, "pixel2" )
            g.drawText( new Vector( 3, 1 ), this.type.name, "#f0ead8" )
            
            //Cost Display
            if (this.type.onApplyToTile) {
                let costDimensions = new Vector(10, 10)
                let costPos = new Vector(0, 7)
                let darkGreen = "rgb(30, 125, 30)"
                let lightGreen = "rgb(0, 240, 0)"
                g.drawRect(costPos, costDimensions, this.type.color)
                g.drawRect(costPos.add(new Vector(1.5, 1)), new Vector(7, 8), darkGreen)
                // g.setFont(Card.dimensions.x/4, "pixel2")
                // g.drawText(costPos.add(new Vector(1.9, -2.7)), this.type.cost.toString(), darkGreen)
                g.setFont(Card.dimensions.x/6, "pixel2")
                g.drawText(costPos.add(new Vector(1.5, 1)), this.type.cost.toString(), lightGreen)
            }
            //card description
            g.drawRect( new Vector( 4, 40 ), new Vector( 40, 20 ), this.type.color )
            let description = this.type.getDescription( this )
            let lines = getLines( description, 17 )
            lines.forEach( ( line, index ) => {
                g.setFont( 5, "ariel" )
                // g.setFont( 3, "pixel2" )
                g.drawText( new Vector( 6, 42 + index * 4 ), line, "#f0ead8" )
            } )
        }
    }

    getTilesInRange( user: Unit ) {
        return this.type.getTilesInRange( this, user )
    }

    apply( user: Unit, pos: Vector ) {
        const type = this.type
        const dim = type.dim
        const match = Game.instance.match
        let target = match.getUnit( pos )
        if ( type.onApplyToTile ) {
            if ( type.getTilesEffected ) {
                type.getTilesEffected( user, pos ).forEach( ( tile, i ) => {
                    target = match.getUnit( tile )
                    type.onApplyToTile!( this, user, tile, target )
                } )
            }
            type.onApplyToTile( this, user, pos, target )
        }
        // console.log("Logging CardCost: ", type.cost)
        user.addEnergy( -type.cost )
    }
}

export function getLines( text: string, charsPerLine: number ) {
    let words = text.split( " " )
    if ( words.length == 0 ) return []
    let lines: string[] = []
    let line = words[ 0 ]
    for ( let i = 1; i < words.length; i++ ) {
        let word = words[ i ]
        let nextLine = line + " " + word
        if ( nextLine.length > charsPerLine ) {
            lines.push( line )
            line = word
        } else {
            line = nextLine
        }
    }
    if ( line.length > 0 )
        lines.push( line )
    return lines
}