import { clamp, randomFloor } from "../math/math"
import { Vector } from "../math/Vector"
import Matrix from "../math/Matrix"
import Input from "../common/Input"
import Graphics, { TextAlignX, TextAlignY } from "../Graphics"
import names from "../common/names"
import { getFrameNumber, getImg } from "../common/utils"
import Card from "./Card"
import Game from "../Game"
import Scene, { SceneNode } from "../Scene"
import World from "./World"
import { Deck } from "./Deck"
import CardTypes, { CardType } from "../CardTypes"

const mechSheet = getImg( require( "../www/images/units/MinigunMech_sheet.png" ) )

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
    
    //Cards
    draw: Deck = new Deck()
    hand: Deck = new Deck()
    discard: Deck = new Deck()
    drawSpeed: number
    
    //visualStats
    color: string
    name: string
    hurtTime: number = 0
    walkAnimStep: number = 0
    walkAnimRate: number = 10 // Tiles per second
    walkAnimPath?: Vector[]

    constructor( pos, teamNumber, sprite: HTMLImageElement = mechSheet ) {
        this.sprite = sprite
        this.name = names[ randomFloor( names.length ) ]
        this.teamNumber = teamNumber
        this.color = "red"

        this.pos = pos
        this.maxSpeed = 5
        this.speed = this.maxSpeed

        this.energy = 3
        this.maxEnergy = 3

        this.health = 10
        this.maxHealth = 10
        
        this.drawSpeed = 4
        this.hand.max = 8

        //default deck
        //2 repair
        this.draw.add( CardTypes.repair, 1 )
        //2 sprint
        this.draw.add( CardTypes.sprint, 1 )
    }

    // Model
    addHealth( amount: number ) {
        this.health += amount
        if ( amount < 0 )
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
    }
    addMaxHealth( amount: number ) {
        this.maxHealth += amount
        if ( amount < 0 )
            this.hurtTime += Math.sqrt( -amount + 1 ) * .2
    }
    capHealth() {
        let { health, maxHealth } = this
        this.health = maxHealth < health ? maxHealth : health
    }
    addSpeed( amount: number ) {
        this.speed += amount
    }
    addEnergy( amount: number ) {
        this.energy += amount
    }
    //Card management
    gainCard( cardType: CardType, count: number = 1 ) {
        for (let i = count; i > 0; i--) {
            if (this.hand.length < this.hand.max) {
                this.hand.add( cardType )
            } else {
                this.discard.add( cardType )
            }
        }
    }
    drawCard( amount: number ) {
        for (let i = amount; i > 0; i--) {
            // console.log("being Called")
            if (this.draw.length > 0) {
                let card = <Card> this.draw.cards.pop()
                // console.log("DrawPile Exists:", card.type.name)
                this.hand.cards.push(card)
            } else {
                this.discard.emptyInto(this.draw)
                if (this.draw.length > 0 ) {
                    let card = <Card> this.draw.cards.pop()
                    // console.log("DrawPile Doesnt Exists:", card.type.name)
                    this.hand.cards.push(card)
                }
            }
        }
    }

    move( path: Vector[] ) {
        this.pos = path[ path.length - 1 ]
        this.walkAnimStep = 0
        this.walkAnimPath = path
    }
    walkPath( path: Vector[] ) {
        if (this.energy > 0) {
            this.move( path )
            this.energy -= 1
        }
    }

    cardCycle() {
        let { draw, hand, discard, drawSpeed } = this
        let totalCards = hand.length + draw.length + discard.length

        //empty hand into discard
        discard.fillFrom(hand)
        //fill hand from draw pile
        hand.fillTill(draw, drawSpeed)

        //empty remaining cards from hand into discardPile
        if (hand.length < drawSpeed) {
            //fill draw pile from discard
            draw.fillFrom(discard)
            //fill hand from draw pile
            hand.fillTill(draw, drawSpeed)
        }
    }

    canMove() { return !this.isWalking() }
    isWalking() { return this.walkAnimPath != undefined }

    statReset() {
        //Stat Reset
        this.energy = this.maxEnergy
        this.speed = this.maxSpeed
        this.capHealth()
        this.cardCycle()
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
    render( animate = true, showName = true ) {
        let g = Graphics.instance
        let nFrames = this.sprite.height / 32
        let frame = animate ? getFrameNumber( 2 * nFrames / 2, nFrames ) : 0
        // let frame = animate ? getFrameNumber( 2, 2 ) : 0

        let isWalking = animate && this.isWalking()
        if ( isWalking ) {
            let path = this.walkAnimPath as Vector[]
            let step = Math.floor( this.walkAnimStep )
            let partialStep = this.walkAnimStep - step
            let v0 = path[ step ]
            let v1 = path[ step + 1 ]
            let animPos = v0.lerp( v1, partialStep )
            let diff = animPos.subtract( this.pos )
            g.vTranslate( diff.scale( World.tileSize ) )
        }

        let doShake = animate && this.hurtTime > 0
        let flip = Game.instance.teams[ this.teamNumber ].flipUnits
        g.c.save()
        if ( doShake )
            g.vTranslate( Vector.lissajous( this.hurtTime, 13, 10, 2, 1, 0, 0 ) )
        if ( flip ) {
            g.c.translate( 32, 0 )
            g.c.scale( -1, 1 )
        }
        g.drawSheetFrame( this.sprite, 32, 0, 0, frame )
        g.c.restore()

        if ( showName && !isWalking ) {
            g.c.shadowBlur = 0
            // g.setFont( 3.5, "pixel" )
            g.setFont( 4, "pixel2" )
            let name = this.name
            const maxLength = 8
            if ( name.length > maxLength )
                name = name.slice( 0, maxLength - 3 ) + "..."
            g.drawTextBox( new Vector( 0, 32 ), name, { textColor: "#c2c2c2", boxColor: "#696969", alignY: TextAlignY.bottom } )
        }
        //Unit Stat Display
        if ( !isWalking ) {
            g.setFont( 4, "impact" )
            let healthText = this.health.toString().padStart( 2, "0" )
            let energyText = this.energy.toString().padStart( 2, "0" )
            let boxDims = g.drawTextBox( Vector.zero, healthText, { textColor: "#e8ac9e", boxColor: "#a84a32" } )
            g.drawTextBox( new Vector( 0, boxDims.y ), energyText, { textColor: "#9cdbad", boxColor: "#2d8745" } )
        }
    }

}