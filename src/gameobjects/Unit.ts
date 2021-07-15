import { randomFloor } from "../math/math"
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

// const baseUnitImg = getImg( require( "../www/images/BaseEnemy.png" ) )
// const baseUnitImg = getImg( require( "../www/images/MinigunMech.png" ) )
const mechSheet = getImg( require( "../../www/images/MinigunMech_sheet.png" ) )

export default class Unit {
    name: string
    pos: Vector
    speed: number
    energy: number
    color: string
    health: number

    hurtTime: number = 0

    draw: Card[] = []
    hand: Card[] = []
    discard: Card[] = []

    walkAnimStep: number = 0
    walkAnimRate: number = 10 // Tiles per second
    walkAnimPath?: Vector[]

    constructor( pos ) {
        this.name = names[ randomFloor( names.length ) ]
        this.pos = pos
        this.speed = 4
        this.energy = 2
        this.color = "red"
        this.health = 10

        for ( let i = 0; i < 4; i++ )
            this.hand.push( new Card() )
        for ( let i = 0; i < 4; i++ )
            this.draw.push( new Card() )
        for ( let i = 0; i < 4; i++ )
            this.discard.push( new Card() )
    }

    addHealth( amount: number ) {
        this.health += amount
        if ( amount < 0 ) {
            console.log( this.hurtTime )
            this.hurtTime += Math.sqrt( -amount + 1 ) * .1
        }
    }

    walk( path: Vector[] ) {
        this.pos = path[ path.length - 1 ]
        this.walkAnimStep = 0
        this.walkAnimPath = path
    }

    isWalking() {
        return this.walkAnimPath != undefined
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
        if ( doShake ) {
            g.c.save()
            let shake = Vector.lissajous( this.hurtTime, 13, 10, 2, 1, 0, 0 )
            g.c.translate( shake.x, shake.y )
        }
        g.drawSheetFrame( mechSheet, 32, 0, 0, frame )
        if ( doShake )
            g.c.restore()

        if ( showName && !isWalking ) {
            g.c.shadowBlur = 0
            g.setFont( 3, "pixel" )
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