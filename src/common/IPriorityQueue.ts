export default interface IPriorityQueue<T> {
    enqueue( value: T, key: number ): void
    popMin(): T | undefined
    empty(): boolean
}