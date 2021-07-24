import { getImg } from "./common/utils"
import Game from "./Game"
import Card from "./gameobjects/Card"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"
import { Vector } from "./math/Vector"


const boulder = getImg( require( "./www/images/cards/BoulderCard.png" ) )
const laser = getImg( require( "./www/images/cards/LaserCard.png" ) )
const ore = getImg( require( "./www/images/cards/OrePustule.png" ) )
const mine = getImg( require( "./www/images/cards/MineCard.png" ) )
const blank = getImg( require( "./www/images/cards/card.png" ) )

export type CardType = {
    name: string,
    color: string,
    sprite: HTMLImageElement,
    canApplyToEmptyTiles: boolean,
    getTilesInRange: ( user: Unit ) => Vector[]
    onApply?: ( user: Unit ) => void
    onApplyToTile?: ( user: Unit, pos: Vector, target?: Unit ) => void
}

const CardTypes: { [ name: string ]: CardType } = {
    laser: {
        name: "Laser",
        color: "#f54242",
        sprite: laser,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => rookStyleTargets( user.pos, { range: 5 } ),
        onApplyToTile: ( user, pos, target ) => {
            target?.addHealth( -8 )
            user?.addEnergy( -1 )
        }
    },
    ore: {
        name: "Ore",
        color: "#aaaaaa",
        sprite: ore,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRange( user.pos, 0, 0 ),
        onApplyToTile: ( user, pos, target ) => {
            // console.log(user.hand)
            user.addEnergy( -1 )
            // target?.addMaxHealth( 2 )
            //look for the card in the users Discard Pile and remove it
            user.discard.pop()
        }
    },
    bouldertoss: {
        name: "Boulder Toss",
        color: "#885555",
        sprite: boulder,
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
        color: "#000000",
        sprite: mine,
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
                    user.draw.push( card )
                }
            }
            target?.addHealth( -10 )
            user?.addEnergy( -1 )
        }
    },
    repair: {
        name: "Auto-Repair",
        color: "#32a852",
        sprite: blank,
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRadius( user.pos, 1 ),
        onApplyToTile: ( user, pos, target ) => {
            target?.addHealth( 7 )
            user?.addEnergy( -1 )
        }
    },
    sprint: {
        name: "Sprint",
        color: "#0000aa",
        sprite: blank,
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