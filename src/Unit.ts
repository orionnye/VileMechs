import { randomFloor } from "./math/math"
import { Vector } from "./math/Vector"
import Matrix from "./math/Matrix"
import Input from "./Input"
import Graphics, { TextAlignX, TextAlignY } from "./Graphics"
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

    draw: Card[] = []
    hand: Card[] = []
    discard: Card[] = []

    constructor( pos ) {
        this.name = names[ randomFloor( names.length ) ]
        this.pos = pos
        this.speed = 4
        this.energy = 2
        this.color = "red"
        this.health = 10

        for ( let i = 0; i < 4; i++ )
            this.hand.push( new Card() )
        for ( let i = 0; i < 4; i++ )
            this.draw.push( new Card() )
        for ( let i = 0; i < 4; i++ )
            this.discard.push( new Card() )

    }

    render( offset = Vector.zero, animate = true, showName = true ) {
        let g = Graphics.instance
        let frame = animate ? getFrameNumber( 2, 2 ) : 0
        g.drawSheetFrame( mechSheet, 32, offset.x, offset.y, frame )

        if ( showName ) {
            g.c.shadowBlur = 0
            g.setFont( 3, "pixel" )
            let name = this.name
            const maxLength = 8
            if ( name.length > maxLength )
                name = name.slice( 0, maxLength - 3 ) + "..."
            g.drawTextBox( offset.addXY( 0, 32 ), name, { textColor: "#c2c2c2", boxColor: "#696969", alignY: TextAlignY.bottom } )
        }

        g.setFont( 4, "impact" )
        let healthText = this.health.toString().padStart( 2, "0" )
        let energyText = this.energy.toString().padStart( 2, "0" )
        let boxDims = g.drawTextBox( offset, healthText, { textColor: "#e8ac9e", boxColor: "#a84a32" } )
        // g.drawTextBox( offset.addXY( boxDims.x, 0 ), energyText, { textColor: "white", boxColor: "#32a852" } )
        g.drawTextBox( offset.addXY( boxDims.x, 0 ), energyText, { textColor: "#9cdbad", boxColor: "#2d8745" } )
    }


}