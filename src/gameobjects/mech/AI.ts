//import path from "path/posix"
import { targetsWithinRange } from "../card/CardTypes"
import Game from "../../Game"
// import Card from "./gameobjects/Card"
import Unit from "./Unit"
import World from "../../map/World"
import { randomFloor } from "../../math/math"
import { Vector } from "../../math/Vector"
import { findPath } from "../../map/pathfinding"
import Card from "../card/Card"

export default class AI {
    //call timing
    startTime: number | undefined
    delay: number = 1000
    
    //stats
    depth: number
    maxDepth: number

    constructor( maxDepth = 10) {
        this.depth = 0
        this.maxDepth = maxDepth
    }
    think( unit: Unit ) {
        this.startTime = Date.now()

        let game = Game.instance
        let world = game.world

        console.log("Thinking!!!!")

        //Step ONE, select a card if available
        // if ( card == undefined ) {
        //     this.selectBestCard(unit)
        // }

        //resetting the timer
    }
    update() {
        if (this.startTime && Date.now() - this.startTime >= this.delay) {
            this.startTime = undefined
        }
    }
    //---------------------UTILITY FUNCTIONS------------------------------
    getEnemiesOf(unit: Unit) {
        let enemies: Unit[] = []
        Game.instance.world.teams.forEach((team, index) => {
            if (index !== unit.teamNumber) {
                team.units.forEach(unit => {
                    enemies.push(unit)
                })
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
        game.world.cardTray.selectIndex(choice)
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
        let enemies = this.getEnemiesOf(unit)
        let closest
        enemies.forEach( enemy => {
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
        })
        return closest
    }
    friendlySpace(unit) {
        let game = Game.instance
        let world = game.world

        let sightDistance = 20
        let closest
        world.teams[unit.teamNumber].units.forEach( friend => {
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