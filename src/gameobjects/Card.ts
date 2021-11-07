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

    yRotation: number = 0
    pos: Vector = Vector.zero
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
            g.strokeRect( Vector.zero, Card.dimensions, "#ffddff" )
            g.drawRect( Vector.zero, Card.dimensions, this.type.color )
        } else {
            // Front face
            g.c.drawImage( this.type.backing, 0, 0, Card.dimensions.x, Card.dimensions.y, 0, 0, Card.dimensions.x, Card.dimensions.y )
            //graphic
            g.c.drawImage( this.type.sprite, 0, 0, Card.dimensions.x, Card.dimensions.y, 2, 0, Card.dimensions.x, Card.dimensions.y )
            //title
            g.setFont( 5, "pixel2" )
            g.drawText( new Vector( 3, 1 ), this.type.name, "#f0ead8" )

            //card description
            g.drawRect( new Vector( 4, 40 ), new Vector( 40, 20 ), "grey" )
            let description = this.type.getDescription( this )
            let lines = getLines( description, 17 )
            lines.forEach( ( line, index ) => {
                g.setFont( 3, "pixel2" )
                g.drawText( new Vector( 6, 42 + index * 3 ), line, "#f0ead8" )
            } )
        }
    }

    getTilesInRange( user: Unit ) {
        return this.type.getTilesInRange( this, user )
    }

    apply( user: Unit, pos: Vector, target?: Unit ) {
        const type = this.type
        if ( type.onApplyToTile )
            type.onApplyToTile( this, user, pos, target )
    }
}

function getLines( text: string, charsPerLine: number ) {
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