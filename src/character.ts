import { Vector } from "./math";
import Input from "./input";
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
        this.draw = new Deck(new Vector(10, 400), new Vector(4, 1));
        this.draw.getRandomCards(3);
        this.hand = new Deck(new Vector(300, 400), new Vector(70, 0));
        this.hand.max = 3;
        //card stats test
        this.discard = new Deck(new Vector(850, 400), new Vector(4, 1));
        this.draw.getRandomCards(10);
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
}