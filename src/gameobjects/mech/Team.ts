import Graphics from "../../common/Graphics";
import Scene, { SceneNode } from "../../common/Scene";
import Game from "../../Game";
import Match from "../../stages/Match";
import Matrix from "../../math/Matrix";
import { Vector } from "../../math/Vector";
import UnitTray from "../ui/UnitTray";
import { Chrome, ChromeBot, Earth, FleshBot } from "./RigTypes";
import Unit from "./Unit";

export default class Team {
    selectedUnitIndex = -1
    hasUnitSelected = false

    name: string
    flipUnits: boolean

    units: Unit[]
    playable = true

    scene: SceneNode = { localMatrix: Matrix.identity }

    constructor( name: string, flip: boolean = false, teamNumber: number ) {
        this.name = name
        this.flipUnits = flip

        this.units = []
    }
    //----DATA ACCESS----
    setUnitIndex( index: number ) {
        if ( index != this.selectedUnitIndex )
            Game.instance.match.cardTray.deselect()
        this.hasUnitSelected = index > -1
        this.selectedUnitIndex = index
        // this.onSelectUnit()
    }

    deselect() {
        // this.hasUnitSelected = false
        // this.index = -1
        this.setUnitIndex( -1 )
    }

    toggleSelectIndex( index: number ) {
        if ( this.hasUnitSelected && index == this.selectedUnitIndex )
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
            this.setUnitIndex( ( this.selectedUnitIndex + 1 ) % this.numberOfUnits() )
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
        return units[ this.selectedUnitIndex ]
    }
    getUnit( pos: Vector ) {
        for ( let unit of this.units )
            if ( unit.pos.equals( pos ) )
                return unit
    }

    endTurn() {
        this.units.forEach( unit => {
            unit.statCap()
        } )
        this.deselect()
    }

    update() {
        this.units = this.units.filter( unit => unit.health > 0 )
        for ( let unit of this.units )
            unit.update()
    }

}