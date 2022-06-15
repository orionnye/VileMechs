import { lerp, randomFloor, randomInt } from "../../math/math"
import { Vector } from "../../math/Vector"
import Matrix from "../../math/Matrix"
import Graphics, { TextAlignY } from "../../common/Graphics"
import names from "../../common/names"
import { getFrameNumber, getImg } from "../../common/utils"
import Game from "../../Game"
import Scene from "../../common/Scene"
import Match from "../../stages/Match"
import Clock from "../../common/Clock"

const mechSheet = getImg( require( "../../www/images/units/ChromeMech2.png" ) )

export default class Entity {
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

    //visualStats
    color: string
    hurtTime: number = 0
    //walking animation
    walkAnimStep: number = 0
    walkAnimRate: number = 10 // Tiles per second
    walkAnimPath?: Vector[]

    constructor( pos, sprite: HTMLImageElement = mechSheet ) {
        this.sprite = sprite
        this.color = "red"

        this.pos = pos
        this.maxSpeed = 5
        this.speed = this.maxSpeed

        this.maxEnergy = 2
        this.energy = this.maxEnergy

        this.maxHealth = 8
        this.health = this.maxHealth
    }

    // Model
    addHealth( amount: number ) {
        this.health += amount
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

    canMove() { return !this.isWalking() }
    isWalking() { return this.walkAnimPath != undefined }

    statReset() {
        //Stat Reset
        this.energy = this.maxEnergy
        this.speed = this.maxSpeed
        //This assigns a units MAXhealth to their card total
        this.health = this.maxHealth
    }

    statCap() {
        this.capHealth()
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
    render( animate = true, flip: boolean = false, outlineColor?: string, outlineSize?: number ) {
        let g = Graphics.instance
        let nFrames = this.sprite.height / 32
        let frame = animate ? getFrameNumber( nFrames, nFrames ) : 0
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

        if ( outlineColor ) {
            let s = outlineSize ?? 1
            // Carve out space for outline
            g.c.globalCompositeOperation = "destination-out"
            for ( let offset of Vector.cardinalDirections ) {
                g.vTranslate( offset.scale( s ) )
                g.drawSheetFrame( this.sprite, 32, 0, 0, frame )
                g.vTranslate( offset.scale( -s ) )
            }
            // Color outline
            g.c.globalCompositeOperation = "destination-over"
            g.c.fillStyle = outlineColor
            let t = performance.now()
            let alpha = ( Math.cos( t / 300 ) + 1 ) * .5
            g.c.globalAlpha = lerp( 0.7, 1, alpha )
            g.c.fillRect( -s, -s, 32 + 2 * s, 32 + 2 * s )
            g.c.globalCompositeOperation = "source-over"
        }
        g.drawSheetFrame( this.sprite, 32, 0, 0, frame )
        g.c.globalAlpha = 1

        g.c.restore()
    }

    renderIndex() {
        return this.pos.y
    }

    drawStats() {
        let g = Graphics.instance
        g.c.save()
        g.c.translate( 0, -3 )
        this.drawEnergy()
        this.drawHealth()

        //drawing Speed
        let speed = {
            pos: new Vector( 0, 5 )
        }
        g.strokeRect( speed.pos, new Vector( 7, 8 ), "rgb(0, 0, 225)" )
        g.drawRect( speed.pos, new Vector( 7, 8 ), "rgb(50, 50, 255)" )
        g.setFont( 7, "pixel2" )
        g.drawText( speed.pos.add( new Vector( 2, 0 ) ), ( this.speed - 1 ).toString(), "rgb(0, 0, 45)" )

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
        let tileSize = Match.tileSize
        Scene.node( {
            description: "entity",
            localMatrix: Matrix.vTranslation( this.pos.scale( tileSize ) ),
            rect: { width: tileSize, height: tileSize },
            onRender: ( node ) => {
                let hover = node == game.mouseOverData.node
                this.render( true, false )
                if ( hover )
                    this.drawStats()
            }
        } )
    }
}