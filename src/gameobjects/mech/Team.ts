import Graphics from "../../common/Graphics";
import Scene, { SceneNode } from "../../common/Scene";
import Game from "../../Game";
import World from "../../stages/Match";
import Matrix from "../../math/Matrix";
import { Vector } from "../../math/Vector";
import UnitTray, { drawStats } from "../ui/UnitTray";
import { Chrome, Earth } from "./RigTypes";
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
            // new Chrome( new Vector( 3, 0 ), 1),
            // new Flesh( new Vector( 0, 1 ), 1 ),
            // new Treant( new Vector( 0, 0 ), 1 ),
            // new Jelly( new Vector( 0, 0 ), 1 )
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
            //resets speed
            unit.speed = unit.maxSpeed
        })
        this.deselect()
    }
    startTurn() {
        this.units.forEach(unit => {
            unit.energy = unit.maxEnergy
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
        let world = game.world
        let g = Graphics.instance
        let { units, flipUnits } = this
        let selectedUnit = this.selectedUnit()
        let tileSize = World.tileSize

        this.scene = Scene.node( {
            description: this.name,
            localMatrix: Matrix.identity,
            content: () => {
                units.forEach( ( unit, i ) => {
                    let isHovered = false
                    Scene.node( {
                        description: unit.name,
                        localMatrix: Matrix.vTranslation( unit.pos.scale( tileSize ) ),
                        rect: { width: tileSize, height: tileSize },
                        onClick: () => {
                            if (game.world.playerTurn()) {
                                this.toggleSelectUnit( unit )
                            }
                        },
                        onRender: ( node ) => {
                            let hover = node == game.mouseOverData.node
                            let isSelected = unit == selectedUnit
                            //Selected? Art
                            g.c.save()
                            if (active) {
                                if (this.index == i) {
                                    g.c.scale(1.3, 1.3)
                                    g.c.translate(-3, -3)
                                    g.drawRect(new Vector(0, 0), new Vector(tileSize, tileSize), "rgba(255, 255, 255, 0.4)")
                                }
                                
                                if ( isSelected && !unit.isWalking() ) {
                                    g.c.shadowBlur = 10
                                    g.c.shadowColor = "black"
                                }
                            }
                            if (flipUnits) {
                                g.drawRect(new Vector(0, 0), new Vector(tileSize, tileSize), "#00000055")
                            } else {
                                g.drawRect(new Vector(0, 0), new Vector(tileSize, tileSize), "#ffffff77")
                            }
                            //Standard rendering
                            unit.render( true, flipUnits )
                            g.c.restore()
                            if (hover) {
                                // g.drawRect(new Vector(0, 0), new Vector(100, 100), "red")
                                drawStats(unit)
                            }
                        }
                    } )
                } )
            }
        } )
    }
}