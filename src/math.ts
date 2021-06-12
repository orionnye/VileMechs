export class Vector {
    x: number
    y: number
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    subtract(that: Vector) {
        return new Vector(this.x - that.x, this.y - that.y)
    }
    add(that: Vector) {
        return new Vector(this.x + that.x, this.y + that.y)
    }
    cross(that: Vector) {
        return new Vector(this.x * that.x, this.y * that.y)
    }
    scale(that: number) {
        return new Vector(this.x * that, this.y * that)
    }
    get length() {
        let dist = Math.sqrt(this.x**2 + this.y**2)
        return dist
    }
}
export function randomFloor(upperLimit: number) {
    return Math.floor(Math.random()*upperLimit);
}