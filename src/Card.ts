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
        return [ user.pos.addXY( 0, 1 ) ]
    }
}