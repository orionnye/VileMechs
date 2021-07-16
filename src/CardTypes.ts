import Game from "./Game"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"
import { Vector } from "./math/Vector"

export type CardType = {
    name: string,
    color: string,
    canApplyToEmptyTiles: boolean
    getTilesInRange: ( user: Unit ) => Vector[]
    onApply?: ( user: Unit ) => void
    onApplyToTile?: ( user: Unit, pos: Vector, target?: Unit ) => void
}

const CardTypes: { [ name: string ]: CardType } = {
    laser: {
        name: "Laser",
        color: "#f54242",
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => rookStyleTargets( user.pos, { range: 3 } ),
        onApplyToTile: ( user, pos, target ) => {
            target?.addHealth( -5 )
        }
    },
    repair: {
        name: "Repair",
        color: "#32a852",
        canApplyToEmptyTiles: false,
        getTilesInRange: ( user ) => targetsWithinRadius( user.pos, 2 ),
        onApplyToTile: ( user, pos, target ) => {
            target?.addHealth( 5 )
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