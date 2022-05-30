//import path from "path/posix"
import { targetsWithinRange } from "../card/CardTypes"
import Game from "../../Game"
// import Card from "./gameobjects/Card"
import Unit from "./Unit"
import World from "../map/World"
import { randomFloor } from "../../math/math"
import { Vector } from "../../math/Vector"
import { findPath } from "../map/pathfinding"
import Card from "../card/Card"
import Team from "./Team"
import Tile from "../map/Tile"

export default class AI {
    //call timing
    startTime: number | undefined
    delay: number = 500
    
    //stats
    //Depth of thought, a thought counter but Kody didnt want me calling it depth...so Chodiness
    chodiness: number
    maxChodiness: number

    constructor( maxChodiness = 8) {
        this.chodiness = 0
        this.maxChodiness = maxChodiness
    }
    
    think( team: Team ) {
        this.startTime = Date.now()
        
        let game = Game.instance
        let { world } = game
        let { cardTray } = world
        
        this.chodiness += 1
        // console.log("Thinking!!!!:", this.chodiness)

        if ( team.units.length > 0 && team.index > -1 ) {
            let unit = team.selectedUnit()!
            let card = cardTray.selectedCard(unit)
            if (card && card.type.playable) {
                let idealSpot : Vector | null = this.idealSpot(unit, card)
                let enemies = this.getEnemiesOf(unit)
                //step two: move within range
                if (idealSpot && !unit.pos.equals(idealSpot) ) {
                    this.moveTowards(unit, idealSpot)
                } else if (enemies.length > 0) {
                    let bestTarget = this.bestTargetOf(unit, card)
                    if (bestTarget) {
                        this.useCard(bestTarget.pos)
                    }
                }
            } else {
                //Step ONE, select a card if available
                console.log("Selecting Card")
                this.selectBestCard(unit)
            }
        }
        //resetting the timer
    }
    update() {
        if (this.startTime && Date.now() - this.startTime >= this.delay) {
            this.startTime = undefined
            console.log("Timing Out")
        }
    }
    active() {
        return this.startTime == undefined
    }
    reset() {
        this.chodiness = 0;
        this.startTime = undefined;
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
    getFriendsOf(unit: Unit) {
        let friends: Unit[] = []
        Game.instance.world.teams.forEach((team, index) => {
            if (index == unit.teamNumber) {
                team.units.forEach(unit => {
                    friends.push(unit)
                })
            }
        })
        return friends
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
        let game = Game.instance

        let tiles = card.type.getTilesInRange(card, unit)
        // console.log("tiles In Range: ", tiles)
        let targets: Unit[] = []
        let enemies = this.getEnemiesOf(unit)
        let friends = this.getFriendsOf(unit)
        tiles.forEach(tile => {
            if (card.type.friendly) {
                friends.forEach( friend => {
                    if (tile.x == friend.pos.x && tile.y == friend.pos.y) {
                        targets.push(friend)
                    }
                })
            } else {
                enemies.forEach( enemy => {
                    if (tile.x == enemy.pos.x && tile.y == enemy.pos.y) {
                        targets.push(enemy)
                    }
                })
            }
            // game.world
            //return friendlies in list if card is helpful
        })
        return targets
    }
    //-----------------------CARD FUNCTIONS----------------------
    selectBestCard(unit: Unit) {
        let game = Game.instance
        //using data from card currently selected, Unit will act
        //random Choice will work for now though
        //----------------AVOID CARDS THAT ARE UNPLAYABLE OR COST ABOVE YOUR ENERGY AVAILABLE
        let playableCards: Card[] = []
        unit.hand.cards.forEach((card: Card) => {
            if (card.type.playable && card.type.cost <= unit.energy) {
                playableCards.push(card)
            }
        })
        // console.log(playableCards)

        if (playableCards.length > 0) {
            let choice = randomFloor(playableCards.length)
            game.world.cardTray.selectIndex(choice)
        }
    }
    useCard(target: Vector) {
        let game = Game.instance
        // console.log("target:", target)
        game.world.applyCardAt(target)
    }
    //---------------------MOBILITY FUNCTIONS------------------------------
    findCloseOrFarSpot(unit: Unit, target: Vector, close = true) {
        let game = Game.instance
        let world = game.world
        let record = unit.pos
        let bar = 0
        for (let w = 0; w <= world.map.width; w++) {
            for (let h = 0; h <= world.map.height; h++) {
                let spot = new Vector(w, h)
                if ( world.isWalkable(spot) ) {
                    //How do?
                    let path = findPath(world, target, spot)
                    //if walkable, check to see if path is valid
                    //either finds closest or farthest space
                    if (close) {
                        if (path && path.length < bar) {
                            //make path from unit to target and if valid, save the tile and bar
                            bar = path.length
                            record = spot
                        }
                    } else {
                        if (path && path.length > bar) {
                            //make path from unit to target and if valid, save the tile and bar
                            bar = path.length
                            record = spot
                        }
                    }
                }

            }
        }
        return record
    }
    idealSpot(unit, card: Card) {
        let game = Game.instance
        let world = game.world
        
        //must find ideal distance, in the future this should take into account if unit should run away
        let idealDist = card.type.range
        //store closestTile
        let enemies = this.getEnemiesOf(unit)
        let targets = enemies
        if (card.type.friendly) {
            targets = this.getFriendsOf(unit)
        }
        let closest : Vector | null = null
        targets.forEach( target => {
            let tiles = card.getTilesInRange(target)
            tiles.forEach(tile => {
                let tilePath = findPath(world, unit.pos, tile)
                if (tilePath) {
                    if (closest == undefined) {
                        //if unnasigned and validPath
                        closest = tile
                    } else {
                        let closestPath = findPath(world, unit.pos, closest)
                        // console.log(closest)
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
    getPath( unit: Unit, location: Vector ) {
        // console.log("UnitPOS:", unit.pos, "location:", location)
        let game = Game.instance
        let world = game.world
        let path = findPath(world, unit.pos, location, 100)
        // console.log("path:", path)
        return path
    }
    moveTowards( unit: Unit, location: Vector ) {
        let game = Game.instance
        let world = game.world
        let closestSpace = this.findCloseOrFarSpot(unit, location)
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