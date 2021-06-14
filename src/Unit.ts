import baseUnitSrc from "../www/images/BaseEnemy.png";
const baseUnitImg = new Image()
baseUnitImg.src = baseUnitSrc

import { randomFloor, Vector } from "./math";
import Input from "./Input";
import Canvas from "./Canvas";
import names from "./names";

export default class Unit {
    name: string;
    pos: Vector;
    speed: number;
    energy: number;
    color: string;
    health: number;

    constructor( pos ) {
        // this.name = "Igor Von Hefty Jhonson";
        this.name = names[ randomFloor( names.length ) ]
        this.pos = pos;
        this.speed = 4;
        this.energy = 2;
        this.color = "red";
        this.health = 10;
        //card stats test
    }
    validMove( index ) {
        let { pos, speed } = this;
        if ( pos.subtract( index ).length <= speed )
            return true
        return false
    }
    move( index ) {
        if ( this.validMove( index ) )
            this.pos = new Vector( index.x, index.y );
    }
    render( cv: Canvas, offset = Vector.zero ) {
        cv.c.drawImage( baseUnitImg, offset.x, offset.y )

        //  Nametag
        {
            cv.c.shadowBlur = 0
            const fontSize = 3.5
            cv.c.font = fontSize + "px pixel";

            let name = this.name
            const maxLength = 8
            if ( name.length > maxLength )
                name = name.slice( 0, maxLength - 3 ) + "..."

            let metrics = cv.c.measureText( name )
            let textDims = new Vector( metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent )
            let textOffset = offset.add( new Vector( 1, 31 - textDims.y ) )
            cv.drawRect( textOffset, textDims, "grey" )
            cv.drawText( textOffset, fontSize, name, "black" )
            // cv.drawRect(new Vector(200, 200), new Vector(100, 100), this.hand.cards[0].color)
            // this.renderCards( cv )
        }
    }
}