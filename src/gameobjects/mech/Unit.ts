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
        let { energyArmor, plating } = CardTypes
        let armorCards = [
            energyArmor,
            plating
        ]
        let reduction = 0
        if ( amount < 0 ) {
            // console.log(this.hand.typeCount(energyArmor))
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
            this.hand.cards.forEach( ( card, index ) => {
                // if (card.type == plating) {
                //     reduction += plating.damage
                //     let store = this.hand.cards.splice( index, 1 )
                //     this.discard.cards.push( store[ 0 ] )
                // }
                if (armorCards.includes(card.type) && reduction < Math.abs(amount)) {
                    reduction += card.type.damage
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
    discardCardAt( index: number ) {
        if (index < this.hand.length) {
            this.discard.insertAtRandom( this.hand.cards.splice( index, 1 )[0] )
        } else {
            console.log("Error: index is out of range in Unit hand")
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

    renderIndex() {
        let selectedUnit = this.team.selectedUnit()
        let isSelected = this == selectedUnit
        return ( this.pos.y << 1 ) | ( isSelected ? 1 : 0 )
    }

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

    // TODO: Remove post merge.
    drawStats() {
        let g = Graphics.instance
        g.c.save()
        g.c.translate( 0, -7 )
        this.drawEnergyPips( new Vector( 3, 4 ) )
        this.drawHealthPips( new Vector( 0.5, 26.5 ) )
        this.drawSpeedPips( new Vector( 0.5, 33 ) )

        //drawing Speed
        // let speed = {
        //     pos: new Vector( 0, 5 )
        // }
        // g.strokeRect( speed.pos, new Vector( 7, 8 ), "rgb(0, 0, 225)" )
        // g.drawRect( speed.pos, new Vector( 7, 8 ), "rgb(50, 50, 255)" )
        // g.setFont( 7, "pixel2" )
        // g.drawText( speed.pos.add( new Vector( 2, 0 ) ), ( this.speed - 1 ).toString(), "rgb(0, 0, 45)" )

        g.c.restore()
    }

    // TODO: Remove post merge.
    drawEnergyPips(pos: Vector) {
        let g = Graphics.instance
        //Energy Stats
        let energy = {
            pip: {
                dim: pos,
                pad: new Vector( 1.5, 0 ),
                filled: () => `rgb(0, ${ Math.random() * 55 + 200 }, 0)`,
                empty: "rgb(0, 100, 0)",
                pit: "rgb(0, 50, 0)",
                temp: "rgb(205, 255, 205)",
            },
            pos: new Vector( 20, 21.5 ),
            dim: new Vector( 11.5, 4 ),
            backingColor: "rgb(30, 125, 30)",
        }
        energy.dim.x = this.energy * energy.pip.dim.x + energy.pip.pad.x * this.energy
        g.drawRect( energy.pos, energy.dim, energy.backingColor )
        //draw Empty Pip Containers for Max Energy
        let mostEnergy = this.energy > this.maxEnergy ? this.energy : this.maxEnergy

        for ( let e = 0; e < mostEnergy; e++ ) {
            let pipPadding = energy.pip.pad.scale( e )
            let pipOffset = new Vector( energy.pip.dim.scale( e ).x, 0 ).add( pipPadding )
            let pipPos = energy.pos.add( new Vector( 0.5, 0 ) ).add( pipOffset )

            if ( e >= this.energy ) {
                // Empty Pips
                g.drawRect( pipPos, energy.pip.dim, energy.pip.pit )
                g.strokeRect( pipPos, energy.pip.dim, energy.pip.empty )
            } else if ( e < this.maxEnergy ) {
                // Filled Pips
                g.strokeRect( pipPos, energy.pip.dim, energy.pip.empty )
                g.drawRect( pipPos, energy.pip.dim, energy.pip.filled() )
            } else {
                // Bonus Pips
                g.strokeRect( pipPos, energy.pip.dim, "yellow" )
                g.drawRect( pipPos, energy.pip.dim, energy.pip.filled() )
            }

        }
    }

    // TODO: Remove post merge.
    drawHealthPips(pos: Vector) {
        let g = Graphics.instance

        //Health Stats
        let health = {
            pos: pos,
            dim: new Vector( 33, 4 ),
            pip: {
                dim: new Vector( 2.5, 4 ),
                pad: new Vector( 1.5, 0 ),
                filled: "rgb(255, 0, 0)",
                empty: "rgb(100, 0, 0)",
                pit: "rgb(75, 0, 0)",
                temp: "rgb(255, 205, 205)",
            },
            backingColor: "rgb(125, 10, 10)"
        }

        health.dim.x = this.maxHealth * health.pip.dim.x + health.pip.pad.x * this.maxHealth
        g.drawRect( health.pos, health.dim, health.backingColor )
        let jiggleCap = 0.4
        let jiggle = new Vector( randomInt( jiggleCap ), randomInt( jiggleCap ) )

        let mostHealth = this.health > this.maxHealth ? this.health : this.maxHealth

        for ( let h = 0; h < mostHealth; h++ ) {
            let pipPadding = health.pip.pad.scale( h )
            let pipOffset = new Vector( health.pip.dim.scale( h ).x, 0 ).add( pipPadding )
            let pipPos = health.pos.add( new Vector( 1, 0 ) ).add( pipOffset )

            if ( h >= this.health ) {
                // Empty Pips
                g.drawRect( pipPos.add( jiggle ), health.pip.dim, health.pip.pit )
                g.strokeRect( pipPos.add( jiggle ), health.pip.dim, health.pip.empty )
            } else if ( h < this.maxHealth ) {
                // Filled Pips
                g.strokeRect( pipPos, health.pip.dim, health.pip.empty )
                g.drawRect( pipPos, health.pip.dim, health.pip.filled )
            } else {
                // Bonus Pips
                let bonusTotal = h - this.maxHealth
                let bonusPipOffset = new Vector( 0, 0 )
                pipPadding = health.pip.pad.scale( bonusTotal ).add( new Vector( 2, 2 ) )
                pipOffset = new Vector( health.pip.dim.scale( bonusTotal ).x, 0 ).add( pipPadding )
                pipPos = health.pos.add( new Vector( 1, 0 ) ).add( pipOffset )
                g.strokeRect( pipPos, health.pip.dim, "yellow" )
                g.drawRect( pipPos, health.pip.dim, health.pip.filled )
            }
            jiggle = new Vector( 0, randomInt( jiggleCap ) )
        }
    }
    
    // TODO: Remove post merge?
    drawSpeedPips(pos: Vector) {
        let g = Graphics.instance

        //Health Stats
        let speed = {
            pos: pos,
            dim: new Vector( 33, 4 ),
            pip: {
                dim: new Vector( 2.5, 4 ),
                pad: new Vector( 1.5, 0 ),
                filled: "rgb(100, 100, 255)",
                empty: "rgb(0, 0, 100)",
                pit: "rgb(0, 0, 75)",
                temp: "rgb(205, 205, 255)",
            },
            backingColor: "rgb(10, 10, 125)"
        }

        speed.dim.x = this.maxSpeed * speed.pip.dim.x + speed.pip.pad.x * this.maxSpeed
        g.drawRect( speed.pos, speed.dim, speed.backingColor )
        let jiggleCap = 0.4
        let jiggle = new Vector( randomInt( jiggleCap ), randomInt( jiggleCap ) )

        let mostSpeed = this.speed > this.maxSpeed ? this.speed : this.maxSpeed

        for ( let h = 0; h < mostSpeed; h++ ) {
            let pipPadding = speed.pip.pad.scale( h )
            let pipOffset = new Vector( speed.pip.dim.scale( h ).x, 0 ).add( pipPadding )
            let pipPos = speed.pos.add( new Vector( 1, 0 ) ).add( pipOffset )

            if ( h >= this.speed ) {
                // Empty Pips
                g.drawRect( pipPos.add( jiggle ), speed.pip.dim, speed.pip.pit )
                g.strokeRect( pipPos.add( jiggle ), speed.pip.dim, speed.pip.empty )
            } else if ( h < this.maxSpeed ) {
                // Filled Pips
                g.strokeRect( pipPos, speed.pip.dim, speed.pip.empty )
                g.drawRect( pipPos, speed.pip.dim, speed.pip.filled )
            } else {
                // Bonus Pips
                let bonusTotal = h - this.maxSpeed
                let bonusPipOffset = new Vector( 0, 0 )
                pipPadding = speed.pip.pad.scale( bonusTotal ).add( new Vector( 2, 2 ) )
                pipOffset = new Vector( speed.pip.dim.scale( bonusTotal ).x, 0 ).add( pipPadding )
                pipPos = speed.pos.add( new Vector( 1, 0 ) ).add( pipOffset )
                g.strokeRect( pipPos, speed.pip.dim, "white" )
                g.drawRect( pipPos, speed.pip.dim, speed.pip.filled )
            }
            jiggle = new Vector( randomInt( jiggleCap ), 0 )
        }
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
                this.render( true, flipUnits, team.color )
                // if ( hover )
                this.drawStats()
                g.c.restore()
            }
        } )
    }

}