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
    addCard(card) {
        if (this.cards.length < this.max) {
            this.cards.push(card);
        }
    }
    addCards( cards ) {
        cards.forEach(card => {
            this.addCard(card);
        });
    }
    addCardsatRandom(cards) {
        cards.forEach(card => {
            this.insertAtRandom(card);
        });
    }

    removeCards(desired) {
        let count = desired > this.length ? this.length : desired;
        let cards: Card[] = [];
        for (let i = 0; i < count; i++) {
            cards.push(this.cards.pop()!)
        }
        return cards;
    }
    emptyInto(deck: Deck) {
        if (this.length > 0) {
            deck.addCards(this.removeCards(this.length));
        } else {
            console.log("Deck already empty:", deck)
        }
    }

    fillFrom(deck: Deck) {
        let {max, length} = this;
        if (length < max) {
            // console.log("Filling Hand");
            let drawTotal = length == max ? max : max - length;
            this.addCards(deck.removeCards(drawTotal));
        } else {
            console.log("already full:", deck)
        }
    }
    fillTill(deck: Deck, cap: number = this.length) {
        let { length } = this;
        cap = cap < this.max ? cap : this.max
        if (length < cap) {
            console.log("Filling Hand");
            let drawTotal = length == cap ? cap : cap - length;
            this.addCards(deck.removeCards(drawTotal));
        } else {
            console.log("Already full:", deck)
        }
    }
    drawTill(that: Deck, amount: number) {
        if (amount > that.length) {
            amount = that.length
        }
        for (let i = 0; i < amount; i++) {
            if (that.cards.length > 0) {
                let card = that.cards.pop()!
                this.cards.push(card)
            }
        }
    }
    cardPosition( cardIndex: number ) {
        let { pos, offset } = this
        return pos.addXY( cardIndex * offset.x , cardIndex * offset.y )
    }
}