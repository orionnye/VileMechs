import { Vector } from "./math"
import Unit from "./Unit";

export class Card {
    pos : Vector;
    size : Vector;
    cost : number;
    r : number;
    g : number;
    b : number;
    onApply : any;

    constructor(red = 0, green = 0, blue = 0, pos = new Vector(0, 0)) {
        this.pos = pos;
        this.size = new Vector(45, 60);
        this.r = red;
        this.g = green;
        this.b = blue;
        this.onApply;
    }
    apply(caster: Unit, target: Unit) {
        if (this.onApply == undefined) {
            console.log(`default color: ${this.r}, ${this.g}, ${this.b}`);
        } else {
            this.onApply(caster, target);
        }
    }
    contains(point) {
        let far = this.pos.add(this.size)
        if (point.x >= this.pos.x && point.x <= far.x) {
            if (point.y >= this.pos.y && point.y <= far.y) {
                return true
            }
            return false
        }
        return false
    }
    seek(point) {
        let dist = point.subtract(this.pos)
        if (point.subtract(this.pos).length > 3) {
            let fix = dist.multiply(0.1)
            this.pos = this.pos.add(fix)
        }
    }
    render(pos = new Vector(0, 0)) {
        let color = `rgb(${this.r}, ${this.g}, ${this.b})`
        drawRect(this.pos.add(pos), this.size, color);
    }
}
