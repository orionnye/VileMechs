import { Vector } from "../math/Vector"

export default class Input {
    static instance: Input
    keys: Map<string, boolean>
    codes: Map<string, boolean>
    mouse: Map<number, boolean>
    cursor: Vector
    constructor() {
        Input.instance = this

        this.keys = new Map()
        this.codes = new Map()
        this.mouse = new Map()
        this.cursor = new Vector( 0, 0 )

        window.addEventListener( "mousedown", e => this.mouse.set( e.button, true ) )
        window.addEventListener( "mouseup", e => this.mouse.set( e.button, false ) )
        window.addEventListener( "keydown", e => {
            this.keys.set( e.key.toLowerCase(), true )
            this.codes.set( e.code, true )
        } )
        window.addEventListener( "keyup", e => {
            this.keys.set( e.key.toLowerCase(), false )
            this.codes.set( e.code, false )
        } )
        window.addEventListener( "mousemove", e => this.cursor = new Vector( e.x, e.y ) )
    }
}