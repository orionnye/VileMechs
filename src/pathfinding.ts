import { Vector } from "./math";
import World from "./World"

const offsets = [
    new Vector( 1, 0 ),
    new Vector( -1, 0 ),
    new Vector( 0, 1 ),
    new Vector( 0, -1 )
]

export function findPath( world: World, from: Vector, to: Vector, maxDepth = 4 ) {
    type Node = { pos: Vector, parent: Node }
    function makeNode( pos: Vector, parent: Node ): Node {
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

    if ( from.equals( to ) )
        return [ from ]
    if ( !world.isWalkable( to ) ) // || !world.isWalkable( from ) )
        return null

    let destKey = to.toString()

    let currLayer = [ makeNode( from, null ) ]
    let nextLayer = [] as Node[]
    let visited = new Set<string>()
    visited.add( from.toString() )

    for ( let i = 0; i < maxDepth; i++ ) {
        for ( let node of currLayer ) {

            for ( let offset of offsets ) {
                let pos2 = node.pos.add( offset )
                if ( !world.isWalkable( pos2 ) )
                    continue
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