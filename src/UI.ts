import UISrc from "../www/images/UI.png";
const UIImg = new Image()
UIImg.src = UISrc

import Canvas from "./Canvas";
import Input from "./Input";
import { Vector } from "./math";
import World from "./World";

const unitTrayBase = new Vector( 1, 36 )
const unitTrayStride = 33

export default class UI {

    unitIndex = 0

    constructor() {
        window.addEventListener( "keydown", ( ev ) => {
            if ( ev.key == "Tab" ) {
                ev.preventDefault()
                this.unitIndex++
                this.unitIndex %= 4
            }
        } )
    }

    trayCellPosition( index: number ) {
        return unitTrayBase.add( new Vector( 0, unitTrayStride * index ) )
    }

    render( cv: Canvas, world: World ) {
        cv.c.drawImage( UIImg, 0, 0 )

        // Unit Tray
        {
            // Units
            let index = 0
            for ( let unit of world.units ) {
                unit.render( cv, this.trayCellPosition( index ) )
                index++
            }

            // Highlight
            let highlightPos = this.trayCellPosition( this.unitIndex )
            cv.c.lineWidth = 1
            cv.c.strokeStyle = "red"
            cv.c.strokeRect( highlightPos.x + .5, highlightPos.y + .5, 31, 31 )
            cv.c.stroke()
        }

    }
}