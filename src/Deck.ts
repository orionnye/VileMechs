import Canvas from "./Canvas";
import Card from "./Card";
import { Vector } from "./math";


export default class Deck {
    cards: Card[]
    pos: Vector
    offset: Vector
    constructor() {
        this.cards = []
        this.pos = new Vector(0, 0)
        this.offset = new Vector(0, 0)
    }
    render(cv: Canvas) {
        this.cards.forEach((card, index) => {
            cv.drawRect( this.pos.add(this.offset.scale(index)), card.dimensions, card.color)
        })
    }
}