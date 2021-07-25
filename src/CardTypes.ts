import { getImg } from "./common/utils"
import Game from "./Game"
import Card from "./gameobjects/Card"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"
import { Vector } from "./math/Vector"

//I have no idea why this requires one period but it does
const sprint = getImg( require( "./www/images/cards/Sprint.png" ) )
const ore = getImg( require( "./www/images/cards/OrePustule.png" ) )
const mine = getImg( require( "./www/images/cards/MineCard2.png" ) )
const repair = getImg( require( "./www/images/cards/Repair1.png" ) )
const laser = getImg( require( "./www/images/cards/LaserCard.png" ) )
const blank = getImg( require( "./www/images/cards/backing/card.png" ) )
const boulder = getImg( require( "./www/images/cards/BoulderCard1.png" ) )

//card background
const red = getImg( require( "./www/images/cards/backing/RedCardBase.png" ) )
const black = getImg( require( "./www/images/cards/backing/BlackCardBase.png" ) )
const brown = getImg( require( "./www/images/cards/backing/BrownCardBase.png" ) )
const green = getImg( require( "./www/images/cards/backing/GreenCardBase.png" ) )
const metal = getImg( require( "./www/images/cards/backing/MetalCardBase.png" ) )
const purple = getImg( require( "./www/images/cards/backing/PurpleCardBase.png" ) )

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
    bouldertoss: {
        name: "Boulder Toss",
        description: "Place a Mountain \n and deal 3 damage",
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
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 0, 1 ),
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
        description: "Heal yourself or \n nearby units for \n 7 health",
        color: "#32a852",
        sprite: repair,
        backing: metal,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRadius( user.pos, 1 ),
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
        getTilesInRange: ( user ) => targetsWithinRadius( user.pos, 1 ),
        onApplyToTile: ( user, pos, target ) => {
            if ( target ) {
                user?.addHealth( -2 )
                target?.addSpeed( target.maxSpeed )
                user?.addEnergy( -1 )
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

function targetsWithinRadius( pos: Vector, radius: number, result: Vector[] = [] ) {
    for ( let dx = -radius; dx <= radius; dx++ ) {
        for ( let dy = -radius; dy <= radius; dy++ ) {
            let r = Math.abs( dx ) + Math.abs( dy )
            if ( r <= radius )
                result.push( pos.addXY( dx, dy ) )
        }
    }
    return result
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