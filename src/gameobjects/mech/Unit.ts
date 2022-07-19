import { clamp, randomFloor, randomInt } from "../../math/math"
import { Vector } from "../../math/Vector"
import Matrix from "../../math/Matrix"
import Input from "../../common/Input"
import Graphics, { TextAlignX, TextAlignY } from "../../common/Graphics"
import names from "../../common/names"
import { getFrameNumber, getImg } from "../../common/utils"
import Game from "../../Game"
import Scene, { SceneNode } from "../../common/Scene"
import Match from "../../stages/Match"
import CardTypes, { CardType } from "../card/CardTypes"
import { Deck } from "../card/Deck"
import Card from "../card/Card"

const mechSheet = getImg( require( "../../www/images/units/ChromeMech2.png" ) )

export default class Unit {
    //assets
    sprite: HTMLImageElement

    //stats
    speed: number
    maxSpeed: number
    energy: number
    maxEnergy: number
    health: number
    maxHealth: number
    pos: Vector

    //team
    teamNumber: number
    done: boolean

    //Cards
    draw: Deck = new Deck()
    hand: Deck = new Deck()
    discard: Deck = new Deck()
    drawSpeed: number

    //visualStats
    color: string
    name: string
    hurtTime: number = 0
    //walking animation
    walkAnimStep: number = 0
    walkAnimRate: number = 10 // Tiles per second
    walkAnimPath?: Vector[]

    constructor( pos, teamNumber = 0, sprite: HTMLImageElement = mechSheet ) {
        this.sprite = sprite
        this.name = names[ randomFloor( names.length ) ]
        this.teamNumber = teamNumber
        this.color = "red"
        this.done = false

        this.pos = pos
        this.maxSpeed = 5
        this.speed = this.maxSpeed

        this.maxEnergy = 2
        this.energy = this.maxEnergy

        this.maxHealth = 8
        this.health = this.maxHealth

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
        // console.log( "Reduction:", reduction )
        this.health += amount + reduction
    }

    addMaxHealth( amount: number ) {
        this.maxHealth += amount
        if ( amount < 0 )
            this.hurtTime += Math.sqrt( -amount + 1 ) * .2
    }

    addSpeed( amount: number ) {
        this.speed += amount
    }

    addEnergy( amount: number ) {
        this.energy += amount
    }

    capHealth() {
        let { health, maxHealth } = this
        this.health = maxHealth < health ? maxHealth : health
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

    move( path: Vector[] ) {
        this.pos = path[ path.length - 1 ]
        this.walkAnimStep = 0
        this.walkAnimPath = path
    }

    walkPath( path: Vector[] ) {
        if ( this.energy > 0 && this.speed > 1 ) {
            this.move( path )
            this.energy -= 1
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

    canMove() { return !this.isWalking() }
    isWalking() { return this.walkAnimPath != undefined }

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

    update() {
        let dtSeconds = Game.instance.clock.dt / 1000
        this.hurtTime = Math.max( 0, this.hurtTime - dtSeconds )
        let path = this.walkAnimPath
        if ( path ) {
            this.walkAnimStep += dtSeconds * this.walkAnimRate
            if ( this.walkAnimStep + 1 >= path.length )
                this.walkAnimPath = undefined
        }
    }

    // View
    render( animate = true, flip: boolean = false ) {
        let g = Graphics.instance
        let nFrames = this.sprite.height / 32
        let frame = animate ? getFrameNumber( 2 * nFrames / 2, nFrames ) : 0
        // let frame = animate ? getFrameNumber( 2, 2 ) : 0

        //walking animation
        let isWalking = animate && this.isWalking()
        if ( isWalking ) {
            let path = this.walkAnimPath as Vector[]
            let step = Math.floor( this.walkAnimStep )
            let partialStep = this.walkAnimStep - step
            let v0 = path[ step ]
            let v1 = path[ step + 1 ]
            let animPos = v0.lerp( v1, partialStep )
            let diff = animPos.subtract( this.pos )
            g.vTranslate( diff.scale( Match.tileSize ) )
        }
        let doShake = animate && this.hurtTime > 0
        g.c.save()
        if ( doShake )
            g.vTranslate( Vector.lissajous( this.hurtTime, 13, 10, 2, 1, 0, 0 ) )
        if ( flip ) {
            g.c.translate( 32, 0 )
            g.c.scale( -1, 1 )
        }
        g.drawSheetFrame( this.sprite, 32, 0, 0, frame )
        g.c.restore()
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

    drawStats() {
        let g = Graphics.instance
        g.c.save()
        g.c.translate( 0, -3 )
        this.drawEnergy()
        this.drawHealth()

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

    drawEnergy() {
        let g = Graphics.instance
        //Energy Stats
        let energy = {
            pip: {
                dim: new Vector( 3, 4 ),
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

    drawHealth() {
        let g = Graphics.instance

        //Health Stats
        let health = {
            pos: new Vector( 0.5, 26.5 ),
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
            jiggle = new Vector( randomInt( jiggleCap ), randomInt( jiggleCap ) )
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
                        g.drawRect( new Vector( 0, 0 ), new Vector( tileSize, tileSize ), "rgba(255, 255, 255, 0.4)" )
                    }

                    if ( isSelected && !this.isWalking() ) {
                        g.c.shadowBlur = 10
                        g.c.shadowColor = "black"
                    }
                }
                if ( flipUnits ) {
                    g.drawRect( new Vector( 0, 0 ), new Vector( tileSize, tileSize ), "#00000055" )
                } else {
                    g.drawRect( new Vector( 0, 0 ), new Vector( tileSize, tileSize ), "#ffffff77" )
                }
                //Standard rendering
                this.render( true, flipUnits )
                g.c.restore()
                if ( hover ) {
                    // g.drawRect(new Vector(0, 0), new Vector(100, 100), "red")
                    this.drawStats()
                }
            }
        } )
    }

}