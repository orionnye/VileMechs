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

    static numberOfUnits = 4
    unitIndex = UI.numberOfUnits
    get hasUnitSelected() { return this.unitIndex !== UI.numberOfUnits }

    cardIndex: undefined | number
    retarget = false

    constructor() {
        window.addEventListener( "keydown", ( ev ) => {
            if ( ev.key == "Tab" ) {
                ev.preventDefault()
                this.cycleUnits()
                this.cardIndex = undefined
            }
            if ( ev.key == "Escape" ) {
                this.unitIndex = UI.numberOfUnits
            }
            if ( ev.key == "1" ) {
                this.cardIndex = 0;
            }
            if ( ev.key == "2" ) {
                this.cardIndex = 1;
            }
            if ( ev.key == "3" ) {
                this.cardIndex = 2;
            }
            if ( ev.key == "4" ) {
                this.cardIndex = 3;
            }
        } )
    }

    cycleUnits() {
        this.unitIndex++
        this.unitIndex %= ( UI.numberOfUnits + 1 )
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
        if ( !this.hasUnitSelected ) return null
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
        // cv.drawRect(new Vector(1, 36), new Vector(32, 130), "gray")

        // Unit Tray
        {
            // Units
            let index = 0
            for ( let unit of world.units ) {
                unit.render( cv, this.trayCellPosition( index ) )
                index++
            }

            // Highlight
            if ( this.hasUnitSelected ) {
                let highlightPos = this.trayCellPosition( this.unitIndex )
                cv.c.lineWidth = 1
                cv.c.strokeStyle = "red"
                cv.c.strokeRect( highlightPos.x + .5, highlightPos.y + .5, 31, 31 )
                cv.c.stroke()
            }
        }

        // Selected Unit's Deck
        let selected = this.getSelectedUnit( world )
        if ( selected ) {
            selected.hand.cards.forEach( ( card, index ) => {
                let { offset, pos } = selected.hand
                let selectedBump = new Vector( 0, 0 )
                if ( index == this.cardIndex ) {
                    selectedBump = new Vector( 0, -30 )
                }
                cv.drawRect( pos.add( offset.scale( index ) ).add( selectedBump ), card.dimensions, card.color )
            } )
        }
    }
}