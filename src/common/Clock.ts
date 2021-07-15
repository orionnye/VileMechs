import { lerp } from "../math/math"

export default class Clock {
    static instance: Clock
    lastFrame: number
    averageFPS: number
    dt: number
    constructor() {
        Clock.instance = this
        this.lastFrame = performance.now()
        this.averageFPS = 0
        this.dt = 16
    }
    nextFrame() {
        let now = performance.now()
        let dt = now - this.lastFrame
        this.dt = dt
        this.lastFrame = now
        if ( dt != 0 ) {
            let FPS = 1000 / dt
            this.averageFPS = lerp( this.averageFPS, FPS, 0.04 )
        }
        return dt
    }
}