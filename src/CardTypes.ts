import { getImg } from "./common/utils"
import Game from "./Game"
import Card from "./gameobjects/Card"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"
import { Vector } from "./math/Vector"
import { findPath } from "./pathfinding"

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

//Card Background
const flesh = getImg( require( "./www/images/cards/backing/flesh.png" ) )
const black = getImg( require( "./www/images/cards/backing/BlackCardBase.png" ) )
const brown = getImg( require( "./www/images/cards/backing/BrownCardBase.png" ) )
const green = getImg( require( "./www/images/cards/backing/jungle.png" ) )
const metal = getImg( require( "./www/images/cards/backing/metal.png" ) )
const purple = getImg( require( "./www/images/cards/backing/purple.png" ) )

export type CardType = {
    name: string,
    getDescription: ( card: Card ) => string,
    color: string,
    sprite: HTMLImageElement,
    backing: HTMLImageElement,
    canApplyToEmptyTiles: boolean,
    getTilesInRange: ( user: Unit ) => Vector[]
    onApply?: ( user: Unit ) => void
    onApplyToTile?: ( user: Unit, pos: Vector, target?: Unit ) => void,
    [ index: string ]: any
}

const CardTypes: { [ name: string ]: CardType } = {
    laser: {
        name: "Laser",
        getDescription: card => `Deal 8 damage to target`,
        color: "#f54242",
        sprite: laser,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => rookStyleTargets( user.pos, { range: 5 } ),
        onApplyToTile: ( user, pos, target ) => {
            target?.addHealth( -8 )
            user?.addEnergy( -1 )
        }
    },
    ore: {
        name: "Ore",
        getDescription: card => "Shiny Stone that might prove useful after the battle... Use to remove",
        color: "#aaaaaa",
        sprite: ore,
        backing: black,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 0, 0 ),
        onApplyToTile: ( user, pos, target ) => {
            // console.log(user.hand)
            user.addEnergy( -1 )
            // target?.addMaxHealth( 2 )
            //look for the card in the users Discard Pile and remove it
            user.discard.cards.pop()
        }
    },
    tentacle: {
        name: "Tentacle Pull",
        getDescription: card => "Pull target to you from 5 tiles away. Take 1 damage",
        color: "#aaaaaa",
        sprite: tentacle,
        backing: purple,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 1, 5 ),
        onApplyToTile: ( user, pos, target ) => {
            // console.log(user.hand)
            user.addEnergy( -1 )
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
        }
    },
    bouldertoss: {
        name: "Boulder Toss",
        getDescription: card => "Place a Mountain and deal 3 damage broh",
        color: "#885555",
        sprite: boulder,
        backing: brown,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 3, 6 ),
        onApplyToTile: ( user, pos, target ) => {
            // console.log(pos)
            let world = Game.instance.world
            world.map.set( pos, 1 )
            target?.addHealth( -3 )
            user?.addEnergy( -1 )
            //check if "ore" is in hand and scale with total. Then remove ores
        }
    },
    mine: {
        name: "Mine",
        getDescription: card => "Destroy a Mountain and deal 10 damage",
        color: "#000000",
        sprite: mine,
        backing: green,
        canApplyToEmptyTiles: true,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 1, 1 ),
        onApplyToTile: ( user, pos, target ) => {
            // console.log(pos)
            let world = Game.instance.world
            // console.log(world.map.get(pos))
            if ( world.map.get( pos ).content == 1 ) {
                world.map.set( pos, 0 )
                for ( let i = 0; i < 2; i++ ) {
                    let card = new Card()
                    card.type = cardTypeList[ 1 ]
                    user.draw.cards.push( card )
                }
            }
            target?.addHealth( -10 )
            user?.addEnergy( -1 )
        }
    },
    repair: {
        name: "Auto-Repair",
        getDescription: card => "Heal yourself or a nearby unit for 7 health",
        color: "#32a852",
        sprite: repair,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 0, 1 ),
        onApplyToTile: ( user, pos, target ) => {
            target?.addHealth( 7 )
            user?.addEnergy( -1 )
        }
    },
    sprint: {
        name: "Sprint",
        getDescription: card => "Take 2 damage and double target mobility this turn",
        color: "#0000aa",
        sprite: sprint,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 0, 1 ),
        onApplyToTile: ( user, pos, target ) => {
            user?.addHealth( -2 )
            user?.addEnergy( -1 )
            if ( target ) {
                target.speed += target.maxSpeed
            }
        }
    },
    claw: {
        name: "Claw",
        getDescription: card => "Deal 1 damage, + any health currently missing Range 3 0 Energy",
        color: "#0000aa",
        sprite: claw,
        backing: flesh,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 1, 3 ),
        onApplyToTile: ( user, pos, target ) => {
            // user.energy -= 1
            if ( target ) {
                let bonusDMG = user.maxHealth - user.health
                target.health -= ( 1 + bonusDMG )
            }
        }
    },
    acid: {
        name: "Acid",
        getDescription: card => "Melts Armor, target maxHealth -= 3 target speed += 1 userEnergy -= 1 range = 7",
        color: "#0000aa",
        sprite: acid,
        backing: purple,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 0, 7 ),
        onApplyToTile: ( user, pos, target ) => {
            user.energy -= 1

            if ( target ) {
                target.maxHealth -= 3
                target.speed += 1
            }
        }
    },
    frost: {
        name: "Frost",
        getDescription: card => "Deals damage = to targets missing health userHealth -= 2 range = 8 userEnergy -= 1",
        color: "#0000aa",
        sprite: frost,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 0, 1 ),
        onApplyToTile: ( user, pos, target ) => {
            user.energy -= 1
            user.health -= 2

            //deals damage to target based on previously sustained damage
            if ( target ) {
                let damage = target.maxHealth - target.health
                target.health -= damage
            }
        }
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
    { range = Infinity, ignoreObstacles = false, result = [] }:
        { range?: number, ignoreObstacles?: boolean, result?: Vector[] }
) {
    let world = Game.instance.world
    for ( let i = 1; i <= range; i++ ) {
        let p2 = pos.add( delta.scale( i ) )
        let walkable = world.map.contains( p2 ) && ( ignoreObstacles || world.isWalkable( p2, false ) )
        let hitsUnit = world.getUnit( p2 ) !== undefined
        if ( !walkable )
            break
        result.push( p2 )
        if ( !ignoreObstacles && hitsUnit )
            break
    }
    return result
}

function rookStyleTargets(
    pos: Vector,
    { range = Infinity, ignoreObstacles = false, result = [] }:
        { range?: number, ignoreObstacles?: boolean, result?: Vector[] }
) {
    targetsAlongLine( pos, new Vector( 1, 0 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( -1, 0 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 0, 1 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 0, -1 ), { range, ignoreObstacles, result } )
    return result
}

function bishopStyleTargets(
    pos: Vector,
    { range = Infinity, ignoreObstacles = false, result = [] }:
        { range?: number, ignoreObstacles?: boolean, result?: Vector[] }
) {
    targetsAlongLine( pos, new Vector( 1, 0 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( -1, 0 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 0, 1 ), { range, ignoreObstacles, result } )
    targetsAlongLine( pos, new Vector( 0, -1 ), { range, ignoreObstacles, result } )
}

function targetsWithinRange( pos: Vector, minDist: number, maxDist: number, result: Vector[] = [] ) {
    for ( let dx = -maxDist; dx <= maxDist; dx++ ) {
        for ( let dy = -maxDist; dy <= maxDist; dy++ ) {
            let r = Math.abs( dx ) + Math.abs( dy )
            if ( r >= minDist && r <= maxDist )
                result.push( pos.addXY( dx, dy ) )
        }
    }
    return result
}
