import Card from "./Card";
import Game from "../Game"
import { Vector } from "../math/Vector";

export class Deck {

    max: number = 69
    cards: Card[] = []
    pos: Vector
    offset: Vector
    constructor( total: number = 0 ) {

        this.pos = Vector.zero
        this.offset = new Vector(1, 1)

        for ( let i = 0; i < total; i++ ) {
            let card = new Card()
            this.cards.push( card )
        }
    }

    get length() {
        return this.cards.length
    }

    fill( that: Deck ) {
        let { cards } = this
        for ( let i = cards.length; i > 0; i-- ) {
            if (that.length < that.max) {
                let card = <Card> cards.pop()
                that.cards.push( card )
            }
        }
    }
    cardPosition( cardIndex: number ) {
        let { pos, offset } = this
        return pos.addXY( cardIndex * offset.x , cardIndex * offset.y )
    }
}