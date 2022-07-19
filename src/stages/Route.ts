import { getImg } from "../common/utils"
import Game, { Activity } from "../Game"
import Graphics, { TextAlignX } from "../common/Graphics"
import { randomFloor } from "../math/math"
import Matrix from "../math/Matrix"
import { Vector } from "../math/Vector"
import Scene, { PickingResult, SceneNode } from "../common/Scene"
import UnitTray from "../gameobjects/ui/UnitTray"
import { Deck } from "../gameobjects/card/Deck"
import Card from "../gameobjects/card/Card"
import { Chrome, Earth, Flesh, Treant } from "../gameobjects/mech/RigTypes"
import Unit from "../gameobjects/mech/Unit"
import PawnShop from "./PawnShop"
import { type } from "os"


// const Jungle = getImg( require( "../www/images/gui/BackgroundPixel1.png" ) )
// const Jungle2 = getImg( require( "../www/images/gui/BackgroundPixel2.png" ) )
// const Swamp = getImg( require( "../www/images/gui/BackgroundPixel3.png" ) )
// const Forest = getImg( require( "../www/images/gui/BackgroundPixel4.png" ) )
// const Backgrounds = [ Jungle, Jungle2, Swamp, Forest ]

const dirt = getImg( require( "../www/images/cards/backing/BrownCardBase.png" ) )

export default class Route {

    //-----STORE DATA------
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    isPlayerDone = false

    // image: HTMLImageElement
    options : Activity[]
    selecting: Activity | undefined
    pos: Vector = new Vector(0, 0)

    constructor() {
        // this.image = Backgrounds[ Math.floor( Math.random() * 4 ) ]

        //option Variables
        this.options = []
        for (let i = 0; i < 2; i++) {
            this.options.push(Game.instance.randomStage)
        }
    }

    makeSceneNode() {
        let g = Graphics.instance
        let game = Game.instance

        this.scene = Scene.node( {
            localMatrix: Matrix.identity,
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
                g.setFont( 25, "Pixel2" )
                g.drawText(
                    game.screenCenter().add(new Vector(0,
                    -game.screenDimensions().scale(0.4).y)),
                    "Select Next Stage", "white",
                    { alignX: TextAlignX.center }
                )
                
            },
            content: () => {
                const screenDims = game.screenDimensions()
                const buffer = 5
                type Stage = {
                    id: Activity
                    description: string
                    color: string
                    title: string
                    onClick: () => void
                }
                let match = <Stage> {
                    id: "match",
                    description: "Select a Fight",
                    color: "rgb(255, 0, 0)",
                    title: "Bounty Hunt",
                    onClick: () => {
                        console.log("Begin a fight")
                        Game.instance.changeStage("match")
                    }
                }
                let pawnShop = <Stage> {
                    id: "pawnShop",
                    description: "Go to a pawn shop",
                    color: "rgb(50, 0, 75)",
                    title: "Pawn Shop",
                    onClick: () => {
                        console.log("Off to the pawn shop")
                        Game.instance.changeStage("pawnShop")
                    }
                }
                let dealerShip = <Stage> {
                    id: "dealerShip",
                    description: "Go to a mech dealerShip",
                    color: "rgb(200, 250, 200)",
                    title: "Mech Dealer",
                    onClick: () => {
                        console.log("Off to the dealer ship")
                        Game.instance.changeStage("dealerShip")
                    }
                }

                let shop = <Stage> {
                    id: "shop",
                    description: "Go to a shop",
                    color: "rgb(20, 20, 175)",
                    title: "Mechanic",
                    onClick: () => {
                        console.log("Begin shopping")
                        Game.instance.changeStage("shop")
                    }
                }
                //UI Variable
                let selecting = <string> ""

                this.options.forEach(( option, i ) => {
                    let stageStats
                    switch (option) {
                        case "match": {
                            stageStats = match
                            break
                        }
                        case "shop": {
                            stageStats = shop
                            break
                        }
                        case "dealerShip": {
                            stageStats = dealerShip
                            break
                        }
                        case "pawnShop": {
                            stageStats = pawnShop
                            break
                        }
                    }
                    let dim = new Vector(100, 50)
                    let pos = new Vector(screenDims.x/3*2, screenDims.y/4 + buffer*i+dim.y*i)

                    Scene.node( {
                    description: stageStats.description,
                    localMatrix: Matrix.identity.vTranslate(pos),
                    rect: { width: dim.x, height: dim.y },
                    
                    onRender: () => {
                        g.c.imageSmoothingEnabled = false
                        
                        //background
                        g.drawRect(new Vector(0, 0), dim, stageStats.color)
                        //header
                        g.setFont(12, "Pixel2")
                        g.drawText(new Vector(5, 20), stageStats.title, "black")

                        //highlight on hover
                        if ( selecting == stageStats.id ) {
                            g.strokeRect(new Vector(0, 0), dim, "rgba(255, 255, 255)")
                        }
                    },
                    onHover: () => {
                        selecting = stageStats.id
                    },
                    onClick: stageStats.onClick
                    })

                })
            }
        } )
    }
}