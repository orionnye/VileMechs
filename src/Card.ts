import Graphics from "./Graphics"
import { Vector } from "./math/Vector"
import Unit from "./Unit"
import { randomColor } from "./utils"
import World from "./World"

export default class Card {
    static dimensions = new Vector( 48, 64 )

    color: string = randomColor()

    render( offset: Vector ) {
        let g = Graphics.instance
        g.drawRect( offset, Card.dimensions, this.color )
        g.strokeRect( offset, Card.dimensions, "#f0ead8" )
    }

    getTargets( world: World, user: Unit ) {
        let result: Vector[] = []
        let { x, y } = user.pos
        for ( let dy = -2; dy <= 2; dy++ )
            for ( let dx = -2; dx <= 2; dx++ )
                if ( Math.abs( dx ) + Math.abs( dy ) < 3 )
                    result.push( new Vector( x + dx, y + dy ) )
        return result
        // return [
        //     user.pos.addXY( 1, 0 ),
        //     user.pos.addXY( -1, 0 ),
        //     user.pos.addXY( 0, 1 ),
        //     user.pos.addXY( 0, -1 ),
        // ]
    }
}