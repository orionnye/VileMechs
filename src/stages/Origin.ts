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
import { Chrome, Earth, Flesh, Gelraug, Treant } from "../gameobjects/mech/RigTypes"
import Unit from "../gameobjects/mech/Unit"


const Jungle = getImg( require( "../www/images/gui/BackgroundPixel1.png" ) )
const Jungle2 = getImg( require( "../www/images/gui/BackgroundPixel2.png" ) )
const Swamp = getImg( require( "../www/images/gui/BackgroundPixel3.png" ) )
const Forest = getImg( require( "../www/images/gui/BackgroundPixel4.png" ) )
const Backgrounds = [ Jungle, Jungle2, Swamp, Forest ]

const dirt = getImg( require( "../www/images/cards/backing/BrownCardBase.png" ) )

type origin = "earth" | "chrome"
export default class Origin {

    //-----STORE DATA------
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    isPlayerDone = false

    image: HTMLImageElement
    options : Unit[]
    selecting: origin | undefined

    constructor() {
        this.image = Backgrounds[ Math.floor( Math.random() * 4 ) ]
        this.options = [ new Earth( new Vector(0, 0), 0 ), new Chrome( new Vector(0, 0), 0 ), new Gelraug( new Vector(0,0), 0) ]
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
                g.drawText( game.screenCenter().add(new Vector(0, -game.screenDimensions().scale(0.4).y)), "Select Your Origin", "white", {alignX: TextAlignX.center})
            },
            content: () => {
                const screenDims = game.screenDimensions()
                const buffer = 5
                let earth = {
                    dim: new Vector(100, 100),
                    pos: new Vector(screenDims.x/5- buffer, screenDims.y/4*2),
                }
                let chrome = {
                    dim: new Vector(100, 100),
                    pos: new Vector(screenDims.x/4*1.85+ buffer, screenDims.y/4*2),
                }
                let gel = {
                    dim: new Vector(100, 100),
                    pos: new Vector(screenDims.x/4*3+ buffer, screenDims.y/4*2),
                }
                let selecting = <string> ""
                Scene.node( {
                    description: "Select a Earth Mech backstory",
                    localMatrix: Matrix.identity.vTranslate(earth.pos),
                    rect: { width: earth.dim.x, height: earth.dim.y },
                    
                    onRender: () => {
                        g.c.imageSmoothingEnabled = false
                        
                        let mech = this.options[0]
                        let textColor = "rgb(75, 20, 20)"
                        //background
                        g.drawRect(new Vector(0, 0), earth.dim, "orange")

                        //mech render
                        g.c.save()
                        g.c.translate(5, 0)
                        g.c.scale(1.5, 1.5)
                        mech.render()
                        g.c.restore()

                        //header
                        g.setFont(12, "Pixel2")
                        g.drawText(new Vector(5, 50), "Roq Co:", textColor)
                        //description
                        g.setFont(5, "Pixel2")
                        g.drawText(new Vector(7, 65), "Retired Miner, with a ", textColor)
                        g.drawText(new Vector(7, 70), "debt to pay off", textColor)
                        //gameplay description
                        g.drawText(new Vector(7, 80), "High Area of Effect and Damage", textColor)

                        //highlight on hover
                        if ( selecting == "earth" ) {
                            g.strokeRect(new Vector(0, 0), chrome.dim, "rgba(255, 255, 255)")
                        }
                    },
                    onHover: () => {
                        selecting = "earth"
                    },
                    onClick: () => {
                        console.log("Begin with Earth mech")

                        Game.instance.team.units = [new Earth(new Vector(0, 0), 0)]
                        Game.instance.match.start()
                    }
                }),
                Scene.node( {
                    description: "Select a Boss Mech backstory",
                    localMatrix: Matrix.identity.vTranslate(gel.pos),
                    rect: { width: earth.dim.x, height: earth.dim.y },
                    
                    onRender: () => {
                        g.c.imageSmoothingEnabled = false
                        
                        let mech = this.options[2]
                        let textColor = "rgb(153, 51, 0)"
                        //background
                        g.drawRect(new Vector(0, 0), earth.dim, "rgb(255,102,0)")

                        //mech render
                        g.c.save()
                        g.c.translate(5, 0)
                        g.c.scale(1.5, 1.5)
                        mech.render()
                        g.c.restore()

                        //header
                        g.setFont(12, "Pixel2")
                        g.drawText(new Vector(5, 50), "Bossu Inc:", textColor)
                        //description
                        g.setFont(5, "Pixel2")
                        g.drawText(new Vector(7, 65), "Field boss looking ", textColor)
                        g.drawText(new Vector(7, 70), "to improve their fight", textColor)
                        //gameplay description
                        g.drawText(new Vector(7, 80), "Largely for testing purposes", textColor)

                        //highlight on hover
                        if ( selecting == "gel" ) {
                            g.strokeRect(new Vector(0, 0), chrome.dim, "rgba(255, 255, 255)")
                        }
                    },
                    onHover: () => {
                        selecting = "gel"
                    },
                    onClick: () => {
                        console.log("Begin with Earth mech")

                        Game.instance.team.units = [new Gelraug(new Vector(0, 0), 0)]
                        Game.instance.match.start()
                    }
                }),
                Scene.node( {
                    description: "Select a Chrome Mech backstory",
                    localMatrix: Matrix.identity.vTranslate(chrome.pos),
                    rect: { width: chrome.dim.x, height: chrome.dim.y },
                    
                    onRender: () => {
                        g.c.imageSmoothingEnabled = false
                        
                        let mech = this.options[1]
                        g.drawRect(new Vector(0, 0), chrome.dim, "rgb(120, 120, 255)")
                        
                        //mech render
                        g.c.save()
                        g.c.translate(5, 0)
                        g.c.scale(1.5, 1.5)
                        mech.render()
                        g.c.restore()
                        
                        //Header
                        g.setFont(12, "Pixel2")
                        g.drawText(new Vector(5, 50), "M&P inc:", "white")
                        
                        //description
                        g.setFont(5, "Pixel2")
                        g.drawText(new Vector(7, 65), "Ex Peace Agent with a", "white")
                        g.drawText(new Vector(7, 70), "debt to pay off", "white")
                        //gameplay description
                        g.drawText(new Vector(7, 80), "High Defense and Damage", "white")

                        //highlight on hover
                        if ( selecting == "chrome" ) {
                            g.strokeRect(new Vector(0, 0), chrome.dim, "rgba(255, 255, 255)")
                        }
                    },
                    onHover: () => {
                        selecting = "chrome"
                    },
                    onClick: () => {
                        console.log("Begin with Chrome mech")

                        Game.instance.team.units = [new Chrome(new Vector(0, 0), 0)]
                        Game.instance.match.start()
                    }
                })
            }
        } )
    }
}