import Graphics from "./Graphics";
import Card from "./Card";
import { Vector } from "./math";


export default class Deck {
    cards: Card[]
    pos: Vector
    offset: Vector
    constructor() {
        this.cards = []
        this.pos = new Vector( 0, 0 )
        this.offset = new Vector( 0, 0 )
    }
    render( g: Graphics ) {
        this.cards.forEach( ( card, index ) => {
            g.drawRect( this.pos.add( this.offset.scale( index ) ), card.dimensions, card.color )
        } )
    }
}