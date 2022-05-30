import IPriorityQueue from "./IPriorityQueue"
import { arrayArgMin } from "./utils"

export default class PriorityQueueNaive<T> implements IPriorityQueue<T> {
    data: [ T, number ][] = []
    enqueue( value: T, key: number ) {
        this.data.push( [ value, key ] )
    }
    popMin() {
        let minEntry = arrayArgMin( this.data, entry => entry[ 1 ] )
        if ( minEntry.index !== null ) {
            this.data.splice( minEntry.index, 1 )
            if ( minEntry.element )
                return minEntry.element[ 0 ]
        }
    }
    empty() {
        return this.data.length == 0
    }
}

// let queue = new PriorityQueueNaive<number>()
// for ( let i = 0; i < 20; i++ ) {
//     let value = Math.random() * 10
//     queue.enqueue( value, value )
// }
// while ( true ) {
//     if ( queue.empty() )
//         break
//     let value = queue.popMin()
//     console.log( value )
// }