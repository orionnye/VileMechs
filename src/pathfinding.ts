import { Vector } from "./math/Vector"
import World from "./gameobjects/World"

const offsetOrderings = [
    [ //  Horizontal-first ordering
        new Vector( 1, 0 ), new Vector( -1, 0 ),
        new Vector( 0, 1 ), new Vector( 0, -1 ),
    ],
    [ //  Vertical first ordering
        new Vector( 0, 1 ), new Vector( 0, -1 ),
        new Vector( 1, 0 ), new Vector( -1, 0 ),
    ],
]
function getMoves( tilePairity: number, useDiagonals = false ) {
    if ( useDiagonals )
        return [
            new Vector( 1, 0 ), new Vector( -1, 0 ),
            new Vector( 0, 1 ), new Vector( 0, -1 ),

            new Vector( 1, 1 ), new Vector( -1, 1 ),
            new Vector( -1, -1 ), new Vector( 1, -1 ),
        ]
    else
        return offsetOrderings[ tilePairity ]
    //  Alternating between vertical-first and horizontal-first leads
    //  to a preference for zigzagging paths over large L-shaped paths.
}

export function findPath( world: World, origin: Vector, destination: Vector, maxDepth = 100 ) {
    type Node = { pos: Vector, parent: Node | null }
    function makeNode( pos: Vector, parent: Node | null ): Node {
        return { pos, parent }
    }

    function rebuildPath( node: Node ) {
        let steps = [ node.pos ]
        while ( node.parent != null ) {
            node = node.parent
            steps.push( node.pos )
        }
        return steps.reverse()
    }

    if ( origin.equals( destination ) )
        return [ origin ]
    if ( !world.isWalkable( destination ) )
        return null

    let destKey = destination.toString()

    let currLayer = [ makeNode( origin, null ) ]
    let nextLayer = [] as Node[]
    let visited = new Set<string>()
    visited.add( origin.toString() )

    for ( let i = 0; i < maxDepth; i++ ) {
        for ( let node of currLayer ) {
            let pairity = ( node.pos.x + node.pos.y ) % 2
            let offsets = getMoves( pairity )

            for ( let offset of offsets ) {
                let pos2 = node.pos.add( offset )
                if ( !world.isWalkable( pos2 ) )
                    continue
                if ( Math.abs( offset.x ) > 0 && Math.abs( offset.y ) > 0 ) {
                    // Check that diagonal move isn't between two obstacles.
                    let freeAlongX = world.isWalkable( node.pos.addXY( offset.x, 0 ) )
                    let freeAlongY = world.isWalkable( node.pos.addXY( 0, offset.y ) )
                    if ( !freeAlongX && !freeAlongY )
                        continue
                }
                let key = pos2.toString()
                if ( visited.has( key ) )
                    continue
                visited.add( key )
                let node2 = makeNode( pos2, node )

                if ( key == destKey )
                    return rebuildPath( node2 )

                nextLayer.push( node2 )
            }
        }

        let tmp = currLayer
        currLayer = nextLayer
        nextLayer = tmp
        nextLayer.length = 0
    }

    return null
}