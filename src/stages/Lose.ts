import { getImg } from "../common/utils"
import Game from "../Game"
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


const Jungle = getImg( require( "../www/images/gui/BackgroundPixel1.png" ) )
const Jungle2 = getImg( require( "../www/images/gui/BackgroundPixel2.png" ) )
const Swamp = getImg( require( "../www/images/gui/BackgroundPixel3.png" ) )
const Forest = getImg( require( "../www/images/gui/BackgroundPixel4.png" ) )
const Backgrounds = [ Jungle, Jungle2, Swamp, Forest ]

const dirt = getImg( require( "../www/images/cards/backing/BrownCardBase.png" ) )

export default class Lose {

    //-----STORE DATA------
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    isPlayerDone = false

    image: HTMLImageElement

    constructor() {
        this.image = Backgrounds[ Math.floor( Math.random() * 4 ) ]
        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )
    }

    //---------------------------User Input---------------------------
    onKeyup( ev: KeyboardEvent ) {
        if ( ev.key == "Enter" ) {
            this.isPlayerDone = true
        }
    }

    makeSceneNode() {
        let g = Graphics.instance
        let game = Game.instance
        let match = game.match

        this.scene = Scene.node( {
            localMatrix: Matrix.identity,
            onRender: () => {
                g.c.imageSmoothingEnabled = false

                g.c.fillStyle = `rgba(50, 50, 50, 1)`
                g.c.fillRect( 0, 0, g.size.x, g.size.y )
                //Color Shift towards center
                
                let layers = 10
                for (let i = 0; i < layers; i++) {
                    let pos = game.screenDimensions().scale(0.5 / layers * i)
                    let dim = game.screenDimensions().subtract(pos.scale(2))
                    
                    g.c.fillStyle = `rgba(100, 100, 100, ${i/20})`
                    g.c.fillRect( pos.x, pos.y, dim.x, dim.y )
                }
                // g.c.drawImage( this.image, 0, 0, this.image.width, this.image.height, 0, 0, game.screenDimensions().x, game.screenDimensions().y )

                g.setFont( 25, "Pixel2" )
                g.drawText( game.screenCenter().add(new Vector(0, -game.screenDimensions().scale(0.4).y)), "You Lost", "white", {alignX: TextAlignX.center})
            },
            content: () => {
                const screenDims = game.screenDimensions()
                const buffer = 5
                let retry = {
                    dim: new Vector(80, 50),
                    pos: new Vector(screenDims.x/4- buffer, screenDims.y/4*2),
                }
                let quit = {
                    dim: new Vector(80, 50),
                    pos: new Vector(screenDims.x/4*2 + buffer, screenDims.y/4*2),
                }
                let selecting = <string> ""

                Scene.node( {
                    description: "Try again",
                    localMatrix: Matrix.identity.vTranslate(retry.pos),
                    rect: { width: retry.dim.x, height: retry.dim.y },
                    
                    onRender: () => {
                        g.c.imageSmoothingEnabled = false
                        
                        //background
                        g.drawRect(new Vector(0, 0), retry.dim, "white")

                        //header
                        g.setFont(17, "Pixel2")
                        g.drawText(new Vector(5, 20), "Retry?", "black")

                        //highlight on hover
                        if ( selecting == "retry" ) {
                            g.c.lineWidth = 5
                            g.strokeRect(new Vector(0, 0), retry.dim, "black")
                        }
                    },
                    onHover: () => {
                        selecting = "retry"
                    },
                    onClick: () => {
                        console.log("Trying to go again!")
                        Game.instance.reset()
                        Game.instance.changeStage("origin")
                    }
                }),
                Scene.node( {
                    description: "Back to title",
                    localMatrix: Matrix.identity.vTranslate(quit.pos),
                    rect: { width: quit.dim.x, height: quit.dim.y },
                    
                    onRender: () => {
                        g.c.imageSmoothingEnabled = false
                        
                        //background
                        g.drawRect(new Vector(0, 0), quit.dim, "black")

                        //header
                        g.setFont(8, "Pixel2")
                        g.drawText(new Vector(5, 20), "Back to Title?", "white")

                        //highlight on hover
                        if ( selecting == "quit" ) {
                            g.c.lineWidth = 5
                            g.strokeRect(new Vector(0, 0), quit.dim, "rgba(255, 255, 255)")
                        }
                    },
                    onHover: () => {
                        selecting = "quit"
                    },
                    onClick: () => {
                        console.log("Trying to Quit!")
                        Game.instance.changeStage("title")
                    }
                })
            }
        } )
    }
}