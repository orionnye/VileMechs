import Graphics from "../../common/Graphics"
import Scene from "../../common/Scene"
import Game from "../../Game"
import World from "../../map/World"
import { randomInt } from "../../math/math"
import Matrix from "../../math/Matrix"
import { Vector } from "../../math/Vector"
import Team from "../mech/Team"
import Unit from "../mech/Unit"

export default class UnitTray {
    private index = -1
    private hasUnitSelected = false

    constructor() {
        
    }

    makeSceneNode(pos: Vector, team: Team, flip: boolean = false) {
        let g = Graphics.instance
        let units = team.units
        
        
        Scene.node( {
            description: "unit-tray",
            localMatrix: Matrix.translation( pos.x, pos.y ),
            content: () => {
                let previousHeight = 0
                units.forEach( (unit, i) => {
                    const tileSize = World.tileSize
                    const tile = new Vector(tileSize, tileSize)
                    let scale = 1.5
                    //resets dimensions depending on selected(scaled) unit
                    let width = i == team.index ? tile.x*scale : tileSize
                    let height = i == team.index ? tile.y*scale : tileSize
                    //offsets the Ypos of units Displayed after selected(Scaled) unit
                    let yOffset = team.index < i && team.index !== -1 ? tileSize*(scale-1)+1 : 0
                    
                    Scene.node( {
                        description: unit.name,
                        localMatrix: Matrix.translation(0, tileSize*i+yOffset),
                        rect: { width, height },
                        onRender: () => {
                            
                            g.c.save()
                            if (flip) {
                                g.c.translate(tile.x, 0)
                                g.c.scale(-1, 1)
                            }
                            
                            //Scales the selected Unit
                            if ( i == team.index ) {
                                g.c.scale(scale, scale)
                            }

                            //Colors
                            const backing1 = "rgba(100, 100, 100, 1)"
                            const nameBacking = "rgba(150, 150, 150, 0.7)"
                            
                            //Display backing
                            g.drawRect( Vector.zero, tile, backing1 )
                            g.c.lineWidth = 1
                            g.strokeRect( Vector.zero, tile, "black" )
                            //unit drawn
                            unit.render( false )

                            //unit name display
                            unit.renderName( new Vector(0, 26.5), "black", nameBacking )
                            
                            //Energy Stats
                            let energy = {
                                pos: new Vector(20, 21.5),
                                dim: new Vector(13.5, 4),
                                pip: {
                                    dim: new Vector(3, 4),
                                    pad: new Vector(1.5, 0),
                                    filled: () => `rgb(0, ${Math.random()*55 + 200}, 0)`,
                                    empty: "rgb(0, 100, 0)",
                                    pit: "rgb(0, 50, 0)",
                                    temp: "rgb(205, 255, 205)",
                                },
                                backingColor: "rgb(30, 125, 30)",
                            }
                            g.drawRect(energy.pos, energy.dim, energy.backingColor)
                            //draw Empty Pip Containers for Max Energy
                            let mostEnergy = unit.energy > unit.maxEnergy ? unit.energy : unit.maxEnergy

                            for (let e = 0; e < mostEnergy; e++) {
                                let pipPadding = energy.pip.pad.scale(e)
                                let pipOffset = new Vector(energy.pip.dim.scale(e).x, 0).add(pipPadding)
                                let pipPos = energy.pos.add(new Vector(0.5, 0)).add(pipOffset)

                                if ( e >= unit.energy ) {
                                    // Empty Pips
                                    g.drawRect(pipPos, energy.pip.dim, energy.pip.pit)
                                    g.strokeRect(pipPos, energy.pip.dim, energy.pip.empty)
                                } else if ( e < unit.maxEnergy ) {
                                    // Filled Pips
                                    g.strokeRect(pipPos, energy.pip.dim, energy.pip.empty)
                                    g.drawRect(pipPos, energy.pip.dim, energy.pip.filled())
                                } else {
                                    // Bonus Pips
                                    g.strokeRect(pipPos, energy.pip.dim, "yellow")
                                    g.drawRect(pipPos, energy.pip.dim, energy.pip.filled())
                                }
                                 
                            }
                            
                            //Health Stats
                            let health = {
                                pos: new Vector(0.5, 26.5),
                                dim: new Vector(33, 4),
                                pip: {
                                    dim: new Vector(2.5, 4),
                                    pad: new Vector(1.5, 0),
                                    filled: "rgb(255, 0, 0)",
                                    empty: "rgb(100, 0, 0)",
                                    pit: "rgb(75, 0, 0)",
                                    temp: "rgb(255, 205, 205)",
                                },
                                backingColor: "rgb(125, 10, 10)"
                            }
                            g.drawRect(health.pos, health.dim, health.backingColor)
                            let jiggleCap = 0.4
                            let jiggle = new Vector(randomInt(jiggleCap), randomInt(jiggleCap))

                            let mostHealth = unit.health > unit.maxHealth ? unit.health : unit.maxHealth

                            for (let h = 0; h < mostHealth; h++) {
                                let pipPadding = health.pip.pad.scale(h)
                                let pipOffset = new Vector(health.pip.dim.scale(h).x, 0).add(pipPadding)
                                let pipPos = health.pos.add(new Vector(1, 0)).add(pipOffset)

                                if (h >= unit.health) {
                                    // Empty Pips
                                    g.drawRect(pipPos.add(jiggle), health.pip.dim, health.pip.pit)
                                    g.strokeRect(pipPos.add(jiggle), health.pip.dim, health.pip.empty)
                                } else if ( h < unit.maxHealth ) {
                                    // Filled Pips
                                    g.strokeRect(pipPos, health.pip.dim, health.pip.empty)
                                    g.drawRect(pipPos, health.pip.dim, health.pip.filled)
                                } else {
                                    // Bonus Pips
                                    let bonusTotal = h - unit.maxHealth
                                    let bonusPipOffset = new Vector(0, 0)
                                    g.strokeRect(pipPos, health.pip.dim, "yellow")
                                    g.drawRect(pipPos, health.pip.dim, health.pip.filled)
                                }
                                jiggle = new Vector(randomInt(jiggleCap), randomInt(jiggleCap))
                            }
                            g.strokeRect(new Vector(0.5, 0.5), new Vector(7, 8), "rgb(0, 0, 225)")
                            g.drawRect(new Vector(0.5, 0.5), new Vector(7, 8), "rgb(50, 50, 255)")
                            g.setFont(7, "pixel2")
                            g.drawText(new Vector(2, 0), (unit.speed - 1).toString(), "rgb(0, 0, 45)" )

                            g.c.restore()
                        },
                        onClick: () => {
                            team.selectUnit( unit )
                        }
                    } )
                } )
            }
        } )
    }
}