import { clamp, randomFloor, randomInt } from "../../math/math"
import { Vector } from "../../math/Vector"
import Matrix from "../../math/Matrix"
import Graphics, { TextAlignX, TextAlignY } from "../../common/Graphics"
import names from "../../common/names"
import { getImg } from "../../common/utils"
import Game from "../../Game"
import Scene, { SceneNode } from "../../common/Scene"
import Match from "../../stages/Match"
import CardTypes, { CardType } from "../card/CardTypes"
import { Deck } from "../card/Deck"
import Card from "../card/Card"
import Entity from "./Entity"

const mechSheet = getImg( require( "../../www/images/units/ChromeMech2.png" ) )

export default class Unit extends Entity {
    //team
    teamNumber: number
    done: boolean

    //Cards
    draw: Deck = new Deck()
    hand: Deck = new Deck()
    discard: Deck = new Deck()
    drawSpeed: number

    //visualStats
    name: string

    constructor( pos, teamNumber = 0, sprite: HTMLImageElement = mechSheet ) {
        super( pos, )
        this.name = names[ randomFloor( names.length ) ]
        this.teamNumber = teamNumber
        this.done = false
        this.drawSpeed = 4
        this.hand.max = 8
    }

    get team() {
        return Game.instance.match.teams[ this.teamNumber ]
    }

    // Model
    addHealth( amount: number ) {
        let { energyArmor } = CardTypes
        let reduction = 0
        if ( amount < 0 ) {
            // console.log(this.hand.typeCount(energyArmor))
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
            this.hand.cards.forEach( ( card, index ) => {
                if ( card.type == energyArmor && reduction < Math.abs( amount ) ) {
                    reduction += energyArmor.damage
                    let store = this.hand.cards.splice( index, 1 )
                    this.discard.cards.push( store[ 0 ] )
                }
            } )
        }
        super.addHealth( amount + reduction )
    }

    //Card management
    gainCard( cardType: CardType, count: number = 1 ) {
        for ( let i = count; i > 0; i-- ) {
            if ( this.hand.length < this.hand.max ) {
                this.hand.add( cardType )
            } else {
                this.discard.add( cardType )
            }
        }
    }

    drawCard( amount: number ) {
        for ( let i = amount; i > 0; i-- ) {
            // console.log("being Called")
            if ( this.draw.length > 0 ) {
                let card = <Card>this.draw.cards.pop()
                // console.log("DrawPile Exists:", card.type.name)
                this.hand.cards.push( card )
            } else {
                this.discard.emptyInto( this.draw )
                if ( this.draw.length > 0 ) {
                    let card = <Card>this.draw.cards.pop()
                    // console.log("DrawPile Doesnt Exists:", card.type.name)
                    this.hand.cards.push( card )
                }
            }
        }
    }

    discardCard( amount: number = 1 ) {
        for ( let i = amount; i > 0; i-- ) {
            // console.log("being Called")
            if ( this.hand.length > 0 ) {
                let card = <Card>this.hand.cards.pop()
                // console.log("DrawPile Exists:", card.type.name)
                this.discard.cards.push( card )
            }
        }
    }

    cardCycle() {
        let { draw, hand, discard, drawSpeed } = this
        let totalCards = hand.length + draw.length + discard.length

        //empty hand into discard
        discard.fillFrom( hand )
        //fill hand from draw pile
        hand.fillTill( draw, drawSpeed )

        //empty remaining cards from hand into discardPile
        if ( hand.length < drawSpeed ) {
            //fill draw pile from discard
            draw.fillFrom( discard )
            //fill hand from draw pile
            hand.fillTill( draw, drawSpeed )
        }
    }

    statReset() {
        //Stat Reset
        this.energy = this.maxEnergy
        this.speed = this.maxSpeed
        this.draw.fillFrom( this.hand )
        this.draw.fillFrom( this.discard )
        //This assigns a units MAXhealth to their card total
        this.maxHealth = this.draw.length
        this.health = this.maxHealth
        this.cardCycle()
        this.done = false
    }

    statCap() {
        //Stat Cut Off
        this.capHealth()
        this.cardCycle()
        this.done = false
    }

    // View

    renderName( pos: Vector, textColor: string = "#c2c2c2", backing: string = "#696969" ) {
        let g = Graphics.instance
        g.c.shadowBlur = 0
        // g.setFont( 3.5, "pixel" )
        g.setFont( 4, "pixel2" )
        let name = this.name
        const maxLength = 8
        if ( name.length > maxLength ) {
            name = name.slice( 0, maxLength - 3 ) + "..."
        }
        g.drawTextBox( pos, name, { textColor: textColor, boxColor: backing, alignY: TextAlignY.bottom } )
    }

    makeSceneNode() {
        let game = Game.instance
        let match = game.match
        let g = Graphics.instance

        let team = this.team
        let active = team == match.activeTeam()
        let { flipUnits } = team
        let selectedUnit = team.selectedUnit()

        let tileSize = Match.tileSize

        Scene.node( {
            description: this.name,
            localMatrix: Matrix.vTranslation( this.pos.scale( tileSize ) ),
            rect: { width: tileSize, height: tileSize },
            onClick: () => {
                if ( game.match.playerTurn() ) {
                    team.toggleSelectUnit( this )
                }
            },
            onRender: ( node ) => {
                let hover = node == game.mouseOverData.node
                let isSelected = this == selectedUnit
                //Selected? Art
                g.c.save()
                if ( active ) {
                    if ( isSelected ) {
                        g.c.scale( 1.3, 1.3 )
                        g.c.translate( -3, -3 )
                    }
                    // if ( isSelected && !this.isWalking() ) {
                    //     g.c.shadowBlur = 10
                    //     g.c.shadowColor = "black"
                    // }
                }
                //Standard rendering
                this.render( true, flipUnits )
                if ( hover )
                    this.drawStats()
                g.c.restore()
            }
        } )
    }

}