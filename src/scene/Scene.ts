import { contains } from "../math/math"
import Matrix from "../math/Matrix"
import { Vector } from "../math/Vector"

export type SceneNode = {
    transform: Matrix
    children?: SceneNode[]
    rect?: Rect
    color?: string
    data?: any
    description?: string
    onClick?: ( pos: Vector ) => void
    onRender?: ( node: SceneNode ) => void
}

export type ParentSceneNode = SceneNode & { children: SceneNode[] }

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

    static render( c: CanvasRenderingContext2D, node: SceneNode, debug = false ) {
        let { m11, m12, m13, m21, m22, m23 } = node.transform
        c.save()
        c.transform( m11, m21, m12, m22, m13, m23 )
        if ( node.onRender )
            node.onRender( node )
        if ( debug && node.rect != null && node.color != null ) {
            c.globalAlpha = 0.25
            c.fillStyle = node.color
            c.fillRect( 0, 0, node.rect.width, node.rect.height )
            c.globalAlpha = 1
        }
        if ( node.children )
            for ( let child of node.children )
                Scene.render( c, child, debug )
        c.restore()
    }

    static pickNode( node: SceneNode, p: Vector ): SceneNode | undefined {
        return Scene.pick( node, p ).node
    }

    static pick( node: SceneNode, p: Vector ): PickingResult {
        let result: SceneNode | undefined
        let point = p
        function visitNode( node: SceneNode, p: Vector ) {
            let p2 = node.transform.inverse().multiplyVec2( p )
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


}
