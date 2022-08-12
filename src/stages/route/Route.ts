import { getImg } from "../../common/utils"
import Game, { Activity } from "../../Game"
import Graphics, { TextAlignX } from "../../common/Graphics"
import { randomCeil, randomFloor } from "../../math/math"
import Matrix from "../../math/Matrix"
import { Vector } from "../../math/Vector"
import Scene, { PickingResult, SceneNode } from "../../common/Scene"
import LinkedList, { Post } from "./LinkedList"
import Camera from "../../gameobjects/Camera"
import { findSourceMap } from "module"
import { match } from "assert"

const dirt = getImg( require( "../../www/images/cards/backing/BrownCardBase.png" ) )

export default class Route {

    //-----STORE DATA------
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    isPlayerDone = false

    // image: HTMLImageElement
    options : LinkedList<Post>[]
    selected : boolean = false
    pos: Vector = new Vector(0, 0)
    scroll: number = 0
    camera: Camera

    constructor() {
        //Path init
        this.options = []
        this.reset( 3 )
        this.camera = new Camera()
        window.addEventListener( "keydown", ev => this.onKeydown( ev ) )
    }

    onKeydown( ev: KeyboardEvent ) {
        // console.log("ev", ev.key)
        if (Game.instance.activity == "route") {
            // if ( ev.key == "w" || ev.key == "ArrowUp" ) {
            //     this.scroll -= 5
            // }
            // if ( ev.key == "s" || ev.key == "ArrowDown" ) {
            //     this.scroll += 5
            // }
        }
    }
    get length() {
        // let longest = 0
        // this.options.forEach(option => {
        //     let length = option.traverse.length
        //     if ( length > longest) {
        //         longest = length
        //     }
        // })
        return 6
    }
    reset(length: number = 3) {
        this.options = [
            this.getNewPath(1),
            this.getNewPath(3),
            this.getNewPath(6),
            this.getNewPath(4),
            this.getNewPath(2)
        ]
    }
    getNewPath(length: number = 3) {
        let game = Game.instance
        const linkedList = new LinkedList<Post>()

        for (let i = 0; i < length; i++) {
            let nextStop: Activity = "match"
            if (i == length - 1) {
                nextStop = game.randomShop
            }
            linkedList.insertAtEnd({ title: nextStop })
        }
        return linkedList
    }
    makeSceneNode() {
        let g = Graphics.instance
        let game = Game.instance

        this.scene = Scene.node( {
            localMatrix: Matrix.identity,
            content: () => {
                const screenDims = game.screenDimensions()
                const buffer = 5
                type Stage = {
                    id: Activity
                    description: string
                    color: string
                    title: string
                }
                //UI Variable
                let selecting : Vector = new Vector(-1, -1)
                this.options.forEach((route, i) => {
                    // this.path.traverse().forEach(( stop, i ) => {
                    route.traverse().forEach(( stop, j ) => {
                        let currentSlot = new Vector(i, j)
                        let stageStats: Stage
                        switch (stop.title) {
                            case "match": {
                                stageStats = {
                                    id: "match", description: "Fight!", color: "rgb(255, 0, 0)", title: "Bounty Hunt"
                                }
                                break
                            }
                            case "shop": {
                                stageStats = {
                                    id: "shop", description: "Buy Cards", color: "rgb(20, 20, 175)", title: "Mechanic"
                                }
                                break
                            }
                            case "dealerShip": {
                                stageStats = {
                                    id: "dealerShip", description: "Buy Mechs", color: "rgb(50, 175, 50)", title: "Mech Dealer"
                                }
                                break
                            }
                            case "pawnShop": {
                                stageStats = {
                                    id: "pawnShop", description: "Remove Cards", color: "rgb(50, 0, 75)", title: "Pawn Shop"
                                }
                                break
                            }
                            default: {
                                stageStats = {
                                    id: "route", description: "mystery", color: "rgb(150, 150, 150)", title: "???"
                                }
                            }
                        }
                        let dim = new Vector(50, 20)
                        let pos = new Vector(screenDims.x/6, screenDims.y/6*5)
                        let offset = new Vector(buffer*i+dim.x*i, -buffer*j-dim.y*j - this.scroll)
                        let finalPos = pos.add(offset)
                        let valid = j == game.level
                        Scene.node( {
                            description: stageStats.description,
                            localMatrix: Matrix.identity.vTranslate(finalPos),
                            rect: { width: dim.x, height: dim.y },
                            
                            onRender: () => {
                                g.c.imageSmoothingEnabled = false
                                
                                //background
                                g.drawRect(new Vector(0, 0), dim, stageStats.color)
                                
                                //header
                                g.setFont(6, "Pixel2")
                                g.drawText(new Vector(2, 2), stageStats.title, "white")
                                
                                if (!valid) {
                                    g.drawRect(new Vector(0, 0), dim, "rgba(0, 0, 0, 0.8)")
                                }

                                //highlight on hover
                                if ( selecting.equals(currentSlot) && valid ) {
                                    let { color } = stageStats
                                    g.c.lineWidth = 6
                                    //editting each color string to have rgba and an alpha value
                                    let alphadColor = "rgba" + color.split("rgb")[1].toString().split(")")[0] + ", 0.7)"
                                    // console.log("alphadColor:", alphadColor)
                                    g.strokeRect(new Vector(0, 0), dim, alphadColor)
                                } else if ( selecting.equals(currentSlot) ) {
                                    g.c.lineWidth = 1
                                    g.strokeRect(new Vector(0, 0), dim, "rgba(0, 0, 0)")
                                }
                            },
                            onHover: () => {
                                selecting = new Vector(i, j)
                            },
                            onClick: valid ? () => {
                                Game.instance.changeStage(stageStats.id)
                            } : () => {}
                        })
                    })
                })
                let bossPos = new Vector(50, 0)
                let bossDim = new Vector(200, 50)
                let bossSelected = false
                let bossValid = game.level >= this.length
                Scene.node( {
                    description: "Debt Collector",
                    localMatrix: Matrix.identity.vTranslate(bossPos),
                    rect: { width: bossDim.x, height: bossDim.y },

                    onRender: () => {
                        g.c.imageSmoothingEnabled = false
                        
                        //background
                        g.drawRect(bossPos, bossDim, "red")
                        
                        //header
                        g.setFont(25, "Pixel2")
                        g.drawText(bossPos.add(new Vector(bossDim.x*0.12, bossDim.x*0.07)), "Boss Fight", "white")
                        
                        //highlight on hover
                        if (!bossValid) {
                            g.drawRect(bossPos, bossDim, "rgba(0, 0, 0, 0.8)")
                        } else {
                            if (bossSelected) {
                                g.c.lineWidth = 5
                                g.strokeRect(bossPos, bossDim, "white")
                            }
                        }
                    },
                    onHover: () => {
                        bossSelected = true
                    },
                    onClick: () => {
                        let game = Game.instance
                        game.changeStage("match")
                        // game.match.startBoss()
                        // game.match.teams[1] = game.match.generateBoss()
                    }
                })
            },
            onRender: () => {
                g.c.imageSmoothingEnabled = false

                g.c.fillStyle = `rgba(120, 120, 120, 1)`
                g.c.fillRect( 0, 0, g.size.x, g.size.y )
                //Color Shift towards center
                
                let layers = 10
                for (let i = 0; i < layers; i++) {
                    let pos = game.screenDimensions().scale(0.5 / layers * i)
                    let dim = game.screenDimensions().subtract(pos.scale(2))

                    g.c.fillStyle = `rgba(180, 160, 120, ${i/20})`
                    g.c.fillRect( pos.x, pos.y, dim.x, dim.y )
                }
                // g.setFont( 25, "Pixel2" )
                // g.drawText(
                //     game.screenCenter().add(new Vector(0,
                //     -game.screenDimensions().scale(0.4).y)),
                //     "Select Next Stage", "white",
                //     { alignX: TextAlignX.center }
                // )
            }
        } )
    }
}