//import path from "path/posix"
import { targetsWithinRange } from "./CardTypes"
import Game from "./Game"
import Card from "./gameobjects/Card"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"
import { randomFloor } from "./math/math"
import { Vector } from "./math/Vector"
import { findPath } from "./pathfinding"

export default class AI {
    //stats
    startTime: number | undefined

    constructor( ) {
    }
    isDone(unit: Unit) {
        if (unit.hand.length == 0 || unit.energy <= 0) {
            return true
        } else {
            return false
        }
    }
    
    think( unit: Unit ) {

        let game = Game.instance
        let world = game.world
        let card = game.selectedCard()
        let energyconsumed = 0
        
        //Step ONE, select a card if available
        if ( card == undefined ) {
            energyconsumed = 1
            this.selectBestCard(unit)
        } else if (card !== undefined) {
            
            let enemies = this.getEnemiesOf(unit)
            let target = this.bestTargetOf(unit, card!)
            let idealSpot = this.idealSpot(unit, card)
            let friendly = this.friendlySpace(unit)

            if (card?.type.cost <= unit.energy && target !== undefined) {
                //Step TWO, if an enemy is within range, use Card
                game.applyCardAt(target.pos)
                energyconsumed += card.type.cost
            }
            else if (enemies.length > 0) {
                // Step THREE, if no enemies in range, move into range
                if (!unit.isWalking() && idealSpot !== undefined) {
                    this.moveTowards(unit, idealSpot)
                    energyconsumed += 1
                }
            } else if (friendly !== undefined){
                this.moveTowards(unit, friendly)
                energyconsumed += 1
            }
        }
        if (energyconsumed == 0 && unit.energy > 0) {
            unit.energy -= 1;
            // console.log("Energy Consumed:", energyconsumed)
        }
        //resetting the timer
        this.startTime = Date.now()
    }
    //---------------------UTILITY FUNCTIONS------------------------------
    getEnemiesOf(unit: Unit) {
        let enemies: Unit[] = []
        Game.instance.world.units.forEach(target => {
            if (target.teamNumber !== unit.teamNumber) {
                enemies.push(target)
            }
        })
        return enemies
    }
    bestTargetOf(unit: Unit, card: Card) {
        let enemies = this.possibleTargets(unit, card)
        // console.log("Enemies:", enemies)
        let best
        if (enemies.length > 0) {
            enemies.forEach(enemy => {
                if (best == undefined) {
                    best = enemy
                } else if (enemy.health < best.health) {
                    best = enemy
                }
            })
        }
        return best
    }
    possibleTargets(unit: Unit, card: Card) {
        let tiles = card.type.getTilesInRange(card, unit)
        let targets: Unit[] = []
        let enemies = this.getEnemiesOf(unit)
        enemies.forEach( enemy => {
            tiles.forEach(tile => {
                if (tile.x == enemy.pos.x && tile.y == enemy.pos.y) {
                    targets.push(enemy)
                }
            })
        })
        return targets
    }
    //-----------------------CARD FUNCTIONS----------------------
    selectBestCard(unit: Unit) {
        let game = Game.instance
        //using data from card currently selected, Unit will act
        //random Choice will work for now though
        let choice = randomFloor(unit.hand.length)
        game.cardTray.selectIndex(choice)
    }
    useCard(unit: Unit) {
        
    }
    //---------------------MOBILITY FUNCTIONS------------------------------

    idealSpot(unit, card) {
        let game = Game.instance
        let world = game.world
        
        //must find ideal distance, in the future this should take into account if unit should run away
        let idealDist = card.type.range
        //store closestTile
        let closest
        world.units.forEach( enemy => {
            if (enemy.teamNumber !== unit.teamNumber) {
                let tiles = targetsWithinRange(enemy.pos, 0, idealDist)
                tiles.forEach(tile => {
                    let tilePath = findPath(world, unit.pos, tile)
                    if (tilePath) {
                        if (closest == undefined) {
                            //if unnasigned and validPath
                            closest = tile
                        } else {
                            let closestPath = findPath(world, unit.pos, closest)
                            if (tilePath.length < closestPath!.length) {
                                closest = tile
                            }
                        }
                    }
                })
            }
        })
        return closest
    }
    friendlySpace(unit) {
        let game = Game.instance
        let world = game.world

        let sightDistance = 20
        let closest
        world.units.forEach( friend => {
            if (friend.teamNumber == unit.teamNumber) {
                let tiles = targetsWithinRange(friend.pos, 0, sightDistance)
                tiles.forEach(tile => {
                    let tilePath = findPath(world, unit.pos, tile)
                    if (tilePath) {
                        if (closest == undefined) {
                            //if unnasigned and validPath
                            closest = tile
                        } else {
                            let closestPath = findPath(world, unit.pos, closest)
                            if (tilePath.length < closestPath!.length) {
                                closest = tile
                            }
                        }
                    }
                })
            }
        })
        return closest
    }
    moveTowards( unit: Unit, location: Vector ) {
        let game = Game.instance
        let world = game.world
        let path = findPath(world, unit.pos, location)
        // console.log("path:", path)
        // Unit should be either moving or using cards
        if ( path ) {
            let walkableLength = Math.min( path.length, unit.speed )
            let walkablePath = path.slice( 0, walkableLength )
            unit.walkPath(walkablePath)
        } else {
            console.log("Invlaid path request!", unit.pos, " cannot reach: ", location)
        }
    }
}