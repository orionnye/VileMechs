import { Vector } from "../math/Vector"

export default class SparseGrid<T> {
    content: { [ name: string ]: T }
    defaultValue: T
    constructor( defaultValue: T ) {
        this.content = {}
        this.defaultValue = defaultValue
    }
    set( pos: Vector, value: T ) {
        if ( value === undefined )
            this.clear( pos )
        this.content[ pos.toString() ] = value
    }
    get( pos: Vector ) {
        return this.content[ pos.toString() ]
    }
    clear( pos: Vector ) {
        delete this.content[ pos.toString() ]
    }
    entries() {
        return Object.values( this.content )
    }
}