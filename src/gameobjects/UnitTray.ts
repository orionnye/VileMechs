import Graphics from "../Graphics"
import Game from "../Game"
import { Vector } from "../math/Vector"
import Unit from "./Unit"
import World from "./World"
import Matrix from "../math/Matrix"
import Scene, { SceneNode } from "../Scene"
import { randomFloor } from "../math/math"
import Match from "./Match"

export default class UnitTray {
    private index = -1
    private hasUnitSelected = false

    constructor() {
        window.addEventListener( "keydown", ( ev ) => {
            if ( ev.key == "Tab" ) {
                ev.preventDefault()
                //another player permission switch
                if ( !Match.instance.isAITurn() ) {
                    this.cycleUnits()
                }
            }
        } )
    }

    setUnitIndex( index: number ) {
        this.hasUnitSelected = index > -1
        this.index = index
        Match.instance.onSelectUnit()
    }

    deselect() {
        this.hasUnitSelected = false
        Match.instance.onSelectUnit()
    }

    toggleSelectIndex( index: number ) {
        if ( this.hasUnitSelected && index == this.index )
            this.deselect()
        else
            this.setUnitIndex( index )
    }

    toggleSelectUnit( unit: Unit ) {
        let index = Match.instance.playerUnits().indexOf( unit )
        this.toggleSelectIndex( index )
    }

    numberOfUnits() {
        return Match.instance.playerUnits().length
    }

    private cycleUnits() {
        if ( !this.hasUnitSelected )
            this.setUnitIndex( 0 )
        else
            this.setUnitIndex( ( this.index + 1 ) % this.numberOfUnits() )
    }

    selectUnit( unit: Unit ) {
        let units = Match.instance.playerUnits()
        let index = units.indexOf( unit )
        if ( index > -1 ) {
            this.setUnitIndex( index )
        }
    }

    selectedUnit() {
        let units = Match.instance.playerUnits()
        if ( !this.hasUnitSelected ) return undefined
        return units[ this.index ]
    }

    makeSceneNode( units: Unit[] ) {
        let selectBoxDim = new Vector( World.tileSize, World.tileSize )
        let g = Graphics.instance
        const unitTrayStride = World.tileSize
        let width = 28
        let height = unitTrayStride * ( this.numberOfUnits() - 1 ) + selectBoxDim.y

        Scene.node( {
            description: "unit-tray",
            localMatrix: Matrix.translation( 0, 0 ),
            rect: { width, height },
            onRender: () => g.drawRect( new Vector( -1, -1 ), new Vector( width, height ), "#595959" ),
            content: () => {
                for ( let i = units.length - 1; i >= 0; i-- ) {
                    let baseIndex = this.hasUnitSelected ? this.index : 0
                    let unit = units[ ( baseIndex + i ) % units.length ]
                    Scene.node( {
                        description: "tray-unit",
                        localMatrix: Matrix.translation( 1, ( unitTrayStride * i ) + selectBoxDim.y / 2 ),
                        rect: { width: World.tileSize, height: World.tileSize },
                        onClick: () => this.selectUnit( unit ),
                        onRender: () => {
                            g.c.save()
                            if ( this.hasUnitSelected && this.index == units.indexOf( unit ) ) {
                                g.c.translate( 0, -selectBoxDim.y / 2 )
                                g.c.scale( 1.5, 1.5 )
                                g.drawRect( new Vector( 0, 0 ), selectBoxDim, "#595959" )
                                g.c.lineWidth = 1
                                g.c.strokeStyle = "gray"
                                g.c.strokeRect( -.5, -.5, selectBoxDim.x, selectBoxDim.y )
                                g.c.stroke()
                                unit.render( false )

                                let pipSize = new Vector( 3, 5 )

                                // Health Display
                                this.renderPips( {
                                    value: unit.health,
                                    maxValue: unit.maxHealth,
                                    startPosition: new Vector( selectBoxDim.x, 0 ),
                                    pipSize,
                                    noiseScale: 0.0, missingNoiseScale: 0.1,
                                    getColor: h => h > unit.maxHealth ? "rgb(255, 180, 180)" : "rgb(255, 0, 0)"
                                } )

                                // Energy Display
                                this.renderPips( {
                                    value: unit.energy,
                                    maxValue: unit.maxEnergy,
                                    startPosition: new Vector( selectBoxDim.x, 5 ),
                                    pipSize,
                                    noiseScale: 0.1,
                                    missingNoiseScale: 0,
                                    getColor: () => `#2f${ Math.floor( ( Math.random() * 20 + 230 ) ).toString( 16 ) }2F`
                                } )

                            } else {
                                g.c.scale( 0.7, 0.7 )
                                g.c.translate( 0, -5 )
                                unit.render( false )
                                //display the Units Health
                            }
                            g.c.restore()
                        }
                    } )
                }
            }
        } )
    }

    renderPips(
        {
            value, maxValue, pipSize, startPosition,
            noiseScale, missingNoiseScale, getColor
        }
            : {
                value: number, maxValue: number,
                pipSize: Vector, startPosition: Vector,
                noiseScale: number, missingNoiseScale: number
                getColor: ( value, maxValue ) => string
            }
    ) {
        let g = Graphics.instance
        for ( let i = 0; i < Math.max( value, maxValue ); i++ ) {
            let missing = i >= value
            let _noiseScale = missing ? missingNoiseScale : noiseScale
            let position = startPosition.addXY(
                pipSize.x * i + Math.random() * _noiseScale,
                Math.random() * _noiseScale
            )
            if ( !missing )
                g.drawRect( position, pipSize, getColor( i + 1, maxValue ) )
            g.c.lineWidth = 0.2
            g.strokeRect( position, pipSize, "black" )
        }
    }

}