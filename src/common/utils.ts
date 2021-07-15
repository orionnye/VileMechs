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