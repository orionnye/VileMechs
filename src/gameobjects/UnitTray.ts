import Graphics from "../Graphics"
import Game from "../Game"
import { Vector } from "../math/Vector"
import Unit from "./Unit"
import World from "./World"
import Matrix from "../math/Matrix"
import Scene, { SceneNode } from "../Scene"
import { randomFloor } from "../math/math"

export default class UnitTray {
    private index = -1
    private hasUnitSelected = false

    constructor() {
        window.addEventListener( "keydown", ( ev ) => {
            if ( ev.key == "Tab" ) {
                ev.preventDefault()
                //another player permission switch
                if (!Game.instance.isAITurn()) {
                    this.cycleUnits()
                }
            }
        } )
    }

    setUnitIndex( index: number ) {
        this.hasUnitSelected = index > -1
        this.index = index
        Game.instance.onSelectUnit()
    }

    deselect() {
        this.hasUnitSelected = false
        Game.instance.onSelectUnit()
    }

    toggleSelectIndex( index: number ) {
        if ( this.hasUnitSelected && index == this.index )
            this.deselect()
        else
            this.setUnitIndex( index )
    }

    toggleSelectUnit( unit: Unit ) {
        let index = Game.instance.playerUnits().indexOf( unit )
        this.toggleSelectIndex( index )
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
        let selectBoxDim = new Vector(50, 50)
        let g = Graphics.instance
        const unitTrayStride = World.tileSize
        let width = 28
        let height = unitTrayStride * (this.numberOfUnits() - 1) + selectBoxDim.y

        Scene.node( {
            description: "unit-tray",
            localMatrix: Matrix.translation( 0, 0 ),
            rect: { width, height },
            onRender: () => g.drawRect( new Vector( -1, -1 ), new Vector( width, height ), "#595959" ),
            content: () => {
                //rework the units so the selected Unit is the Unit Rendered on top
                let backUnits = units.slice(0, units.length)
                let firstUnits = backUnits.splice(this.index, backUnits.length - this.index)
                let unitsCopy = firstUnits.concat(backUnits)

                unitsCopy.forEach( ( unit, i ) => {
                    Scene.node( {
                        description: "tray-unit",
                        localMatrix: Matrix.translation( 1, (unitTrayStride * i) + selectBoxDim.y / 2 ),
                        rect: { width: World.tileSize, height: World.tileSize },
                        onClick: () => this.selectUnit( unit ),
                        onRender: () => {
                            g.c.save()
                            if ( this.selectedUnit !== undefined &&  this.index == units.indexOf( unit )) {
                                g.c.translate(0, -selectBoxDim.y / 2)
                                g.drawRect( new Vector( 0, 0 ), selectBoxDim, "#595959" )
                                g.c.lineWidth = 1
                                g.c.strokeStyle = "gray"
                                g.c.strokeRect( -.5, -.5, selectBoxDim.x, selectBoxDim.y )
                                g.c.stroke()
                                g.c.scale(1.5, 1.5)
                                unit.render( false )

                                //Health Display
                                let healthPipBox = new Vector(3, 5)
                                let healthBox = new Vector(unit.maxHealth*healthPipBox.x, 10)
                                let healthPos = new Vector(32, 2)
                                let inactiveHealth = "rgba(255, 0, 0, 0.2)"
                                let excessHealth = "rgba(255, 180, 180, 1)"
                                
                                let textPos = healthPos.add(new Vector(-6, -2))
                                g.drawRect(textPos, new Vector(healthBox.x+ healthPipBox.x*2, 7), "#661111")

                                g.setFont( 5, "impact" )
                                let healthText = unit.maxHealth.toString().padStart( 2, "0" )
                                g.drawTextBox( textPos.add(new Vector(-1, 0.5)), healthText, { padding: 1, textColor: "#000000", boxColor: "#f84a32" } )
                                
                                for (let h = Math.max(unit.health, unit.maxHealth); h > 0; h--) {
                                    let nextPipPos = healthPos.add(new Vector(h*healthPipBox.x - healthPipBox.x, 0))
                                    if (h <= unit.maxHealth) {
                                        if (h <= unit.health) {
                                            let hexColorStrength = "fd"
                                            // let hexColorStrength = Math.floor((Math.random()*20 + 220)).toString(16)
                                            g.drawRect(nextPipPos, healthPipBox, `#${hexColorStrength}0000`)
                                            g.c.lineWidth = 0.2
                                            g.strokeRect(nextPipPos, healthPipBox, "black")
                                        } else {
                                            let noiseScale = 0.5
                                            let noise = new Vector(Math.random()*noiseScale, Math.random()*noiseScale)
                                            let absentPipPos = nextPipPos.add(noise)
                                            g.drawRect(absentPipPos, healthPipBox, inactiveHealth)
                                            g.c.lineWidth = 0.2
                                            g.strokeRect(absentPipPos, healthPipBox, "black")
                                            // g.fillCircle(nextPipPos, healthPipRadius, inactiveHealth )
                                        }
                                    } else {
                                        g.drawRect(nextPipPos, healthPipBox, excessHealth)
                                        g.c.lineWidth = 0.2
                                        g.strokeRect(nextPipPos, healthPipBox, "black")
                                    }
                                }
                                //Energy Display
                                let energyPipBox = new Vector(3, 5)
                                let energyBox = new Vector(unit.maxEnergy*energyPipBox.x, 10)
                                let energyPos = new Vector(32, 10)
                                let inactiveEnergy = "rgba(0, 0, 0, 255, 1)"
                                let excessEnergy = "rgba(180, 180, 255, 1)"
                                
                                let energyTextPos = energyPos.add(new Vector(-6, -2))
                                g.drawRect(energyTextPos, new Vector(energyBox.x+ energyPipBox.x*2, 7), "#111166")

                                g.setFont( 5, "impact" )
                                let energyText = unit.maxEnergy.toString().padStart( 2, "0" )
                                g.drawTextBox( energyTextPos.add(new Vector(-1, 0.5)), energyText, { padding: 1, textColor: "#000000", boxColor: "#324af8" } )

                                for (let e = Math.max(unit.energy, unit.maxEnergy); e > 0; e--) {
                                    let nextPipPos = energyPos.add(new Vector(e*energyPipBox.x - energyPipBox.x, 0))
                                    if (e <= unit.maxEnergy) {
                                        if (e <= unit.energy) {
                                            let noiseScale = 0.5
                                            let noise = new Vector(Math.random()*noiseScale, Math.random()*noiseScale)
                                            let hexColorStrength = Math.floor((Math.random()*29 + 230)).toString(16)
                                            let filledPipPos = nextPipPos.add(noise)
                                            g.drawRect(filledPipPos, energyPipBox, `#6f6f${hexColorStrength}`)
                                            g.c.lineWidth = 0.2
                                            g.strokeRect(filledPipPos, energyPipBox, "black")
                                        } else {
                                            // let absentPipPos = nextPipPos.add(noise)
                                            let absentPipPos = nextPipPos
                                            // g.drawRect(absentPipPos, energyPipBox, "")
                                            g.c.lineWidth = 0.2
                                            g.strokeRect(absentPipPos, energyPipBox, "black")
                                            // g.fillCircle(nextPipPos, healthPipRadius, inactiveHealth )
                                        }
                                    } else {
                                        g.drawRect(nextPipPos, energyPipBox, excessEnergy)
                                        g.c.lineWidth = 0.2
                                        g.strokeRect(nextPipPos, energyPipBox, "black")
                                    }
                                }
                                // g.c.fillStyle = "rgb(0, 0, 50)"
                                // g.c.fillRect(32, 10, energyBox.x, energyBox.y)
                            } else {
                                //scale down for the unselected Units
                                g.c.scale(0.7, 0.7)
                                g.c.translate(0, -5)
                                unit.render( false )
                                //display the Units Health
                            }
                            g.c.restore()
                        }
                    } )
                } )
            }
        } )
    }

}