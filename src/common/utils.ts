import { lerp } from "../math/math"

export function getImg( src: string ) {
    let result = new Image()
    result.src = src
    return result
}

export function randomColor() {
    let nums = [
        ( Math.random() * 256 ) | 0,
        ( Math.random() * 256 ) | 0,
        ( Math.random() * 256 ) | 0,
    ]
    return "#" + nums.map( x => x.toString( 16 ).padStart( 2, "0" ) ).join( "" )
}

export function getFrameNumber( fps: number, numberOfFrames = Infinity, time = performance.now() / 1000 ) {
    return Math.floor( time * fps ) % numberOfFrames
}

export function arrayArgMin<T>( array: T[], func: ( T ) => number ) {
    let minElem: T | null = null
    let minValue = Infinity
    let minIndex: number | null = null
    for ( let i = 0; i < array.length; i++ ) {
        let elem = array[ i ]
        let value = func( elem )
        if ( value < minValue ) {
            minElem = elem
            minValue = value
            minIndex = i
        }
    }
    return { element: minElem, value: minValue, index: minIndex }
}

export function flash( period: number, phase: number, min: number, max: number ) {
    let t = performance.now()
    let u = t / period + phase
    let alpha = ( Math.cos( u ) + 1 ) / 2
    return lerp( min, max, alpha )
}