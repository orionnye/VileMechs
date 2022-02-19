import Graphics from "../../common/Graphics";
import Scene, { SceneNode } from "../../common/Scene";
import Game from "../../Game";
import World from "../../map/World";
import Matrix from "../../math/Matrix";
import { Vector } from "../../math/Vector";
import { Chrome } from "./RigTypes";
import Unit from "./Unit";

export default class Team {
    name: string
    flipUnits: boolean

    units: Unit[]

    scene: SceneNode = { localMatrix: Matrix.identity }

    constructor(name: string, flip: boolean = false, teamNumber : number = 0) {
        this.name = name
        this.flipUnits = flip

        this.units = [
            new Chrome( new Vector( 1, 0 ), teamNumber ),
            new Chrome( new Vector( 2, 0 ), teamNumber ),
            new Chrome( new Vector( 3, 0 ), teamNumber ),
            // new Flesh( new Vector( 0, 1 ), 0 ),
            // new Treant( new Vector( 0, 0 ), 0 ),
            // new Jelly( new Vector( 0, 0 ), 0 )
        ]
    }

    update() {
        this.units = this.units.filter( unit => unit.health > 0 )
        for ( let unit of this.units )
            unit.update()
    }

    getUnit( pos: Vector ) {
        for ( let unit of this.units )
            if ( unit.pos.equals( pos ) )
                return unit
    }

    makeSceneNode() {
        let game = Game.instance
        let g = Graphics.instance
        let { units } = this
        let selectedUnit = game.selectedUnit()
        let pickingTarget = game.isPickingTarget()
        let tileSize = World.tileSize
        // let { width, height } = this.map

        this.scene = Scene.node( {
            description: this.name,
            localMatrix: Matrix.identity,
            content: () => {
                units.forEach( ( unit, i ) => {
                    Scene.node( {
                        description: unit.name,
                        localMatrix: Matrix.vTranslation( unit.pos.scale( tileSize ) ),
                        rect: { width: tileSize, height: tileSize },
                        onClick: () => game.unitTray.toggleSelectUnit( unit ),
                        onRender: ( node ) => {
                            let hover = node == game.mouseOverData.node
                            let isSelected = unit == selectedUnit
                            if ( isSelected && !unit.isWalking() ) {
                                g.c.shadowBlur = 10
                                g.c.shadowColor = "black"
                            }
                            unit.render( true, isSelected || hover )
                        }
                    } )
                } )
            }
        } )
    }
}