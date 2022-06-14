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

export default class Title {
    static instance: Title
    //-----STORE DATA------
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    unitTray = new UnitTray()
    stockTotal = 5
    stock = new Deck( this.stockTotal );
    mechs = <Unit[]>[];
    isPlayerDone = false

    image: HTMLImageElement

    constructor() {
        Title.instance = this
        this.image = Backgrounds[ Math.floor( Math.random() * 4 ) ]
        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )
    }

    reset() {
        this.stock = new Deck( 5 )
        this.mechs = []
        let mechTypes: ( typeof Unit )[] = [ Chrome, Treant, Flesh, Earth ]
        for ( let i = 0; i < 3; i++ ) {
            let random = randomFloor( mechTypes.length )
            let mechType = mechTypes[ random ]
            this.mechs.push( new mechType( new Vector( 0, 0 ), 0 ) )
        }
    }

    //---------------------------User Input---------------------------
    onKeyup( ev: KeyboardEvent ) {
        if ( ev.key == "Enter" ) {
            this.isPlayerDone = true
        }
    }

    update() {
        this.makeSceneNode()
    }

    makeSceneNode() {
        let g = Graphics.instance
        let game = Game.instance
        let match = game.match

        //static Sign data storage
        const sign = {
            pos: new Vector( game.screenCenter().x, 25 ),
            size: new Vector( 80, 25 ),
            text: {
                size: 30,
            }
        }
        const start = {
            dim: new Vector( 100, 50 ),
            pos: new Vector(game.screenCenter().x - 125, 100),
            padding: 10,
            bulk: 10,
            text: {
                size: 13,
                font: "Times",
            }
        }
        const quit = {
            dim: new Vector( 100, 50 ),
            pos: new Vector(game.screenCenter().x + 25, 100),
            padding: 10,
            bulk: 10,
            text: {
                size: 13,
                font: "Times",
            }
        }

        this.scene = Scene.node( {
            localMatrix: Matrix.identity,
            onRender: () => {

                g.c.imageSmoothingEnabled = false
                g.c.drawImage( this.image, 0, 0, this.image.width, this.image.height, 0, 0, game.screenDimensions().x, game.screenDimensions().y )


                g.setFont( sign.text.size, "Times New Roman" )
                g.drawTextBox( sign.pos, "Vile Mechs", { textColor: "white", boxColor: "rgba(0, 0, 100, 0.5)", alignX: TextAlignX.center, padding: 10 } )
            },
            content: () => {
                Scene.node( {
                    description: "start-button",
                    rect: { width: start.dim.x, height: start.dim.y },
                    localMatrix: Matrix.identity.vTranslate( start.pos ),
                    onHover: () => {
                        start.padding += start.bulk
                    },
                    onRender: () => {
                        let { padding, dim, text } = start
                        g.setFont( text.size, text.font )
                        g.drawRoundTextBox( new Vector(dim.scale(0.5).x, 0), "Start Game",
                        {
                            boxColor: "rgba(200, 80, 80, 0.6)",
                            alignX: TextAlignX.center,
                            padding: padding,
                            borderRadius: 8,
                        } )
                    },
                    onClick: () => {
                        console.log("Trying to startGame!!!!!!")
                        Game.instance.activity = "shop"
                    },
                } ),
                Scene.node( {
                    description: "quit-button",
                    rect: { width: quit.dim.x, height: quit.dim.y },
                    localMatrix: Matrix.identity.vTranslate( quit.pos ),
                    onHover: () => {
                        quit.padding += quit.bulk
                    },
                    onRender: () => {
                        let { padding, dim, text } = quit
                        g.setFont( text.size, text.font )
                        g.drawRoundTextBox( new Vector(dim.scale(0.5).x, 0), "Quit Game",
                        {
                            boxColor: "rgba(200, 80, 80, 0.6)",
                            alignX: TextAlignX.center,
                            padding: padding,
                            borderRadius: 8,
                        } )
                    },
                    onClick: () => {
                        console.log("Trying to quitGame!!!!!!")
                        window.close()
                    },
                } )
            }
        } )
    }
}