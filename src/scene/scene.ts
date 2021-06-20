import { contains } from "../math/math"
import Matrix from "../math/Matrix"
import { Vector } from "../math/Vector"

//  TODO: Precalculate a hull of all a node's children to make picking more efficient.
export type SceneNode = {
    mat: Matrix
    children?: SceneNode[]
    rect?: Rect
    color?: string
    data?: any
    onClick?: ( SceneNode ) => void
}

export type ParentSceneNode = SceneNode & { children: SceneNode[] }

//  Pickable geometry. Might generalize later.
//  TODO: Maybe add z-index and z sorting before render/picking or in a preprocessing step.
export type Rect = {
    width: number
    height: number
}

export default class Scene {

    static render( c: CanvasRenderingContext2D, node: SceneNode ) {
        let { m11, m12, m13, m21, m22, m23 } = node.mat
        c.save()
        c.transform( m11, m21, m12, m22, m13, m23 )
        if ( node.rect != null && node.color != null ) {
            c.fillStyle = node.color
            c.fillRect( 0, 0, node.rect.width, node.rect.height )
        }
        if ( node.children )
            for ( let child of node.children )
                Scene.render( c, child )
        c.restore()
    }

    static pick( node: SceneNode, p: Vector ): SceneNode | null {
        let result: SceneNode | null = null
        function visitNode( node: SceneNode, p: Vector ) {
            let p2 = node.mat.inverse().multiplyVec2( p )
            if ( node.rect ) {
                let rect = node.rect
                if ( contains( 0, rect.width, p2.x ) && contains( 0, rect.height, p2.y ) )
                    result = node
            }
            if ( node.children )
                for ( let child of node.children )
                    visitNode( child, p2 )
        }
        visitNode( node, p )
        return result
    }

}