import Graphics from "./Graphics"
import Game from "./Game"
import { Vector } from "./math/Vector"
import Unit from "./Unit"
import World from "./World"
import Matrix from "./math/Matrix"
import Scene, { SceneNode } from "./scene/Scene"

export default class UnitTray {
    private index = 0
    private hasUnitSelected = false

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
        this.hasUnitSelected = true
        this.index = index
        Game.instance.onSelectUnit()
    }

    deselectUnit() {
        this.hasUnitSelected = false
        Game.instance.onSelectUnit()
    }

    toggleSelectIndex( index: number ) {
        if ( this.hasUnitSelected && index == this.index )
            this.deselectUnit()
        else
            this.setUnitIndex( index )
    }

    numberOfUnits() {
        return Game.instance.playerUnits().length
    }

    private cycleUnits() {
        if ( !this.hasUnitSelected )
            this.setUnitIndex( 0 )
        else
            this.setUnitIndex( ( this.index + 1 ) % this.numberOfUnits() )
    }

    selectUnit( unit: Unit ) {
        let units = Game.instance.playerUnits()
        let index = units.indexOf( unit )
        if ( index > -1 ) {
            this.setUnitIndex( index )
        }
    }

    selectedUnit() {
        let units = Game.instance.playerUnits()
        if ( !this.hasUnitSelected ) return undefined
        return units[ this.index ]
    }

    makeSceneNode() {
        let game = Game.instance
        let units = game.playerUnits()
        let selectedUnit = this.selectedUnit()
        let g = Graphics.instance
        const unitTrayStride = World.tileSize + 1
        let width = World.tileSize
        let height = unitTrayStride * this.numberOfUnits()

        let { startNode, endNode } = Scene
        startNode( {
            description: "unit-tray",
            localMatrix: Matrix.translation( 0, 32 ),
            rect: { width, height },
            onRender: () => g.drawRect( new Vector( -1, -1 ), new Vector( width + 2, height + 1 ), "#595959" )
        } )
        units.forEach( ( unit, i ) => {
            startNode( {
                description: "tray-unit",
                localMatrix: Matrix.translation( 0, unitTrayStride * i ),
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
            } )
            endNode()
        } )
        endNode()
    }

}