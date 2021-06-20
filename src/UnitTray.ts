import Graphics from "./Graphics";
import Game from "./Game";
import { contains2D } from "./math/math";
import { Vector } from "./math/Vector";
import Unit from "./Unit";
import World from "./World";
import Matrix from "./math/Matrix";
import { SceneNode } from "./scene/Scene";

const unitTrayBase = new Vector( 1, 36 )
const unitTrayStride = 33

export default class UnitTray {
    static numberOfUnits = 4
    private unitIndex = UnitTray.numberOfUnits
    private get hasUnitSelected() { return this.unitIndex !== UnitTray.numberOfUnits }

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
        this.unitIndex = index
        let selectedUnit = this.getSelectedUnit()
        if ( selectedUnit )
            Game.instance.setCameraTarget( selectedUnit.pos.scale( World.tileSize ) )
    }

    toggleSelectIndex( index: number ) {
        if ( index == this.unitIndex )
            this.deselectUnit()
        else
            this.setUnitIndex( index )
    }

    deselectUnit() {
        this.setUnitIndex( UnitTray.numberOfUnits )
    }

    private cycleUnits() {
        this.setUnitIndex( ( this.unitIndex + 1 ) % ( UnitTray.numberOfUnits + 1 ) )
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
        return units[ this.unitIndex ]
    }

    private trayCellPosition( index: number ) {
        return unitTrayBase.add( new Vector( 0, unitTrayStride * index ) )
    }

    render() {
        let g = Graphics.instance
        // Units
        let units = Game.instance.world.units
        let index = 0
        for ( let unit of units ) {
            unit.render( this.trayCellPosition( index ) )
            index++
        }
        // Highlight
        if ( this.hasUnitSelected ) {
            let highlightPos = this.trayCellPosition( this.unitIndex )
            g.c.lineWidth = 1
            g.c.strokeStyle = "red"
            g.c.strokeRect( highlightPos.x + .5, highlightPos.y + .5, 31, 31 )
            g.c.stroke()
        }
    }

    addSceneNodes( scene: any ) {
        let game = Game.instance
        let units = game.world.units
        for ( let i = 0; i < units.length; i++ ) {
            let pos = this.trayCellPosition( i )
            scene.children.push( {
                mat: Matrix.translation( pos.x, pos.y ),
                rect: { width: World.tileSize, height: World.tileSize },
                onClick: ( node: SceneNode ) => this.toggleSelectIndex( i ),
                color: "blue"
            } )
        }
    }

}