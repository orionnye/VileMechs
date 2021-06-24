import Graphics from "./Graphics"
import Game from "./Game"
import { contains2D } from "./math/math"
import { Vector } from "./math/Vector"
import Unit from "./Unit"
import World from "./World"
import Matrix from "./math/Matrix"
import { SceneNode } from "./scene/Scene"

const unitTrayBase = new Vector( 1, 36 )
const unitTrayStride = 33

export default class UnitTray {
    static numberOfUnits = 4
    private index = UnitTray.numberOfUnits
    private get hasUnitSelected() { return this.index !== UnitTray.numberOfUnits }

    constructor() {
        window.addEventListener( "keydown", ( ev ) => {
            if ( ev.key == "Tab" ) {
                ev.preventDefault()
                this.cycleUnits()
            }
            if ( ev.key == "Escape" ) {
                this.deselectUnit()
            }
        } )
    }

    setUnitIndex( index: number ) {
        this.index = index
        let selectedUnit = this.getSelectedUnit()
        if ( selectedUnit )
            Game.instance.setCameraTarget( selectedUnit.pos.scale( World.tileSize ) )
    }

    toggleSelectIndex( index: number ) {
        if ( index == this.index )
            this.deselectUnit()
        else
            this.setUnitIndex( index )
    }

    deselectUnit() {
        this.setUnitIndex( UnitTray.numberOfUnits )
    }

    private cycleUnits() {
        this.setUnitIndex( ( this.index + 1 ) % ( UnitTray.numberOfUnits + 1 ) )
    }

    selectUnit( unit: Unit ) {
        let units = Game.instance.world.units
        let index = units.indexOf( unit )
        if ( index > -1 ) {
            this.setUnitIndex( index )
        }
    }

    getSelectedUnit() {
        let units = Game.instance.world.units
        if ( !this.hasUnitSelected ) return null
        return units[ this.index ]
    }

    sceneNode(): SceneNode {
        let game = Game.instance
        let units = game.world.units
        let selectedUnit = this.getSelectedUnit()
        let g = Graphics.instance
        return {
            description: "unit-tray",
            transform: Matrix.vTranslation( unitTrayBase ),
            rect: { width: World.tileSize, height: unitTrayStride * 4 },
            children: units.map(
                ( unit, i ) => {
                    return {
                        description: "tray-unit",
                        transform: Matrix.translation( 0, unitTrayStride * i ),
                        rect: { width: World.tileSize, height: World.tileSize },
                        color: "blue",
                        onClick: () => this.toggleSelectIndex( i ),
                        onRender: () => {
                            unit.render( Vector.zero )
                            if ( selectedUnit == unit ) {
                                g.c.lineWidth = 1
                                g.c.strokeStyle = "red"
                                g.c.strokeRect( .5, .5, 31, 31 )
                                g.c.stroke()
                            }
                        }
                    }
                }
            )
        }
    }

}