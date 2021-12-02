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
    thinking: boolean = false

    constructor() {
        this.thinking = false
    }
    
    think( unit: Unit ) {
        let world = Game.instance.world
        
        //ensure it doesnt end it's turn exposed
        let idealSpot = this.idealSpot(unit)
        let attack = this.bestAttack(unit)
        let defends = this.defendCardsFor(unit)
        let game = Game.instance
        let target = this.bestTargetOf(unit, attack)
        if (target) {
            game.cardTray.selectIndex(unit.hand.cards.indexOf(attack))
            game.applyCardAt(target.pos)
        } else if (idealSpot) {
            let path = findPath(world, unit.pos, idealSpot)
            if (path) {
                let walkableLength = Math.min( path.length, unit.speed )
                path.length = walkableLength
                unit.walkPath(path)
            }
        } else if (defends.length > 0) {

        } else {
            //if no attacks or defends or place to move, just eat energy
            unit.energy -= 1
        }
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
    //-------offensive--------
    attackCardsFor(unit: Unit) {
        //CARD CLONES, we are not mutating or passing actual cards
        let attacks = unit.hand.cards.map( card => {
            if (card.type.damage > 0) {
                return card
            }
        })
        return attacks
    }
    bestAttack(unit) {
        let best
        let attacks = this.attackCardsFor(unit)
        if (attacks.length > 0) {
            attacks.forEach(card => {
                if (card) {
                    let targets = this.possibleTargets(unit, card)
                    if (best == undefined) {
                        best = card
                    } else if (targets.length > 0 && best.type.damage < card.type.damage) {
                        best = card
                    }
                }
            });
        }
        return best
    }
    bestTargetOf(unit: Unit, card: Card) {
        let enemies = this.possibleTargets(unit, card)
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

    //-------defensive-------
    defendCardsFor(unit: Unit) {
        //CARD CLONES, we are not mutating or passing actual cards
        let defends = unit.hand.cards.map( card => {
            if (card.type.damage < 0) {
                return card
            }
        })
        return defends
    }

    //---------------------MOBILITY FUNCTIONS------------------------------
    idealDistanceFor(unit: Unit) {
        let attacks = this.attackCardsFor(unit)
        let mean = 0
        if (attacks.length > 0) {
            attacks.forEach( card => {
                mean += card!.type.range
            })
            mean = mean / attacks.length
        }
        return mean
    }

    idealSpot(unit) {
        let game = Game.instance
        let world = game.world

        //  Possible OPTIMIZATION
        //      make idealSpot factor in distance from enemies so it prefers single targets
        //      Or reject spots that are within reach of multiple enemies
        //  NECESSARY OPTIMIZATION
        //      We need to select a few cards to optimize for, otherwise we arent actually checking if we're in range
        
        //must find ideal distance
        let idealDist = this.idealDistanceFor(unit)
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
}