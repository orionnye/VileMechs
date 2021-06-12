import { Vector } from "./math";
import Input from "./Input";
import { Deck } from "./card";

export default class Character {
    name : string;
    pos : Vector;
    speed : number;
    energy : number;
    color : string;
    health : number;
    hand: Deck;
    draw: Deck;
    discard: Deck;

    constructor(pos) {
        this.name = "Igor Von Hefty Jhonson";
        this.pos = pos;
        this.speed = 4;
        this.energy = 2;
        this.color = "red";
        this.health = 10;
        //card stats test
        this.draw = new Deck(new Vector(10, 470), new Vector(1, 1));
        this.hand = new Deck(new Vector(300, 430), new Vector(70, 0));
        this.discard = new Deck(new Vector(800, 470), new Vector(2, 1));
        this.draw.getRandomCards(10);
        this.hand.max = 3;
    }
    endTurn() {
        let { draw, hand, discard } = this;
        hand.emptyInto(discard);
        //draw
        hand.addCards(draw.removeCards(hand.max));
        if (draw.cards.length == 0) {
            discard.emptyInto(draw);
            draw.shuffle();
            if (hand.cards.length < hand.max) {
                let missing = hand.max - hand.cards.length;
                hand.addCards(draw.removeCards(missing));
            }
        }
    }
    validMove(index) {
        let { pos, speed } = this;
        if (pos.subtract(index).length <= speed)
            return true
        return false
    }
    move(index) {
        if (this.validMove(index))
            this.pos = new Vector(index.x, index.y);
    }
    renderCards(pos : Vector = new Vector(0, 0)) {
        this.draw.render(pos);
        this.hand.render(pos);
        this.discard.render(pos);
    }
}