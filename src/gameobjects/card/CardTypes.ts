import { getImg } from "../../common/utils"
import Game from "../../Game"
import Unit from "../mech/Unit"
import Match from "../../stages/Match"
import { Vector } from "../../math/Vector"
import { findPath } from "../map/pathfinding"
import * as Tiles from "../map/Tiles"
import Card from "./Card"
import Graphics from "../../common/Graphics"
import { randomFloor } from "../../math/math"
//I have no idea why this requires one period but it does
//Ores
const ore = getImg( require( "../../www/images/cards/ore/pustule.png" ) )

//Action Icons
const blank = getImg( require( "../../www/images/cards/backing/card.png" ) )

const laser = getImg( require( "../../www/images/cards/icon/laser.png" ) )
const energyArmor = getImg( require( "../../www/images/cards/icon/energyArmor.png" ) )
const shieldCharge = getImg( require( "../../www/images/cards/icon/shieldCharge.png" ) )
const energyFist = getImg( require( "../../www/images/cards/icon/energyFist.png" ) )
const barrier = getImg( require( "../../www/images/cards/icon/dead/barrier.png" ) )
// const chargeBeam = getImg( require( "../../www/images/cards/icon/chargeBeam.png" ) )

const boulder = getImg( require( "../../www/images/cards/icon/boulder.png" ) )
const mine = getImg( require( "../../www/images/cards/icon/mine.png" ) )
const gorge = getImg( require( "../../www/images/cards/icon/gorge.png" ) )
const blastCharge = getImg( require( "../../www/images/cards/icon/blastCharge.png" ) )
const dynamite = getImg( require( "../../www/images/cards/icon/dynamite.png" ) )
const plating = getImg( require( "../../www/images/cards/icon/dead/plating.png" ) )

const claw = getImg( require( "../../www/images/cards/icon/claw.png" ) )
const frendzi = getImg( require( "../../www/images/cards/icon/frendzi.png" ) )
const leap = getImg( require( "../../www/images/cards/icon/leap.png" ) )
const lump = getImg( require( "../../www/images/cards/icon/lump.png" ) )
const chomp = getImg( require( "../../www/images/cards/icon/chomp.png" ) )
const acid = getImg( require( "../../www/images/cards/icon/acid.png" ) )
const bloodClot = getImg( require( "../../www/images/cards/icon/dead/bloodClot.png" ) )

const sprint = getImg( require( "../../www/images/cards/icon/sprint.png" ) )
const repair = getImg( require( "../../www/images/cards/icon/repair.png" ) )
const grapplingHook = getImg( require( "../../www/images/cards/icon/grapplingHook.png" ) )
const rifle = getImg( require( "../../www/images/cards/icon/gun.png" ) )

const pollen = getImg( require( "../../www/images/cards/icon/pollen.png" ) )
const fruit = getImg( require( "../../www/images/cards/icon/fruit.png" ) )
const root = getImg( require( "../../www/images/cards/icon/root.png" ) )
const flower = getImg( require( "../../www/images/cards/icon/flower.png" ) )
const bark = getImg( require( "../../www/images/cards/icon/dead/bark.png" ) )
const fungus = getImg( require( "../../www/images/cards/icon/fungus.png" ) )
const boomShroom = getImg( require( "../../www/images/cards/icon/boomShroom.png" ) )
const worms = getImg( require( "../../www/images/cards/icon/worms.png" ) )


const jelly = getImg( require( "../../www/images/cards/icon/jelly.png" ) )
const tentacle = getImg( require( "../../www/images/cards/icon/tentacle.png" ) )
const warp = getImg( require( "../../www/images/cards/icon/warp.png" ) )
const frost = getImg( require( "../../www/images/cards/icon/frost.png" ) )


//Card Background
const flesh = getImg( require( "../../www/images/cards/backing/flesh.png" ) )
const black = getImg( require( "../../www/images/cards/backing/BlackCardBase.png" ) )
const brown = getImg( require( "../../www/images/cards/backing/BrownCardBase.png" ) )
const green = getImg( require( "../../www/images/cards/backing/jungle.png" ) )
// const green = getImg( require( "../../www/images/cards/backing/GreenCardBase.png" ) )
const metal = getImg( require( "../../www/images/cards/backing/metal.png" ) )
const purple = getImg( require( "../../www/images/cards/backing/purple.png" ) )

//ANIMATION RENDER Access
const hill = getImg( require( "../../www/images/tiles/flat/hill5.png" ) )
const grass = getImg( require( "../../www/images/tiles/flat/grass.png" ) )

export type CardType = {
    name: string
    getDescription: ( card: Card ) => string
    color: string
    sprite: HTMLImageElement
    backing: HTMLImageElement
    canApplyToEmptyTiles: boolean
    getTilesInRange: ( card: Card, user: Unit ) => Vector[]

    onApplyToTile?: ( card: Card, user: Unit, pos: Vector, target?: Unit ) => void
    getTilesEffected?: ( user: Unit, pos: Vector ) => Vector[]

    render?: ( animationFrame: number, user: Unit, pos: Vector ) => void
    renderFrames?: number,

    damage: number,
    dim?: Vector,
    range: number,
    minDist: number,
    friendly: boolean,
    exhaustive?: true

    [ index: string ]: any
}

const CardTypes: { [ name: string ]: CardType } = {
    //------------------------------------------------------- CHROME -------------------------------------------------
    laser: {
        name: "Laser",
        getDescription: card => `Deal ${ card.type.damage } damage, Take 1 damage`,
        color: "#969696",
        sprite: laser,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range } ),
        onApplyToTile: ( card, user, pos, target ) => {
            target?.addHealth( -card.type.damage )
            user.addHealth( -1 )

        },

        render: ( animationFrame, user, pos ) => {
            let g = Graphics.instance
            let game = Game.instance
            let match = game.match
            let tileSize = 32
            let target = match.getUnit( pos )
            if ( target ) {
                let userPos = user.pos.scale( tileSize ).add( new Vector( tileSize / 2, tileSize / 2 ) )
                let targetPos = target.pos.scale( tileSize ).add( new Vector( tileSize / 2, tileSize / 2 ) )

                g.c.strokeStyle = "rgba(255, 0, 0, 1)"
                g.c.lineWidth = Math.cos( animationFrame ) * 20
                g.c.beginPath()
                g.c.moveTo( userPos.x, userPos.y )
                g.c.lineTo( targetPos?.x, targetPos?.y )
                g.c.stroke()
                // console.log("using animation")
            }
        },
        renderFrames: 10,

        cost: 1,
        damage: 6,
        range: 8,
        minDist: 2,
        friendly: false
    },
    energyArmor: {
        name: "Energy Armor",
        getDescription: card => `Block ${ card.type.damage } damage while in hand, -Draw 1 card, -Exhaustive`,
        color: "#6BB5FF",
        sprite: energyArmor,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.drawCard( 1 )
        },

        cost: 0,
        damage: 2,
        range: 0,
        minDist: 0,
        friendly: true,
        exhaustive: true
    },
    shieldCharge: {
        name: "Shield Charge",
        getDescription: card => `Generate ${ card.type.damage } Energy Armor`,
        color: "#6BB5FF",
        sprite: shieldCharge,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.gainCard( CardTypes.energyArmor, card.type.damage )
        },

        cost: 1,
        damage: 2,
        range: 0,
        minDist: 0,
        friendly: true
    },
    coreCharge: {
        name: "Core Charge",
        getDescription: card => `Gain ${ card.type.count } Fuel Card`,
        color: "#6BB5FF",
        sprite: shieldCharge,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.draw.add( CardTypes.fuel, card.type.count )
            // user.gainCard( CardTypes.fuel, card.type.count )
        },

        cost: 1,
        damage: 0,
        range: 0,
        minDist: 0,
        friendly: true,
        count: 1
    },
    energyFist: {
        name: "Energy Fist",
        getDescription: card => `Deal ${card.type.damage} damage, knockback target ${card.type.minDist} tiles`,
        color: "#6BB5FF",
        sprite: energyFist,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range }),
        onApplyToTile: ( card, user, pos, target ) => {
            let match = Game.instance.match
            target?.addHealth(-card.type.damage)
            //use targetalongline
            if (target) {
                let backboard = targetsAlongLine(
                    target.pos,
                    pos.subtract(user.pos).unit(),
                    { range: card.type.minDist, ignoreObstacles: false }
                )
                let lastTile = backboard.pop()
                if (lastTile && match.map.contains(lastTile)) {
                    target.pos = lastTile
                }
            }
        },

        cost: 1,
        damage: 6,
        range: 1,
        minDist: 3,
        friendly: false
    },
    barrier: {
        name: "Phase Shift",
        getDescription: card => `Move ${card.type.range} in any direction, Ignores obstacles`,
        color: "#6BB5FF",
        sprite: barrier,
        backing: metal,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range, ignoreObstacles: true }),
        onApplyToTile(card, user, pos, target?) {
            user.pos = pos
        },

        cost: 0,
        damage: 0,
        range: 1,
        minDist: 1,
        friendly: false,
        mobile: true
    },
    //------------------------------------------------------- EARTH -----------------------------------------------------
    bouldertoss: {
        name: "Boulder Toss",
        getDescription: card => `Deal ${ card.type.damage } damage, -Creates Mountain`,
        color: "#b87420",
        sprite: boulder,
        backing: brown,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            // console.log(pos)
            let match = Game.instance.match
            match.map.set( pos, Tiles.GrassHill )
            target?.addHealth( -card.type.damage )
        },

        render: ( animationFrame, user, pos ) => {
            // animationFrame = 2 * Math.sin(animationFrame * Math.PI / 2) - 1;
            let g = Graphics.instance
            let game = Game.instance
            let match = game.match
            let tileSize = 32
            let halfTile = new Vector( tileSize / 2, tileSize / 2 )

            //THE BIG LIE
            //rendering an empty tile even though its actually already a mountain
            let endTile = pos.scale( tileSize )
            g.drawSheetFrame( grass, 32, endTile.x, endTile.y, 0 )
            let heightBump = new Vector( 0, -20 )
            let midPos = user.pos.lerp( pos, animationFrame ).scale( tileSize ).add( heightBump )
            let yCurve = new Vector( 0, -Math.sin( animationFrame * Math.PI ) * 20 )
            for ( let i = 0; i < 5; i++ ) {
                let noiseVector = new Vector( Math.sin( i ) * 8, Math.cos( i ) * 8 )
                let spot = midPos.add( noiseVector ).add( yCurve ).add( halfTile )
                g.fillCircle( spot, 10, `rgba(${ i * 15 }, 0, 0, 1)` )
            }
        },
        renderFrames: 25,

        cost: 1,
        damage: 3,
        range: 5,
        minDist: 2,

        friendly: false,

    },
    plateShift: {
        name: "Plate Shift",
        getDescription: card => `Drop ${ card.type.dim!.x }x${ card.type.dim!.y } Mountains`,
        color: "#b87420",
        sprite: gorge,
        backing: brown,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range }),
        onApplyToTile: ( card, user, pos, target ) => {
            let match = Game.instance.match
            match.map.set( pos, Tiles.GrassHill )
        },
        getTilesEffected( user, pos ) {
            let match = Game.instance.match
            let tilesEffected: Vector[] = [ pos ]
            let dim = this.dim!
            //get relative direction from user
            for ( let x = 0; x < dim.x; x++ ) {
                for ( let y = 0; y < dim.y; y++ ) {
                    let tile = pos.add( new Vector( x - 1, y - 1 ) )
                    if ( !tile.equals( pos ) ) {
                        tilesEffected.push( tile )
                    }
                }
            }
            return tilesEffected
        },

        cost: 1,
        damage: 0,
        dim: new Vector( 3, 3 ),
        range: 3,
        minDist: 3,
        friendly: false,

    },
    mine: {
        name: "Mine",
        getDescription: card => `Deal ${ card.type.damage } damage, Gain 1 FUEL, -Clears Mountains`,
        color: "#b87420",
        sprite: mine,
        backing: brown,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => rookStyleTargets(
            user.pos, { range: card.type.range, ignoreObstacles: true, ignoreElevation: true }
        ),
        onApplyToTile: ( card, user, pos, target ) => {
            // console.log(pos)
            let match = Game.instance.match
            // console.log(match.map.get(pos))
            if ( match.map.get( pos ) == Tiles.GrassHill ) {
                match.map.set( pos, Tiles.Grass )
                // for ( let i = 0; i < 1; i++ ) {
                let card = new Card()
                card.type = CardTypes.fuel
                user.draw.cards.push( card )
                // }
            }
            target?.addHealth( -card.type.damage )

        },

        cost: 1,
        damage: 6,
        range: 1,
        minDist: 1,
        friendly: false,

    },
    fuel: {
        name: "Fuel",
        getDescription: card => `Gain ${ card.type.damage } energy, -Exhaustive`,
        color: "#aaaaaa",
        sprite: ore,
        backing: brown,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            //Exhaustive
            //look for the card in the users Discard Pile and remove it
            target?.addEnergy( card.type.damage )
            user?.addEnergy( -card.type.cost )
            user.discard.cards.pop()
        },

        cost: 0,
        damage: 1,
        range: 1,
        minDist: 0,
        friendly: true,
        exhaustive: true
    },
    gorge: {
        name: "Gorge",
        getDescription: card => `Charge through a line of Mountains, Deal ${card.type.damage} damage`,
        color: "#b87420",
        sprite: blastCharge,
        backing: brown,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, {
            range: card.type.range,
            ignoreObstacles: false,
            ignoreElevation: false,
            passable: ( match, pos ) =>  {
                let elevation = match.map.getElevation( pos )
                // console.log(elevation)
                return !(elevation < 0)
            }
        } ),
        getTilesEffected( user, pos ) {
            let match = Game.instance.match
            let tilesEffected: Vector[] = [ pos ]
            let dim = this.dim!
            //get relative direction from user
            let direction = user.pos.subtract( pos )
            for ( let i = 0; i < direction.length; i++ ) {
                let step = direction.unit()
                let tile = user.pos.subtract( step.scale( i ) )
                tile = new Vector( Math.round( tile.x ), Math.round( tile.y ) )
                if ( !tile.equals( user.pos ) && match.map.contains( tile ) ) {
                    tilesEffected.push( tile )
                }
            }
            return tilesEffected
        },
        onApplyToTile: ( card, user, pos, target ) => {
            // console.log(pos)
            let match = Game.instance.match
            // console.log(match.map.get(pos))
            if ( match.map.get( pos ) == Tiles.GrassHill ) {
                match.map.set( pos, Tiles.Grass )
            }
            if ( target ) {
                if ( target !== user ) {
                    target?.addHealth( -card.type.damage )
                }
            }
            user.pos = pos
        },
        cost: 1,
        damage: 3,
        range: 5,
        minDist: 1,
        friendly: false
    },
    dynamite: {
        name: "Dynamite",
        getDescription: card => `Deal ${card.type.damage} damage, in a ${card.type.dim?.x}x${card.type.dim?.y} area -Clears Mountains`,
        color: "#b87420",
        sprite: dynamite,
        backing: brown,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            let match = Game.instance.match
            if (match.map.getElevation(pos) == 1) {
                match.map.set( pos, Tiles.Grass )
            }
            if ( target ) {
                target?.addHealth( -card.type.damage )
            }
        },
        getTilesEffected( user, pos ) {
            let match = Game.instance.match
            let tilesEffected: Vector[] = [ pos ]
            let dim = this.dim!
            //get relative direction from user
            for ( let x = 0; x < dim.x; x++ ) {
                for ( let y = 0; y < dim.y; y++ ) {
                    let tile = pos.add( new Vector( x - 1, y - 1 ) )
                    if ( !tile.equals( pos ) ) {
                        tilesEffected.push( tile )
                    }
                }
            }
            return tilesEffected
        },

        cost: 1,
        damage: 3,
        dim: new Vector( 3, 3 ),
        range: 5,
        minDist: 2,
        friendly: false
    },

    plating: {
        name: "Plating",
        getDescription: card => `Reduce inbound damage by ${card.type.damage}`,
        color: "#b87420",
        sprite: plating,
        backing: brown,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),

        damage: 1,
        range: 0,
        minDist: 1,
        friendly: false
    },
    exhaustPorts: {
        name: "Exhaust Ports",
        getDescription: card => `draw ${card.type.drawCount}`,
        color: "#b87420",
        sprite: plating,
        backing: brown,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile(card, user, pos, target?) {
            user.drawCard(card.type.drawCount)
        },
        healthCost: 2,
        
        drawCount: 2,
        
        damage: 1,
        range: 0,
        minDist: 0,
        friendly: false
    },

    //------------------------------------------------------- FLESH ---------------------------------------------
    claw: {
        name: "Claw",
        getDescription: card => `Deal ${ card.type.damage } damage, -Exhaustive`,
        color: "#af0000",
        sprite: claw,
        backing: flesh,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {

            if ( target ) {
                // let bonusDMG = user.maxHealth - user.health
                // card.type.damage = bonusDMG + 1
                target.addHealth( -card.type.damage )
            }
        },

        cost: 0,
        damage: 3,
        range: 1,
        minDist: 1,
        friendly: false,
        exhaustive: true
    },
    frenzy: {
        name: "Frenzy",
        getDescription: card => `-Generate ${card.type.damage} Claw, -Draw ${card.type.drawCount} cards`,
        color: "#af0000",
        sprite: frendzi,
        backing: flesh,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            for ( let i = 0; i < card.type.damage; i++ ) {
                let card = new Card()
                card.type = CardTypes.claw
                user.draw.insertAtRandom( card )
            }
            user.drawCard(2)
        },

        cost: 1,
        drawCount: 2,

        damage: 2,
        range: 0,
        minDist: 0,
        friendly: true

    },
    leap: {
        name: "Leap",
        getDescription: card => `Leap to a tile within range, -Ignore Obstacles`,
        color: "#af0000",
        sprite: leap,
        backing: flesh,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            if (Game.instance.match.map.contains(pos)) {
                user.pos = pos
            }
        },

        cost: 1,
        damage: 0,
        range: 7,
        minDist: 5,
        friendly: false

    },
    lump: {
        name: "Lump",
        getDescription: card => `Gain ${card.type.damage} HP,     Draw ${card.type.drawCount} Card, -Exhaustive`,
        color: "#af0000",
        sprite: lump,
        backing: flesh,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.addHealth( card.type.damage )
            user.drawCard( card.type.drawCount )
        },

        cost: 0,
        damage: 4,
        maxHp: 5,
        energy: 1,
        drawCount: 1,

        range: 0,
        minDist: 0,
        friendly: false,
        exhaustive: true
    },
    sentience: {
        name: "Sentience",
        getDescription: card => `Draw ${card.type.drawCount} Cards`,
        color: "#af0000",
        sprite: bloodClot,
        backing: flesh,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.drawCard( card.type.drawCount )
        },
        healthCost: 3,

        damage: 4,
        drawCount: 3,

        range: 0,
        minDist: 0,
        friendly: false
    },
    chomp: {
        name: "Chomp",
        getDescription: card => `Deal ${card.type.damage} damage,
         -Gain ${card.type.maxHp} MaxHP`,
        color: "#af0000",
        sprite: chomp,
        backing: flesh,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range } ),
        onApplyToTile: ( card, user, pos, target ) => {
            if ( target ) {
                // for ( let i = 0; i < card.type.drawCount; i++ ) {
                //     let card = new Card()
                //     card.type = CardTypes.lump
                //     user.draw.cards.push( card )
                // }
                user.addMaxHealth( card.type.maxHp )

                target.addHealth( -card.type.damage )
            }
        },

        cost: 1,
        damage: 4,
        drawCount: 1,
        maxHp: 1,

        range: 2,
        minDist: 0,
        friendly: false

    },
    acid: {
        name: "Acid Spit",
        getDescription: card => `Discard a random card, Deal ${card.type.damage} damage`,
        color: "#af0000",
        sprite: acid,
        backing: flesh,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            
            if (user.hand.length > 0) {
                let random = randomFloor(user.hand.length)
                user.discardCardAt(random)
            }
            if ( target ) {
                target.addHealth( -card.type.damage)
            }
        },

        cost: 1,
        damage: 5,
        range: 5,
        minDist: 2,
        friendly: false
    },
    bloodClot: {
        name: "Blood Clot",
        getDescription: card => `Heal ${card.type.heal} HP`,
        color: "#af0000",
        sprite: bloodClot,
        backing: flesh,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile(card, user, pos, target?) {
            // user.addSpeed( -card.type.speed )
            user.addHealth( card.type.heal )
        },

        cost: 0,
        heal: 2,

        damage: 0,
        range: 0,
        minDist: 0,
        friendly: false
    },

    //------------------------------------------------------- UNIVERSAL ---------------------------------------
    repair: {
        name: "Repair-Kit",
        getDescription: card => `Heal unit for ${ card.type.damage } health`,
        color: "#32a852",
        sprite: repair,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            target?.addHealth( card.type.damage )

            //Exhaustive
            //look for the card in the users Discard Pile and remove it
            user.discard.cards.pop()
        },
        render: ( animationFrame, user, pos ) => {
            let g = Graphics.instance
            let game = Game.instance
            let match = game.match
            let tileSize = 32
            let target = match.getUnit( pos )
            if ( target ) {
                let targetPos = target.pos.scale( tileSize ).add( new Vector( tileSize / 2, tileSize / 2 ) )
                let color = `rgba(0, 255, 0, ${ animationFrame })`
                // g.drawRect(targetPos, new Vector(tileSize, tileSize).scale(2), color)
                g.fillCircle( targetPos, Math.abs( Math.sin( animationFrame * Math.PI * 6 ) * tileSize * 0.8 ), color )
                console.log( "drawing repair!" )
            }
        },
        renderFrames: 40,

        cost: 0,
        damage: 7,
        range: 1,
        minDist: 0,
        friendly: true,
        exhaustive: true


    },
    sprint: {
        name: "Sprint",
        getDescription: card => `Take ${ card.type.damage } damage,
         Gain ${ card.type.range } speed,
         Gain ${ card.type.cost } Energy`,
        color: "#667799",
        sprite: sprint,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            if ( target ) {
                user.addHealth( -card.type.damage )
                target.addEnergy( card.type.cost )
                target.addSpeed( card.type.range )
            }
            console.log( user.discard.cards.pop() )
        },

        cost: 1,
        damage: 3,
        range: 1,
        minDist: 0,
        friendly: true,
        exhaustive: true

    },
    rifle: {
        name: "Rifle",
        getDescription: card => `Deal ${ card.type.damage } damage to target`,
        color: "#969696",
        sprite: rifle,
        backing: metal,
        canApplyToEmptyTiles: false,
        // getTilesInRange: ( card, user ) => lineOfSightTargets( user.pos, { range: card.type.range } ),
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range } ),
        onApplyToTile: ( card, user, pos, target ) => {
            target?.addHealth( -card.type.damage )
            //this card should target using LOS(Line of Sight)
        },

        render: ( animationFrame, user, pos ) => {
            let g = Graphics.instance
            let game = Game.instance
            let world = game.match
            let tileSize = 32
            let target = world.getUnit( pos )
            if ( target ) {
                let userPos = user.pos.scale( tileSize ).add( new Vector( tileSize / 2, tileSize / 2 ) )
                let targetPos = target.pos.scale( tileSize ).add( new Vector( tileSize / 2, tileSize / 2 ) )
                let bullet = {
                    pos: userPos.lerp( targetPos, animationFrame ),
                    radius: 2,
                    color: "rgba(50, 0, 0)"
                }
                for ( let i = 0; i < 5; i++ ) {
                    let spread = 4
                    let noise = new Vector( Math.random() * spread, Math.random() * spread )
                    g.fillCircle( bullet.pos.add( noise ), bullet.radius, bullet.color )
                }
            }
        },
        renderFrames: 4,

        cost: 1,
        damage: 4,
        range: 3,
        minDist: 2,

        friendly: false
    },
    grapplingHook: {
        name: "Grappling Hook",
        getDescription: card => `Pull you to target from ${ card.type.range } tiles away.`,
        color: "#969696",
        sprite: grapplingHook,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            if ( target ) {
                let xShift = ( target.pos.x < user.pos.x ) ?
                    target.pos.x + 1 : ( target.pos.x == user.pos.x ) ?
                        target.pos.x : target.pos.x - 1
                let yShift = ( target.pos.y < user.pos.y ) ?
                    target.pos.y + 1 : ( target.pos.y == user.pos.y ) ?
                        target.pos.y : target.pos.y - 1
                let newPos = new Vector( xShift, yShift )
                let path = [ user.pos, newPos ]
                user.move( path )
            }

        },

        cost: 1,
        damage: 0,
        range: 8,
        minDist: 1,
        friendly: false

    },
    //------------------------------------------------------- TREE ----------------------------------------------
    perfume: {
        name: "Perfume",
        getDescription: card => `Reduce MaxHP by ${ card.type.damage }, increase Speed by ${ card.type.damage }`,
        color: "#026822",
        sprite: pollen,
        backing: green,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {

            if ( target ) {
                target.speed += card.type.damage
                target.addMaxHealth( -card.type.damage )
            }
        },

        cost: 1,
        damage: 2,
        range: 6,
        minDist: 0,
        friendly: false
    },
    root: {
        name: "Root",
        getDescription: card => `Immobilize Target Target Heals ${ card.type.damage } HP`,
        color: "#026822",
        sprite: root,
        backing: green,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {

            if ( target ) {
                target.speed = 1
                target.addHealth( card.type.damage )
            }
        },

        cost: 1,
        damage: 8,
        range: 6,
        minDist: 0,
        friendly: false
    },
    fungus: {
        name: "Fungus",
        getDescription: card => `Target Gains ${card.type.energy} Energy`,
        color: "#026822",
        sprite: fungus,
        backing: green,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            if ( target ) {
                target.addEnergy(card.type.energy)
            }
        },

        speedCost: 2,
        energy: 1,
        damage: 8,
        range: 4,
        minDist: 0,
        friendly: false
    },
    flower: {
        name: "Flower",
        getDescription: card => `Grant Target ${ card.type.damage } Fruits`,
        color: "#026822",
        sprite: flower,
        backing: green,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            if ( target ) {
                target.draw.add( CardTypes.fruit, 2 )
            }
        },
        cost: 1,
        damage: 2,
        range: 4,
        minDist: 0,
        friendly: false
    },
    fruit: {
        name: "Fruit",
        getDescription: card => `Grant User ${ card.type.damage } HP -Exhaustive`,
        color: "#026822",
        sprite: fruit,
        backing: green,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            target?.addHealth( card.type.damage )
        },

        cost: 0,
        damage: 2,
        range: 1,
        minDist: 0,
        friendly: true,
        exhaustive: true,
    },
    bark: {
        name: "Bark",
        getDescription: card => `Heal a target for ${ card.type.heal } HP`,
        color: "#026822",
        sprite: bark,
        backing: green,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile(card, user, pos, target?) {
            target?.addHealth(card.type.heal)
        },

        speedCost: 2,
        damage: 0,
        heal: 3,
        range: 2,
        minDist: 0,
        friendly: false
    },
    boomShroom: {
        name: "BoomShroom",
        getDescription: card => `Reduce MaxHP: ${card.type.damage} in a ${card.type.dim?.x}x${card.type.dim?.y} area -Clears Mountains`,
        color: "#026822",
        sprite: boomShroom,
        backing: green,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            let match = Game.instance.match
            if (match.map.getElevation(pos) == 1) {
                match.map.set( pos, Tiles.Grass )
            }
            if ( target ) {
                target?.addMaxHealth( -card.type.damage )
            }
        },
        getTilesEffected( user, pos ) {
            let match = Game.instance.match
            let tilesEffected: Vector[] = [ pos ]
            let dim = this.dim!
            //get relative direction from user
            for ( let x = 0; x < dim.x; x++ ) {
                for ( let y = 0; y < dim.y; y++ ) {
                    let tile = pos.add( new Vector( x - 1, y - 1 ) )
                    if ( !tile.equals( pos ) ) {
                        tilesEffected.push( tile )
                    }
                }
            }
            return tilesEffected
        },

        cost: 1,
        damage: 3,
        dim: new Vector( 3, 3 ),
        range: 5,
        minDist: 2,
        friendly: false
    },
    //----------------------------------------------- ELDRITCH --------------------------------------------
    tentacle: {
        name: "Tentacle Pull",
        getDescription: card => `Pull target to you from ${ card.type.range } tiles away.`,
        color: "#990099",
        sprite: tentacle,
        backing: purple,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            // console.log(user.hand)
            if ( target ) {
                //Chaining Ternary functions are weird man
                let xShift = ( user.pos.x < target.pos.x ) ?
                    user.pos.x + 1 : ( user.pos.x == target.pos.x ) ?
                        user.pos.x : user.pos.x - 1
                let yShift = ( user.pos.y < target.pos.y ) ?
                    user.pos.y + 1 : ( user.pos.y == target.pos.y ) ?
                        user.pos.y : user.pos.y - 1
                let newPos = new Vector( xShift, yShift )
                let path = [ target.pos, newPos ]
                target.move( path )
            }

        },

        cost: 1,
        damage: 0,
        range: 6,
        minDist: 1,
        friendly: false

    },
    bubbletoss: {
        name: "Bubble Toss",
        getDescription: card => `Create shallow water, Deal ${ card.type.damage } damage`,
        color: "#990099",
        sprite: jelly,
        backing: purple,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            let match = Game.instance.match
            match.map.set( pos, Tiles.WaterShallow )
            target?.addHealth( -card.type.damage )

        },

        cost: 1,
        damage: 2,
        range: 5,
        minDist: 2,
        friendly: false

    },
    warp: {
        name: "Wrong Warp",
        getDescription: card => `Swap places with target, Gain ${card.type.damage} Wrong Warp`,
        color: "#990099",
        sprite: warp,
        backing: purple,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {

            if (target) {
                let store = target.pos
                target.pos = user.pos
                user.pos = store
                user.discard.add(card.type, card.type.damage)
            }
        },

        cost: 1,
        damage: 1,
        range: 6,
        minDist: 2,
        friendly: false
    },  
}

export default CardTypes

const cardTypeList = Object.values( CardTypes )
export function randomCardType() {
    let i = Math.floor( Math.random() * cardTypeList.length )
    return cardTypeList[ i ]
}

type scanOptions = {
    range?: number,
    ignoreObstacles?: boolean,
    ignoreElevation?: boolean,
    result?: Vector[],
    passable?: ( match: Match, pos: Vector ) => boolean
}

// Target generation
function targetsAlongLine(
    pos: Vector, delta: Vector,
    {
        range = Infinity,
        ignoreObstacles = false,
        ignoreElevation = false,
        result = [],
        passable = undefined
    }: scanOptions
) {
    let match = Game.instance.match
    let elevation0 = match.map.getElevation( pos )

    if ( passable == undefined )
        passable = ( match, pos ) => ignoreObstacles || match.isWalkable( pos, false )

    for ( let i = 1; i <= range; i++ ) {
        let p2 = pos.add( delta.scale( i ) )
        let inBounds = match.map.contains( p2 )
        let hitsUnit = match.getUnit( p2 ) !== undefined

        //Manually step through and assign tiles
        //steal code from blastCharges getTilesEffected

        if ( !inBounds || !passable( match, p2 ) )
            break

        let contained = false
        result.forEach( ( val, i ) => {
            if ( p2.equals( val ) ) {
                contained = true
            }
        } )
        if ( !contained ) {
            result.push( p2 )
        }
    }
    return result
}

function rookStyleTargets(
    pos: Vector,
    {
        range = Infinity, ignoreObstacles = false, ignoreElevation = false, result = [],
        passable = undefined
    }: scanOptions
) {
    targetsAlongLine( pos, new Vector( 1, 0 ), { range, ignoreObstacles, result, passable } )
    targetsAlongLine( pos, new Vector( -1, 0 ), { range, ignoreObstacles, result, passable } )
    targetsAlongLine( pos, new Vector( 0, 1 ), { range, ignoreObstacles, result, passable } )
    targetsAlongLine( pos, new Vector( 0, -1 ), { range, ignoreObstacles, result, passable } )
    return result
}

function bishopStyleTargets(
    pos: Vector,
    {
        range = Infinity, ignoreObstacles = false, ignoreElevation = false, result = [],
        passable = undefined
    }: scanOptions
) {
    targetsAlongLine( pos, new Vector( 1, 1 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( -1, -1 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( -1, 1 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 1, -1 ), { range, ignoreObstacles, result } )
    return result
}

function lineOfSightTargets(
    pos: Vector,
    {
        range = Infinity, ignoreObstacles = false, ignoreElevation = false, result = [],
        passable = undefined
    }: scanOptions
) {
    let map = Game.instance.match.map
    for ( let x = 0; x <= map.width; x++ ) {
        for ( let y = 0; y <= map.height; y++ ) {
            let tile = new Vector( x, y )
            let direction = tile.subtract( pos )
            direction = direction.scale( 1 / direction.length )
            targetsAlongLine( pos, direction, { range: range, ignoreObstacles: false, result } )
        }
    }
    return result
}

export function targetsWithinRange( pos: Vector, minDist: number, maxDist: number, result: Vector[] = [] ) {
    // console.log("target start:", pos)
    for ( let dx = -maxDist; dx <= maxDist; dx++ ) {
        for ( let dy = -maxDist; dy <= maxDist; dy++ ) {
            let r = Math.abs( dx ) + Math.abs( dy )
            if ( r >= minDist && r <= maxDist )
                result.push( pos.addXY( dx, dy ) )
        }
    }
    return result
}
