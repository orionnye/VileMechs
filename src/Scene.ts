import { contains } from "./math/math"
import Matrix from "./math/Matrix"
import { Vector } from "./math/Vector"

export interface SceneNode {
    localMatrix: Matrix
    children?: Iterable<SceneNode>
    parent?: SceneNode
    rect?: Rect
    // For adding child nodes.
    content?: () => void
    // Events
    onClick?: ( node: SceneNode, pos: Vector ) => void
    onHover?: ( node: SceneNode, pos: Vector ) => void
    onRender?: ( node: SceneNode ) => void
    onRenderPost?: ( node: SceneNode ) => void
    // Debug fields
    debugColor?: string
    description?: string
}

//  Pickable geometry. Might generalize geometry and add z-sorting.
export type Rect = {
    width: number
    height: number
}

export type PickingResult = {
    node?: SceneNode
    point: Vector // Coordinates of picking point in node's local space.
}

export default class Scene {

    static openNode?: SceneNode

    static node( node: SceneNode ) {
        let openNode = Scene.openNode
        if ( openNode ) {
            if ( !openNode.children )
                openNode.children = []
            if ( Array.isArray( openNode.children ) )
                openNode.children.push( node )
            node.parent = openNode
        }
        Scene.openNode = node
        if ( node.content )
            node.content()
        Scene.openNode = node.parent
        return node
    }

    static render( c: CanvasRenderingContext2D, node: SceneNode, debug = false ) {
        let { m11, m12, m13, m21, m22, m23 } = node.localMatrix
        c.save()
        c.transform( m11, m21, m12, m22, m13, m23 )
        if ( node.onRender )
            node.onRender( node )
        if ( debug && node.rect != null && node.debugColor != null ) {
            c.globalAlpha = 0.25
            c.fillStyle = node.debugColor
            c.fillRect( 0, 0, node.rect.width, node.rect.height )
            c.globalAlpha = 1
        }
        if ( node.children )
            for ( let child of node.children )
                Scene.render( c, child, debug )
        if ( node.onRenderPost )
            node.onRenderPost( node )
        c.restore()
    }

    static pickNode( node: SceneNode, p: Vector ): SceneNode | undefined {
        return Scene.pick( node, p ).node
    }

    static pick( node: SceneNode, p: Vector ): PickingResult {
        let result: SceneNode | undefined
        let point = p
        function visitNode( node: SceneNode, p: Vector ) {
            let p2 = node.localMatrix.inverse().multiplyVec( p )
            if ( node.rect ) {
                let rect = node.rect
                if ( contains( 0, rect.width, p2.x ) && contains( 0, rect.height, p2.y ) ) {
                    result = node
                    point = p2
                }
            }
            if ( node.children )
                for ( let child of node.children )
                    visitNode( child, p2 )
        }
        visitNode( node, p )
        return { node: result, point }
    }

    static addParentReferences( node: SceneNode, parent?: SceneNode ) {
        node.parent = parent
        if ( node.children )
            for ( let child of node.children )
                Scene.addParentReferences( child, node )
    }

    static relativeMatrix( node: SceneNode, ancestor?: SceneNode ) {
        let result = node.localMatrix
        while ( node.parent && node != ancestor ) {
            result = node.parent.localMatrix.multiply( result )
            node = node.parent
        }
        return result
    }

    static globalMatrix( node: SceneNode ) {
        return Scene.relativeMatrix( node )
    }

    static toLocalSpace( vector: Vector, node: SceneNode, ancestor?: SceneNode ) {
        let matrix = Scene.relativeMatrix( node, ancestor )
        return matrix.inverse().multiplyVec( vector )
    }

}
