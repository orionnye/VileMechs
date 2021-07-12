import { randomFloor } from "./math/math"
import { Vector } from "./math/Vector"
import Matrix from "./math/Matrix"
import Input from "./Input"
import Graphics from "./Graphics"
import names from "./names"
import { getFrameNumber, getImg } from "./utils"
import Card from "./Card"
import Game from "./Game"
import Scene, { SceneNode } from "./scene/Scene"

// const baseUnitImg = getImg( require( "../www/images/BaseEnemy.png" ) )
// const baseUnitImg = getImg( require( "../www/images/MinigunMech.png" ) )
const mechSheet = getImg( require( "../www/images/MinigunMech_sheet.png" ) )

export default class Unit {
    name: string
    pos: Vector
    speed: number
    energy: number
    color: string
    health: number

    cards: Card[] = []

    constructor( pos ) {
        this.name = names[ randomFloor( names.length ) ]
        this.pos = pos
        this.speed = 4
        this.energy = 2
        this.color = "red"
        this.health = 10

        for ( let i = 0; i < 4; i++ )
            this.cards.push( new Card() )
    }

    render( offset = Vector.zero, animate = true ) {
        let g = Graphics.instance
        let frame = animate ? getFrameNumber( 1, 2 ) : 1
        g.drawSheetFrame( mechSheet, 32, offset.x, offset.y, frame )

        //  Nametag
        g.c.shadowBlur = 0
        const fontSize = 3.5
        g.c.font = fontSize + "px pixel"

        let name = this.name
        const maxLength = 8
        if ( name.length > maxLength )
            name = name.slice( 0, maxLength - 3 ) + "..."

        let metrics = g.c.measureText( name )
        let textDims = new Vector( metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent )
        let textOffset = offset.add( new Vector( 1, 31 - textDims.y ) )
        g.drawRect( textOffset, textDims, "grey" )
        g.drawText( textOffset, fontSize, name, "black" )
    }
}