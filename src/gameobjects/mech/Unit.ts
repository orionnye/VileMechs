import { clamp, randomFloor } from "../../math/math"
import { Vector } from "../../math/Vector"
import Matrix from "../../math/Matrix"
import Input from "../../common/Input"
import Graphics, { TextAlignX, TextAlignY } from "../../common/Graphics"
import names from "../../common/names"
import { getFrameNumber, getImg } from "../../common/utils"
// import Card from "./Card"
import Game from "../../Game"
import Scene, { SceneNode } from "../../common/Scene"
import World from "../../map/World"
// import { Deck } from "./Deck"
import CardTypes, { CardType } from "../card/CardTypes"
import { Deck } from "../card/Deck"
import Card from "../card/Card"

const mechSheet = getImg( require( "../../www/images/units/MinigunMech_sheet.png" ) )

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

        //default deck
        // this.draw.add( CardTypes.repair, 1 )
        // this.draw.add( CardTypes.sprint, 1 )
    }

    // Model
    addHealth( amount: number ) {
        let { energyArmor } = CardTypes
        let reduction = 0
        if (amount < 0) {
            // console.log(this.hand.typeCount(energyArmor))
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
            this.hand.cards.forEach( (card, index) => {
                if (card.type == energyArmor && reduction < Math.abs(amount)) {
                    reduction += energyArmor.damage
                    let store = this.hand.cards.splice(index, 1)
                    this.discard.cards.push(store[0])
                }
            })
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
    discardCard( amount: number = 1 ) {
        for (let i = amount; i > 0; i--) {
            // console.log("being Called")
            if (this.hand.length > 0) {
                let card = <Card> this.hand.cards.pop()
                // console.log("DrawPile Exists:", card.type.name)
                this.discard.cards.push(card)
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
        this.draw.fillFrom(this.hand)
        this.draw.fillFrom(this.discard)
        //This assigns a units MAXhealth to their card total
        // this.maxHealth = this.draw.length
        this.health = this.maxHealth
        this.cardCycle()
        this.done = false
    }
    statCap() {
        //Stat Cut Off
        this.energy = this.maxEnergy
        // this.speed = this.maxSpeed
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
            g.vTranslate( diff.scale( World.tileSize ) )
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
    renderName(pos: Vector, textColor: string = "#c2c2c2", backing: string = "#696969") {
        let g = Graphics.instance
        g.c.shadowBlur = 0
        // g.setFont( 3.5, "pixel" )
        g.setFont( 4, "pixel2" )
        let name = this.name
        const maxLength = 8
        if ( name.length > maxLength )
            name = name.slice( 0, maxLength - 3 ) + "..."
        g.drawTextBox( pos, name, { textColor: textColor, boxColor: backing, alignY: TextAlignY.bottom } )
    }

}