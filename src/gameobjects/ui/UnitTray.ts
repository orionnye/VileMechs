import Graphics from "../../common/Graphics"
import Scene from "../../common/Scene"
import Game from "../../Game"
import Match from "../../stages/Match"
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

    makeSceneNode( pos: Vector, team: Team, flip: boolean = false ) {
        let g = Graphics.instance
        let units = team.units


        Scene.node( {
            description: "unit-tray",
            localMatrix: Matrix.translation( pos.x, pos.y ),
            content: () => {
                let previousHeight = 0
                units.forEach( ( unit, i ) => {
                    const dimLength = 32
                    const dim = new Vector( 32, 32 )
                    let scale = 1.5
                    //resets dimensions depending on selected(scaled) unit
                    let width = i == team.selectedUnitIndex ? dim.x * scale : dimLength
                    let height = i == team.selectedUnitIndex ? dim.y * scale : dimLength
                    //offsets the Ypos of units Displayed after selected(Scaled) unit
                    let yOffset = team.selectedUnitIndex < i && team.selectedUnitIndex !== -1 ? dimLength * ( scale - 1 ) + 1 : 0

                    Scene.node( {
                        description: unit.name,
                        localMatrix: Matrix.translation( 0, dimLength * i + yOffset ),
                        rect: { width, height },
                        onRender: () => {

                            g.c.save()
                            if ( flip ) {
                                // g.c.translate(dim.x, 0)
                                g.c.scale( -1, 1 )
                            }

                            //Scales the selected Unit
                            if ( i == team.selectedUnitIndex ) {
                                g.c.scale( scale, scale )
                            }

                            //Colors
                            const backing1 = "rgba(100, 100, 100, 1)"
                            const nameBacking = "rgba(150, 150, 150, 0.7)"

                            //Display backing
                            g.drawRect( new Vector( 0, 0 ), dim, backing1 )
                            g.c.lineWidth = 1
                            g.strokeRect( new Vector( 0, 0 ), dim, "black" )
                            //unit drawn
                            // if ( i == team.selectedUnitIndex ) {
                            //     unit.render( true )
                            // } else {
                            //     unit.render( false )
                            // }
                            unit.render(false)

                            //unit name display
                            unit.renderName( new Vector( 0, 19.5 ), "black", nameBacking )

                            unit.drawStats()

                            g.c.restore()
                        },
                        onClick: () => {
                            if ( Game.instance.match.playerTurn() ) {
                                team.selectUnit( unit )
                            }
                        }
                    } )
                } )
            }
        } )
    }
}