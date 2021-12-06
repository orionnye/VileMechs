import Card from "./Card";
import Game from "../Game"
import { Vector } from "../math/Vector";
import CardTypes, { CardType } from "../CardTypes";

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
    typeCount( type: CardType ) {
        let count = 0
        this.cards.forEach( card => {
            if (card.type == type) {
                count += 1
            }
        })
        return count
    }
    insertAt( card, index ) {
        if ( this.length == 0 ) {
            this.cards.push( card )
            return
        }
        let store = this.cards[ index ]
        this.cards[ index ] = card
        this.cards.push( store )
    }
    insertAtRandom( card ) {
        let random = Math.floor( Math.random() * this.length )
        this.insertAt( card, random )
    }
    add( cardType: CardType, count: number = 1 ) {
        for ( let i = 0; i < count; i++ ) {
            let card = new Card(cardType)
            this.insertAtRandom(card)
        }
    }
    fill( that: Deck, amount: number = this.length ) {
        let { cards } = this
        // console.log("Requested:", amount, "available:", this.length)
        if (amount > this.length) {
            amount = this.length
        }
        for ( let i = 0; i < amount; i++ ) {
            // console.log("amount:", amount, "i:", i)
            if (that.length < amount) {
                let card = <Card> cards.pop()
                console.log("pushed:", card.type.name)
                that.cards.push( card )
            }
        }
    }
    cardPosition( cardIndex: number ) {
        let { pos, offset } = this
        return pos.addXY( cardIndex * offset.x , cardIndex * offset.y )
    }
}