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

const mechSheet = getImg( require( "../www/images/units/MinigunMech_sheet.png" ) )

export default class Unit {
    sprite: HTMLImageElement

    name: string
    teamNumber: number
    pos: Vector
    speed: number
    maxSpeed: number
    energy: number
    maxEnergy: number
    color: string
    health: number
    maxHealth: number

    hurtTime: number = 0

    draw: Deck = new Deck(3)
    hand: Deck = new Deck(4)
    discard: Deck = new Deck(3)

    walkAnimStep: number = 0
    walkAnimRate: number = 10 // Tiles per second
    walkAnimPath?: Vector[]

    hasMovedThisTurn: boolean = false

    constructor( pos, teamNumber, sprite: HTMLImageElement = mechSheet ) {
        this.sprite = sprite
        this.name = names[ randomFloor( names.length ) ]
        this.teamNumber = teamNumber
        this.pos = pos
        this.maxSpeed = 6
        this.speed = this.maxSpeed
        this.energy = 3
        this.maxEnergy = 3
        this.color = "red"
        this.health = 10
        this.maxHealth = 10
        this.hand.max = 4
    }

    // Model
    addHealth( amount: number ) {
        //REWORK THIS TO DEFAULT TO CURRENT VALUE RATHER THAN RESETTING TO MAXHEALTH When Exceeding 
        this.health += amount
        this.health = clamp( 0, this.maxHealth, this.health )
        if ( amount < 0 )
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
    }
    addMaxHealth( amount: number ) {
        this.maxHealth += amount
        if ( amount < 0 )
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
    }
    addSpeed( amount: number ) {
        this.speed += amount
    }
    addEnergy( amount: number ) {
        this.energy += amount
    }

    move( path: Vector[] ) {
        if ( this.hasMovedThisTurn )
            throw new Error( "Should not be trying to move when a unit has already moved this turn." )
        this.hasMovedThisTurn = true
        this.pos = path[ path.length - 1 ]
        this.walkAnimStep = 0
        this.walkAnimPath = path
    }

    cardCycle() {
        let { draw, hand, discard } = this
        //empty hand
        hand.fill( discard )
        //fill hand
        draw.fill(hand)

        //extra shuffle and draw if the drawpile was a bit low
        if ( hand.length < hand.max ) {
            //empty discard into draw
            discard.fill(draw)
            draw.fill(hand)
        }
    }

    canMove() { return !this.isWalking() && !this.hasMovedThisTurn }
    isWalking() { return this.walkAnimPath != undefined }

    onEndTurn() {
        //Stat Reset
        this.hasMovedThisTurn = false
        this.energy = this.maxEnergy
        this.speed = this.maxSpeed
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
        let frame = animate ? getFrameNumber( 2, 2 ) : 0

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

        if ( !isWalking ) {
            g.setFont( 4, "impact" )
            let healthText = this.health.toString().padStart( 2, "0" )
            let energyText = this.energy.toString().padStart( 2, "0" )
            let boxDims = g.drawTextBox( Vector.zero, healthText, { textColor: "#e8ac9e", boxColor: "#a84a32" } )
            g.drawTextBox( new Vector( boxDims.x, 0 ), energyText, { textColor: "#9cdbad", boxColor: "#2d8745" } )
        }
    }

}