import Card from "./Card";
import { Vector } from "./math/Vector";

export default class Deck {
    offset: Vector;
    cards: Card[];
    max: number;
    constructor(pos = new Vector(0, 0), offset = new Vector(100, 100), cards = []) {
        this.offset = offset;
        this.cards = cards;
        this.max = 50;
    }
    get length() {
        return this.cards.length;
    }
    getRandomCards(count: number) {
        for (let i = 0; i < count; i++) {
            let card = new Card();
            this.addCard(card);
        }
    }
    addCard(card) {
        if (this.cards.length < this.max)
            this.cards.push(card);
    }
    addCards(cards) {
        cards.forEach(card => {
            this.addCard(card);
        });
    }
    // removeCards(desired) {
    //     let count = desired > this.length ? this.length : desired;
    //     let cards = [];
    //     for (let i = 0; i < count; i++) {
    //         // cards.push(this.cards.pop());
    //     }
    //     return cards;
    // }
    // emptyInto(deck: Deck) {
    //     if (this.length > 0) {
    //         deck.addCards(this.removeCards(this.length));
    //     } else {
    //         console.log()
    //     }
    // }
    // fillFrom(deck: Deck) {
    //     let {max, length} = this;
    //     if (length < max) {
    //         console.log("Filling Hand");
    //         let drawTotal = length == max ? max : max - length;
    //         this.addCards(deck.removeCards(drawTotal));
    //     } else {
    //         console.log("already full")
    //     }
    // }
}
