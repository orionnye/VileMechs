import { Vector } from "./math"
import Tile from "./tile"

export default class Grid {
    pos: Vector
    size: Vector
    content: any[]
    width: number
    height: number
    wall: number
    empty: number
    constructor(width, height, size = new Vector(100, 100)) {
        this.pos = new Vector(0, 0)
        this.size = size
        this.width = width
        this.height = height
        this.content = []
        for (let r = 0; r < this.height; r++) {
            this.content.push([])
            for (let c = 0; c < this.width; c++) {
                this.content[r].push(new Tile(this.empty))
            }
        }
        //temporary fixed numbers
        this.wall = 1
        this.empty = 0
    }
    get tileSize() {
        return (new Vector(this.size.x / this.width, this.size.y / this.height))
    }
    randomize(blockChance: number) {
        //TEMPORARY PLACEHOLDER NUMBER
        this.content.forEach((row, IRow) => {
            row.forEach((tile, ICol) => {
            let currentPos = new Vector(ICol, IRow)
            let isBlock = Math.random() < blockChance
            if (isBlock)
                this.set(currentPos, this.wall)
            })
        })
    }
    set(pos: Vector, value) {
        if (pos.y >= this.height || pos.x >= this.width)
            console.error("tried setting value on grid that does not exist")
        this.content[pos.y][pos.x].content = value
    }
    setBlock(pos: Vector, size: Vector, value) {
        if (pos.y >= this.height || pos.x >= this.width)
            console.error("tried setting value on grid that does not exist")
        if (pos.y + size.y >= this.height || pos.x + size.x >= this.width)
            console.error("tried setting value on grid that does not exist")
        for (let r = pos.y; r < pos.y + size.y; r++) {
            for (let c = pos.x; c < pos.x + size.x; c++) {
                this.content[r][c].content = value
            }
        }
    }
    containsCell(point: Vector) {
        if (point.x >= 0 && point.x < this.width) {
            if (point.y >= 0 && point.y < this.height) {
                return true
            }
            return false
        }
        return false
    }
    pick(cursor: Vector) {
        //+distance from gridPOS divided by total cells in that direction and math.floored
        // if (!this.contains(cursor)) {
        //     console.error("tried picking a non-existant cell:", cursor)
        // }
        let cellSize = new Vector(this.size.x / this.width, this.size.y / this.height)
        let pickedX = Math.floor((cursor.x - this.pos.x) / cellSize.x)
        let pickedY = Math.floor((cursor.y - this.pos.y) / cellSize.y)
        let picked = new Vector(pickedX, pickedY)
        return picked
    }

}