import { Vector } from './math';
import Unit from './Unit';
// import { fillRectCenter, strokeRect, drawText } from "./render";

export default class Card {

    size : Vector;
    scale : number;
    pos : Vector;
    cost : number;
    onApply : any;
    color : string;

    constructor() {
        this.size = new Vector(3/4, 1);
        this.scale = 60;
        this.pos = new Vector(0, 0);
        this.cost = 0;
        //!!!!!!!!!!!!!!THING WE CAN WATCH FOR!!!!!!!!!!!!!!!!!!!!
        //since there will only be one enemy at a time we can hard code the characters here
        this.onApply;
        this.color = `rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`;
    }
    get dimensions() {
        return this.size.scale(this.scale);
    }
    contains(point: Vector) {
        let far = this.pos.add(this.size);
        if (point.x >= this.pos.x && point.x <= far.x) {
            if (point.y >= this.pos.y && point.y <= far.y) {
                return true
            }
            return false
        }
        return false
    }
    seek(point) {
        let dist = point.subtract(this.pos);
        if (point.subtract(this.pos).length > 3) {
            let fix = dist.multiply(0.1);
            this.pos = this.pos.add(fix);
        }
    }
    apply() {
        if (this.onApply == undefined) {
            console.log("no card function found")
        } else {
            this.onApply();
        }
    }
    // render( destination : Vector ) {
    //     let adjustedPos = this.pos.add(destination);
    //     fillRectCenter(adjustedPos, this.size.scale(this.scale), this.color);
    //     drawText(adjustedPos.subtract(new Vector(48, 40)), this.scale / 2, this.cost.toString(), "white");
    // }
}