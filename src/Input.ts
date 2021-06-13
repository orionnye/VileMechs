import { Vector } from "./math"

export default class Input {
    keys: Map<string, boolean>
    mouse: Map<number, boolean>
    cursor: Vector
    constructor() {
        this.keys = new Map();
        this.mouse = new Map();
        this.cursor = new Vector( 0, 0 );

        this.watchCursor()
        this.watchMouse()
        this.watchKeys()
    }

    setKeyTrue( e: KeyboardEvent ) {
        this.keys.set( e.key.toLowerCase(), true );
    }
    setKeyFalse( e: KeyboardEvent ) {
        this.keys.set( e.key.toLowerCase(), false );
    }
    setMouse( button: number, value: boolean ) {
        this.mouse.set( button, value );
    }
    setCursor( newPoint: Vector ) {
        this.cursor = newPoint;
    }
    watchKeys() {
        console.log( "starting key watch" );
        window.addEventListener( "keydown", ( e ) => this.setKeyTrue( e ) );
        window.addEventListener( "keyup", ( e ) => this.setKeyFalse( e ) );
    }
    watchMouse() {
        console.log( "starting mouse watch" )
        window.addEventListener( "mousedown", ( e ) => this.setMouse( e.button, true ) );
        window.addEventListener( "mouseup", ( e ) => this.setMouse( e.button, false ) );
    }
    watchCursor() {
        console.log( "starting cursor watch" );
        window.addEventListener( "mousemove", ( e ) => this.setCursor( new Vector( e.x, e.y ) ) );
    }
}