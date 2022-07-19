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
        let { color, backing, sprite, name } = this.type
        
        let c = Math.cos( -this.yRotation )
        g.vTranslate( Card.dimensions.scale( 0.5 ) )
        g.c.scale( c, 1 )
        g.vTranslate( Card.dimensions.scale( -0.5 ) )

        if ( this.yRotation >= Math.PI / 2 ) {
            // Back face
            g.strokeRect( new Vector( 0, 0 ), Card.dimensions, "#ffddff" )
            g.drawRect( new Vector( 0, 0 ), Card.dimensions, color )
        } else {
            // Front face
            g.c.drawImage( backing, 0, 0, Card.dimensions.x, Card.dimensions.y, 0, 0, Card.dimensions.x, Card.dimensions.y )
            //graphic
            g.c.drawImage( sprite, 0, 0, Card.dimensions.x, Card.dimensions.y, 7, 7, Card.dimensions.x * 0.75, Card.dimensions.y * 0.75 )
            //background boxing
            g.drawRect(new Vector(0, 0), new Vector(Card.dimensions.x, 8), color)
            //title
            g.setFont( 5, "pixel2" )
            g.drawText( new Vector( 3, 1 ), name, "#f0ead8" )
            
            //Cost Display
            let cost = {
                dim: new Vector(10, 10),
                pos: new Vector(0, 7),
                green: {
                    dark: "rgb(30, 125, 30)",
                    light: "rgb(0, 240, 0)"
                },
                red: {
                    light: "rgb(255, 0, 0)",
                    // dark: "rgb(75, 0, 0)",
                    dark: "rgb(100, 0, 0)",
                },
                blue: {
                    light: "rgb(150, 150, 255)",
                    // dark: "rgb(75, 0, 0)",
                    dark: "rgb(0, 0, 75)",
                },
                index: 0
            }
            let isCostDefined = this.type.cost || this.type.healthCost || this.type.speedCost
            if ( isCostDefined ) {
                //branching down backing
                g.drawRect(cost.pos, cost.dim, this.type.color)
            }
            //Energy Cost Display
            if (this.type.cost !== undefined) {
                //energy display
                g.costDisplay(cost.pos, this.type.cost, cost.green.light, cost.green.dark, Card.dimensions.x/6)
                cost.index += 1
            }
            //Health Cost Display
            if (this.type.healthCost !== undefined) {
                //health display
                let offset = new Vector(cost.dim.x, 0)
                let pos = cost.index > 0 ? cost.pos.add(offset) : cost.pos
                g.costDisplay(pos, this.type.healthCost, cost.red.light, cost.red.dark, Card.dimensions.x/6)
                cost.index += 1
            }
            //Speed Cost Display
            if (this.type.speedCost !== undefined) {
                //health display
                let offset = new Vector(0, cost.dim.y)
                let pos = cost.index > 0 ? cost.pos.add(offset) : cost.pos
                g.costDisplay(pos, this.type.speedCost, cost.blue.light, cost.blue.dark, Card.dimensions.x/6)
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
        if ( type.cost !== undefined) {
            user.addEnergy( -type.cost )
        }
        if ( type.healthCost !== undefined) {
            user.addHealth( -type.healthCost)
        }
        if ( type.speedCost !== undefined) {
            user.addSpeed( -type.speedCost)
        }
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