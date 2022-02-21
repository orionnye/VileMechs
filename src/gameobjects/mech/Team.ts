import Graphics from "../../common/Graphics";
import Scene, { SceneNode } from "../../common/Scene";
import Game from "../../Game";
import World from "../../map/World";
import Matrix from "../../math/Matrix";
import { Vector } from "../../math/Vector";
import { Chrome } from "./RigTypes";
import Unit from "./Unit";

export default class Team {
    index = -1
    hasUnitSelected = false

    name: string
    flipUnits: boolean

    units: Unit[]
    playable = true

    scene: SceneNode = { localMatrix: Matrix.identity }

    constructor(name: string, flip: boolean = false, teamNumber: number) {
        this.name = name
        this.flipUnits = flip

        this.units = [
            new Chrome( new Vector( 1, 0 ), teamNumber),
            new Chrome( new Vector( 2, 0 ), teamNumber),
            new Chrome( new Vector( 3, 0 ), teamNumber),
            // new Flesh( new Vector( 0, 1 ), 0 ),
            // new Treant( new Vector( 0, 0 ), 0 ),
            // new Jelly( new Vector( 0, 0 ), 0 )
        ]
    }
    //----DATA ACCESS----
    setUnitIndex( index: number ) {
        this.hasUnitSelected = index > -1
        this.index = index
        // this.onSelectUnit()
    }

    deselect() {
        this.hasUnitSelected = false
        this.index = -1
    }

    toggleSelectIndex( index: number ) {
        if ( this.hasUnitSelected && index == this.index )
            this.deselect()
        else
            this.setUnitIndex( index )
    }

    toggleSelectUnit( unit: Unit ) {
        let index = this.units.indexOf( unit )
        this.toggleSelectIndex( index )
    }

    numberOfUnits() {
        return this.units.length
    }

    cycleUnits() {
        if ( !this.hasUnitSelected )
            this.setUnitIndex( 0 )
        else
            this.setUnitIndex( ( this.index + 1 ) % this.numberOfUnits() )
    }

    selectUnit( unit: Unit ) {
        let units = this.units
        let index = units.indexOf( unit )
        if ( index > -1 ) {
            this.setUnitIndex( index )
        }
    }

    selectedUnit() {
        let units = this.units
        if ( !this.hasUnitSelected ) return undefined
        return units[ this.index ]
    }
    getUnit( pos: Vector ) {
        for ( let unit of this.units )
            if ( unit.pos.equals( pos ) )
                return unit
    }

    endTurn() {
        this.units.forEach(unit => {
            unit.statCap()
        })
        this.deselect()
    }

    update() {
        this.units = this.units.filter( unit => unit.health > 0 )
        for ( let unit of this.units )
            unit.update()
    }


    makeSceneNode(active = false) {
        let game = Game.instance
        let g = Graphics.instance
        let { units, flipUnits } = this
        let selectedUnit = this.selectedUnit()
        let tileSize = World.tileSize

        this.scene = Scene.node( {
            description: this.name,
            localMatrix: Matrix.identity,
            content: () => {
                units.forEach( ( unit, i ) => {
                    Scene.node( {
                        description: unit.name,
                        localMatrix: Matrix.vTranslation( unit.pos.scale( tileSize ) ),
                        rect: { width: tileSize, height: tileSize },
                        onClick: () => {
                            this.toggleSelectUnit( unit )
                        },
                        onRender: ( node ) => {
                            let hover = node == game.mouseOverData.node
                            let isSelected = unit == selectedUnit
                            //Selected? Art
                            if (active) {
                                if (this.index == i) {
                                    g.c.scale(1.2, 1.2)
                                    g.c.translate(-3, -3)
                                    g.drawRect(new Vector(0, 0), new Vector(tileSize, tileSize), "rgba(255, 255, 255, 0.4)")
                                }
    
                                if ( isSelected && !unit.isWalking() ) {
                                    g.c.shadowBlur = 10
                                    g.c.shadowColor = "black"
                                }
                            }
                            //Standard rendering
                            unit.render( true, flipUnits )
                        }
                    } )
                } )
            }
        } )
    }
}