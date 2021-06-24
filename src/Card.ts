import Graphics from "./Graphics"
import { Vector } from "./math/Vector"
import { randomColor } from "./utils"

export default class Card {
    static dimensions = new Vector( 48, 64 )

    color: string = randomColor()

    render( offset: Vector ) {
        let g = Graphics.instance
        g.drawRect( offset, Card.dimensions, this.color )
        g.strokeRect( offset, Card.dimensions, "#f0ead8" )
    }
}