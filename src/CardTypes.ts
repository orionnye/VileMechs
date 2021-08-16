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
const green = getImg( require( "./www/images/cards/backing/GreenCardBase.png" ) )
const metal = getImg( require( "./www/images/cards/backing/metal.png" ) )
const purple = getImg( require( "./www/images/cards/backing/purple.png" ) )

export type CardType = {
    name: string,
    description: string,
    color: string,
    sprite: HTMLImageElement,
    backing: HTMLImageElement,
    canApplyToEmptyTiles: boolean,
    getTilesInRange: ( user: Unit ) => Vector[]
    onApply?: ( user: Unit ) => void
    onApplyToTile?: ( user: Unit, pos: Vector, target?: Unit ) => void
}

const CardTypes: { [ name: string ]: CardType } = {
    laser: {
        name: "Laser",
        description: "Deal 8 damage \n to target",
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
        description: "Shiny Stone that \n might prove useful \n after the battle... \nUse to remove",
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
        description: "Pull target to you\nfrom 5 tiles away.\nTake 1 damage",
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
                let xShift = (user.pos.x < target.pos.x) ?
                    user.pos.x + 1 : (user.pos.x == target.pos.x) ?
                    user.pos.x : user.pos.x - 1
                let yShift = (user.pos.y < target.pos.y) ?
                    user.pos.y + 1 : (user.pos.y == target.pos.y) ?
                    user.pos.y : user.pos.y - 1
                target.pos = new Vector(xShift, yShift)
            }
        }
    },
    bouldertoss: {
        name: "Boulder Toss",
        // description: "Place a Mountain \n and deal 3 damage",
        description: linesplit("Place a Mountain and deal 3 damage broh"),
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
        description: "Destroy a Mountain \nand deal 10 damage",
        color: "#000000",
        sprite: mine,
        backing: brown,
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
        description: "Heal yourself or \n a nearby unit for \n 7 health",
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
        description: "Take 2 damage and\n double target\n mobility this turn",
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
        description: "Deal 1 damage, \n+ any health \ncurrently missing\n Range 3\n 0 Energy",
        color: "#0000aa",
        sprite: claw,
        backing: flesh,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 1, 3 ),
        onApplyToTile: ( user, pos, target ) => {
            // user.energy -= 1
            if ( target ) {
                let bonusDMG = user.maxHealth - user.health
                target.health -= (1 + bonusDMG)
            }
        }
    },
    acid: {
        name: "Acid",
        description: "Melts Armor,\n target maxHealth -= 3\ntarget speed += 1\n userEnergy -= 1\n range = 7",
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
        description: "Deals damage = to \n targets missing health \nuserHealth -= 2 \n range = 8\n userEnergy -= 1",
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

// Returns a string with \n every ~17 characters
function linesplit(input: string) {
    let n = 17
    let linebreak = "\n"
    let outstring = ""
    let splitnum = Math.floor(input.length / n)
    for (let i = 0; i <= splitnum; i++) {
        outstring += input.slice(outstring.length - i*linebreak.length, n*i) + linebreak
    }
    if (input.length % n > 0) {
        outstring += input.slice((input.length - (input.length % n)), (input.length))
    }
    return outstring
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
