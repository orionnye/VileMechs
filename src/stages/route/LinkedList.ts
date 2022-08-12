import { Activity } from "../../Game";

class Stop<T> {
    public next: Stop<T> | null = null;
    public prev: Stop<T> | null = null;
    constructor(public data: T) {}
}

interface ILinkedList<T> {
    insertInBegin(data: T): Stop<T>;
    insertAtEnd(data: T): Stop<T>;
    deleteNode(node: Stop<T>): void;
    traverse(): T[];
    size(): number;
    search(comparator: (data: T) => boolean): Stop<T> | null;
}

export interface Post {
    title: Activity;
}

export default class LinkedList<T> implements ILinkedList<T> {
    private head: Stop<T> | null = null;
  
    public insertInBegin(data: T): Stop<T> {
        const node = new Stop(data);
        if (!this.head) {
            this.head = node;
        } else {
            this.head.prev = node;
            // node.next = this.head;
            this.head = node;
        }
        return node;
    }
    public insertAtEnd(data: T): Stop<T> {
        const node = new Stop(data);
        if (!this.head) {
            this.head = node;
        } else {
            const getLast = (node: Stop<T>): Stop<T> => {
                return node.next ? getLast(node.next) : node;
            };
    
          const lastNode = getLast(this.head);
          node.prev = lastNode;
          lastNode.next = node;
        }
        return node;
    }
    public deleteNode(node: Stop<T>): void {
        if (!node.prev) {
            this.head = node.next;
        } else {
            const prevNode = node.prev;
            prevNode.next = node.next;
        }
    }

    public traverse(): T[] {
        const array: T[] = [];
        if (!this.head) {
            return array;
        }
    
        const addToArray = (node: Stop<T>): T[] => {
            array.push(node.data);
            return node.next ? addToArray(node.next) : array;
        };
        return addToArray(this.head);
    }
    public size(): number {
        return this.traverse().length;
    }
    public search(comparator: (data: T) => boolean): Stop<T> | null {
        const checkNext = (node: Stop<T>): Stop<T> | null => {
          if (comparator(node.data)) {
            return node;
          }
          return node.next ? checkNext(node.next) : null;
        };
    
        return this.head ? checkNext(this.head) : null;
      }
}