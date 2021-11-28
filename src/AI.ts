import path from "path/posix"
import { targetsWithinRange } from "./CardTypes"
import Game from "./Game"
import Card from "./gameobjects/Card"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"
import { Vector } from "./math/Vector"
import { findPath } from "./pathfinding"

export default class AI {
    //stats
    fear: number
    hunger: number
    //access
    unit: Unit
    world: World
    constructor(unit: Unit, fear: number, hunger: number) {
        //----------Stats--------
        //fear chance will be tested against a random number upon taking damage or being pushed on
        //fear will prioritize running away
        this.fear = fear
        //hunger chance will be tested every turn near an edible objective ie: Space-whale bodies or other mech corpses
        // hunger will prioritize non-player entities
        this.hunger = hunger

        //---------ACCESS----------
        this.unit = unit
        this.world = Game.instance.world
    }
    //here are a list of AI functions
    //each function will call another function until the unit has run out of energy
    
    //the real AI will be the function at the end of each call, that determines what function should go next
    thinkAggressive() {
            let [ target, path ] = this.getClosestEnemyAndPath()
            let [ attack, attackIndex ] = this.selectAttack()
            let validTargets = this.getUnitsWithinRangeOf(attack)
            //can attack?
            console.log(validTargets.length > 0)
            if (validTargets.length > 0) {
                
            } else {
                //else, move to attack
                this.move(path)
            }
    }
    getUnitsWithinRangeOf(card: Card) {
        let { unit, world } = this
        
        let tilesInRange = card.type.getTilesInRange(card, unit)
        let validTargets: Unit[] = []
        tilesInRange.forEach(tile => {
            world.units.forEach(target => {
                if (target.pos.x == tile.x && target.pos.y == tile.y) {
                    if (target.teamNumber !== unit.teamNumber) {
                        validTargets.push(target)
                    }
                }
            })
        })

        return validTargets
    }

    getClosestEnemyAndPath() {
        // console.log("apple")
        let lowScore
        let storedUnit
        let storedPath
        this.world.units.forEach( unit => {
            if ( unit.teamNumber !== this.unit.teamNumber ) {
                //pathfinding will never work directly passing unit.pos in, because the units occupies both spaces
                //As a pathfinding workaround, checking all four adjacent tiles
                for (let i = -1; i < 2; i=i+2) {
                    // TESTING Y
                    let path = findPath( this.world, this.unit.pos, unit.pos.add(new Vector(0, i)), 100 )
                    // Testing X
                    if (!path) {
                        path = findPath( this.world, this.unit.pos, unit.pos.add(new Vector(i, 0)), 100 )
                    }
                    //corner Pathfinding 
                    // else if (!path) {
                    //     path = findPath( this.world, this.unit.pos, unit.pos.add(new Vector(i, i)), 100 )
                    // } else if (!path) {
                    //     path = findPath( this.world, this.unit.pos, unit.pos.add(new Vector(-i, i)), 100 )
                    // }

                    //first undefined bar assignment
                    if (path) {
                        if (lowScore == undefined) {
                            lowScore = path.length
                            storedUnit = unit
                            storedPath = path
                        } else if (path.length < lowScore) {
                            lowScore = path.length
                            storedUnit = unit
                            storedPath = path
                        }
                    }
                }
            }
        })
        return [storedUnit, storedPath]
    }
    selectAttack() {
        let { unit } = this
        let bestDamage = 0
        let bestIndex
        let bestCard
        for (let i = 1; i < unit.hand.cards.length; i++) {
            let card = unit.hand.cards[i]
            if (bestIndex == undefined) {
                bestIndex = i
                bestCard = card
                bestDamage = card.type.damage
            }
            if (card.type.damage > bestDamage) {
                bestIndex = i
                bestCard = card
                bestDamage = card.type.damage
            }
        }
        // console.log("selected best card:", bestCard )
        return [ bestCard, bestIndex ]
        // return bestIndex
    }
    move(path: Vector[]) {
        //desired distance may be less than max move
        let walkableLength = Math.min( path.length, this.unit.speed )
        let walkablePath = path.slice( 0, walkableLength )
        this.unit.walkPath(walkablePath)
    }
    attack(unit: Unit, card: Card) {
        //use currently 
    }
    useCard() {
        console.log("using card", "NOT REALLY")
    }

}