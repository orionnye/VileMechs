import UISrc from "../www/images/UI.png";
const UIImg = new Image()
UIImg.src = UISrc

import Canvas from "./Canvas";
import Game from "./Game";
import Input from "./Input";
import { Vector } from "./math";
import Unit from "./Unit";
import World from "./World";

const unitTrayBase = new Vector( 1, 36 )
const unitTrayStride = 33

export default class UI {

    unitIndex = 0
    retarget = false

    constructor() {
        window.addEventListener( "keydown", ( ev ) => {
            if ( ev.key == "Tab" ) {
                ev.preventDefault()
                this.cycleUnits()
            }
        } )
    }

    cycleUnits() {
        this.unitIndex++
        this.unitIndex %= 4
        this.retarget = true
    }

    selectUnit( world: World, unit: Unit ) {
        let index = world.units.indexOf( unit )
        if ( index > -1 ) {
            this.unitIndex = index
            this.retarget = true
        }
    }

    getSelectedUnit( world: World ) {
        return world.units[ this.unitIndex ]
    }

    trayCellPosition( index: number ) {
        return unitTrayBase.add( new Vector( 0, unitTrayStride * index ) )
    }

    update( game: Game ) {
        if ( this.retarget ) {
            let selectedUnit = this.getSelectedUnit( game.world )
            if ( selectedUnit )
                game.setCameraTarget( selectedUnit.pos.scale( World.tileSize ) )
            this.retarget = false
        }
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