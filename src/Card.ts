import Graphics from "./Graphics";
import { Vector } from "./math";
import { randomColor } from "./utils";

export default class Card {
    static dimensions = new Vector( 64, 96 )

    color: string = randomColor()

    render( offset: Vector ) {
        let g = Graphics.instance
        g.drawRect( offset, Card.dimensions, this.color )
    }
}