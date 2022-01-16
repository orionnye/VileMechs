import { getImg } from "./common/utils"
import Game from "./Game"
import Card from "./gameobjects/Card"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"
import { Vector } from "./math/Vector"
import { findPath } from "./pathfinding"
import * as Tiles from "./map/Tiles"

//I have no idea why this requires one period but it does
//Ores
const ore = getImg( require( "./www/images/cards/ore/pustule.png" ) )

//Action Icons
const blank = getImg( require( "./www/images/cards/backing/card.png" ) )
const sprint = getImg( require( "./www/images/cards/icon/sprint.png" ) )
const mine = getImg( require( "./www/images/cards/icon/mine.png" ) )
const repair = getImg( require( "./www/images/cards/icon/repair.png" ) )
const laser = getImg( require( "./www/images/cards/icon/laser.png" ) )
const boulder = getImg( require( "./www/images/cards/icon/boulder.png" ) )
const tentacle = getImg( require( "./www/images/cards/icon/tentacle.png" ) )
const claw = getImg( require( "./www/images/cards/icon/claw.png" ) )
const acid = getImg( require( "./www/images/cards/icon/acid.png" ) )
const frost = getImg( require( "./www/images/cards/icon/frost.png" ) )
const jelly = getImg( require( "./www/images/cards/icon/jelly.png" ) )
const energyArmor = getImg( require( "./www/images/cards/icon/energyArmor.png" ) )
const shieldCharge = getImg( require( "./www/images/cards/icon/shieldCharge.png" ) )
const chargeBeam = getImg( require( "./www/images/cards/icon/chargeBeam.png" ) )

//Card Background
const flesh = getImg( require( "./www/images/cards/backing/flesh.png" ) )
const black = getImg( require( "./www/images/cards/backing/BlackCardBase.png" ) )
const brown = getImg( require( "./www/images/cards/backing/BrownCardBase.png" ) )
const green = getImg( require( "./www/images/cards/backing/jungle.png" ) )
const metal = getImg( require( "./www/images/cards/backing/metal.png" ) )
const purple = getImg( require( "./www/images/cards/backing/purple.png" ) )

export type CardType = {
    name: string
    getDescription: ( card: Card ) => string
    color: string
    sprite: HTMLImageElement
    backing: HTMLImageElement
    canApplyToEmptyTiles: boolean
    getTilesInRange: ( card: Card, user: Unit ) => Vector[]
    onApplyToTile?: ( card: Card, user: Unit, pos: Vector, target?: Unit ) => void

    cost: number,
    damage: number,
    range: number,
    minDist: number,

    [ index: string ]: any
}

const CardTypes: { [ name: string ]: CardType } = {
    //------------------------------- CHROME -----------------------------
    laser: {
        name: "Laser",
        getDescription: card => `Deal ${ card.type.damage } damage to target`,
        color: "#6BB5FF",
        sprite: laser,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range } ),
        onApplyToTile: ( card, user, pos, target ) => {
            target?.addHealth( -card.type.damage )
            user.energy -= card.type.cost
        },

        cost: 1,
        damage: 8,
        range: 8,
        minDist: 2,
    },
    energyArmor: {
        name: "Energy Armor",
        getDescription: card => `Reduce incoming damage by ${ card.type.damage }, -Unplayable, -Exhaustive`,
        color: "#6BB5FF",
        sprite: energyArmor,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range } ),
        // onApplyToTile: ( card, user, pos, target ) => {

        // },

        cost: 0,
        damage: 1,
        range: 0,
        minDist: 0,
    },
    shieldCharge: {
        name: "Shield Charge",
        getDescription: card => `Generate ${ 2 } Energy Armor`,
        color: "#6BB5FF",
        sprite: shieldCharge,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.gainCard(CardTypes.energyArmor, 2)
            user.energy -= card.type.cost
        },

        cost: 2,
        damage: 0,
        range: 0,
        minDist: 0,
    },
    chargeBeam: {
        name: "Charge Beam",
        getDescription: card => `Deal ${ card.type.damage }xEnergy Armor Total, -Exhaust all Energy Armor`,
        color: "#6BB5FF",
        sprite: chargeBeam,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => rookStyleTargets( user.pos, { range: card.type.range } ),
        onApplyToTile: ( card, user, pos, target ) => {
            //count energy Armor in Hand, remove it
            let armorCount = user.hand.typeCount(CardTypes.energyArmor)
            console.log("ARMOR COUNT:", armorCount)
            for (let i = armorCount; i > 0; i--) {
                user.hand.cards.forEach( (card, index) => {
                    if ( card.type == CardTypes.energyArmor ) {
                        user.hand.cards.splice(index, 1)
                    }
                })
            }
            target?.addHealth( -card.type.damage * armorCount )
            //stack damage and apply to enemy
            user.energy -= card.type.cost
        },

        cost: 3,
        damage: 6,
        range: 9,
        minDist: 0,
    },
    //------------------------------- CURRENCY -----------------------------
    ore: {
        name: "Ore",
        getDescription: card => "$$$... -Exhaustive",
        color: "#aaaaaa",
        sprite: ore,
        backing: black,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            //Exhaustive
            //look for the card in the users Discard Pile and remove it
            user.discard.cards.pop()
            user.energy -= card.type.cost
        },

        cost: 0,
        damage: 0,
        range: 0,
        minDist: 0,
    },
    //------------------------------- ELDRITCH -----------------------------
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
            user.energy -= card.type.cost
        },

        cost: 1,
        damage: 0,
        range: 5,
        minDist: 1,
    },
    bubbletoss: {
        name: "Bubble Toss",
        getDescription: card => `Create shallow water, Deal ${card.type.damage} damage`,
        color: "#990099",
        sprite: jelly,
        backing: purple,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            let world = Game.instance.world
            world.map.set( pos, Tiles.WaterShallow )
            target?.addHealth( -card.type.damage )
            user.energy -= card.type.cost
        },

        cost: 1,
        damage: 2,
        range: 5,
        minDist: 2
    },
    //------------------------------- EARTH -----------------------------
    bouldertoss: {
        name: "Boulder Toss",
        getDescription: card => `Place a Mountain Deal ${card.type.damage} damage`,
        color: "#361000",
        sprite: boulder,
        backing: brown,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            // console.log(pos)
            let world = Game.instance.world
            world.map.set( pos, Tiles.GrassHill )
            target?.addHealth( -card.type.damage )
            user.energy -= card.type.cost
            //check if "ore" is in hand and scale with total. Then remove ores
        },

        cost: 1,
        damage: 3,
        range: 6,
        minDist: 3,
    },
    mine: {
        name: "Mine",
        getDescription: card => `Destroy Mountain Deal ${card.type.damage} damage`,
        color: "black",
        sprite: mine,
        backing: brown,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            // console.log(pos)
            let world = Game.instance.world
            // console.log(world.map.get(pos))
            if ( world.map.get( pos ) == Tiles.GrassHill ) {
                world.map.set( pos, Tiles.Grass )
                for ( let i = 0; i < 2; i++ ) {
                    let card = new Card()
                    card.type = CardTypes.ore
                    user.draw.cards.push( card )
                }
            }
            target?.addHealth( -card.type.damage )
            user.energy -= card.type.cost
        },

        cost: 1,
        damage: 10,
        range: 1,
        minDist: 1,
    },
    //------------------------------- UNIVERSAL -----------------------------
    repair: {
        name: "Repair-Kit",
        getDescription: card => `Heal unit for ${card.type.damage} health, -Exhaustive`,
        color: "#32a852",
        sprite: repair,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            target?.addHealth( card.type.damage )
            user.energy -= card.type.cost
            //Exhaustive
            //look for the card in the users Discard Pile and remove it
            user.discard.cards.pop()
        },

        cost: 1,
        damage: 7,
        range: 0,
        minDist: 0,

    },
    sprint: {
        name: "Sprint",
        getDescription: card => `Take ${card.type.damage} damage, Double speed, -Exhaustive`,
        color: "#667799",
        sprite: sprint,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user?.addHealth( -card.type.damage )
            user.energy -= card.type.cost
            if ( target ) {
                target.speed += target.maxSpeed
            }
            user.discard.cards.pop()
        },

        cost: 1,
        damage: 2,
        range: 0,
        minDist: 0,
    },
    //------------------------------- FLESH -----------------------------
    claw: {
        name: "Claw",
        getDescription: card => `Deal ${card.type.damage} damage`,
        color: "#af0000",
        sprite: claw,
        backing: flesh,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.energy -= card.type.cost
            if ( target ) {
                // let bonusDMG = user.maxHealth - user.health
                // card.type.damage = bonusDMG + 1
                target.addHealth(-card.type.damage)
            }
        },

        cost: 0,
        damage: 3,
        range: 1,
        minDist: 1,
    },
    acid: {
        name: "Acid",
        getDescription: card => `Melts Armor, target maxHealth -= ${card.type.damage} target speed += 1`,
        color: "#32a852",
        sprite: acid,
        backing: purple,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.energy -= card.type.cost

            if ( target ) {
                target.addMaxHealth(-card.type.damage)
                target.maxSpeed += 2
                target.addHealth(-2)
            }
        },

        cost: 1,
        damage: 3,
        range: 5,
        minDist: 0,
    },
    //------------------------------- THERMAL -----------------------------
    frost: {
        name: "Frost",
        getDescription: card => `Deals ${card.type.damage} damage (unit's missing health)`,
        color: "#0000aa",
        sprite: frost,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( card, user ) => targetsWithinRange( user.pos, card.type.minDist, card.type.range ),
        onApplyToTile: ( card, user, pos, target ) => {
            user.energy -= card.type.cost
            // user.health -= 2
            //deals damage to target based on previously sustained damage
            if ( target ) {
                let damage = target.maxHealth - target.health
                card.type.damage = damage
                target.addHealth(-card.type.damage)
            }
        },

        cost: 1,
        damage: 2,
        range: 3,
        minDist: 1,
    }
}

export default CardTypes

const cardTypeList = Object.values( CardTypes )
export function randomCardType() {
    let i = Math.floor( Math.random() * cardTypeList.length )
    return cardTypeList[ i ]
}

// Target generation
function targetsAlongLine(
    pos: Vector, delta: Vector,
    { range = Infinity, ignoreObstacles = false, ignoreElevation = false, result = [] }:
        { range?: number, ignoreObstacles?: boolean, ignoreElevation?: boolean, result?: Vector[] }
) {
    let world = Game.instance.world
    let elevation0 = world.map.getElevation( pos )
    for ( let i = 1; i <= range; i++ ) {
        let p2 = pos.add( delta.scale( i ) )
        let inBounds = world.map.contains( p2 )
        let hitsUnit = world.getUnit( p2 ) !== undefined
        if ( !inBounds )
            break
        // let walkable = inBounds && ( ignoreObstacles || world.isWalkable( p2, false ) )
        // if ( !walkable )
        //     break
        result.push( p2 )
        if ( !ignoreObstacles && hitsUnit )
            break
        if ( !ignoreElevation ) {
            let elevation = world.map.getElevation( p2 )
            if ( elevation > elevation0 )
                break
        }
    }
    return result
}

function rookStyleTargets(
    pos: Vector,
    { range = Infinity, ignoreObstacles = false, ignoreElevation = false, result = [] }:
        { range?: number, ignoreObstacles?: boolean, ignoreElevation?: boolean, result?: Vector[] }
) {
    targetsAlongLine( pos, new Vector( 1, 0 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( -1, 0 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 0, 1 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 0, -1 ), { range, ignoreObstacles, result } )
    return result
}

function bishopStyleTargets(
    pos: Vector,
    { range = Infinity, ignoreObstacles = false, ignoreElevation = false, result = [] }:
        { range?: number, ignoreObstacles?: boolean, ignoreElevation?: boolean, result?: Vector[] }
) {
    targetsAlongLine( pos, new Vector( 1, 0 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( -1, 0 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 0, 1 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 0, -1 ), { range, ignoreObstacles, result } )
}

export function targetsWithinRange( pos: Vector, minDist: number, maxDist: number, result: Vector[] = [] ) {
    for ( let dx = -maxDist; dx <= maxDist; dx++ ) {
        for ( let dy = -maxDist; dy <= maxDist; dy++ ) {
            let r = Math.abs( dx ) + Math.abs( dy )
            if ( r >= minDist && r <= maxDist )
                result.push( pos.addXY( dx, dy ) )
        }
    }
    return result
}
