import Graphics from "../../common/Graphics"
import Scene from "../../common/Scene"
import Game from "../../Game"
import World from "../../map/World"
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
        
        const tileSize = World.tileSize
        const tile = new Vector(tileSize, tileSize)
        let scale = 1.5
        let width = tileSize
        let height = tileSize
        let yOffset = 0
        
        Scene.node( {
            description: "unit-tray",
            localMatrix: Matrix.translation( pos.x, pos.y ),
            content: () => {
                units.forEach( (unit, i) => {
                    width = tileSize
                    height = tileSize
                    yOffset = 0
                    
                    //for every unit in team, render a background and unit
                    if ( team.index < i && team.index !== -1) {
                        // g.c.translate(0, tileSize*(scale-1))
                        yOffset = tileSize*(scale-1)
                    }
                    if ( i == team.index ) {
                        width = tile.x*scale
                        height = tile.y*scale
                    }
                    Scene.node( { 
                        description: unit.name,
                        localMatrix: Matrix.translation(0, tileSize*i+yOffset),
                        rect: { width, height },
                        onRender: () => {
                            //Colors
                            const backing1 = "rgba(100, 100, 100, 0.9)"
                            const backing2 = "rgba(100, 100, 100, 1)"
                            const nameBacking = "rgba(150, 150, 150, 0.7)"
                            const statBacking = "rgb(170, 170, 170)"
                            
                            g.c.save()
                            if (flip) {
                                g.c.translate(tile.x, 0)
                                g.c.scale(-1, 1)
                            }

                            //Background Bar
                            if ( i == team.index ) {
                                g.c.scale(scale, scale)
                            }
                            g.drawRect( Vector.zero, tile, backing1 )
                            g.strokeRect( Vector.zero, tile, nameBacking )

                            //NamePlate
                            // if ( i == team.index ) {
                            //     unit.render( true )
                            // } else {
                            unit.render( false )
                            // }
                            unit.renderName( new Vector(0, tile.y), "black", nameBacking )
                            //Stat display
                            let healthPos = new Vector(32, 0.75)
                            let healthDim = new Vector(5, 30)
                            g.pipBlock( healthPos, healthDim, unit.health, unit.maxHealth, true, "red", "rgb(50, 0, 0)" )
                            let energyPos = new Vector(37, 10)
                            let energyDim = new Vector(3, 15)
                            g.pipBlock( energyPos, energyDim, unit.energy, unit.maxEnergy, true, "rgb(100, 255, 100)", "rgb(0, 50, 0)" )
                            
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