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

        this.scene = Scene.node( {
            localMatrix: Matrix.identity,
            onRender: () => {
                //static Sign data storage
                const sign = {
                    pos: new Vector( game.screenCenter().x, 0 ),
                    size: new Vector( 20, 25 ),
                    text: {
                        size: 20,
                    }
                }

                // g.c.imageSmoothingEnabled = false
                // g.c.drawImage( this.image, 0, 0, this.image.width, this.image.height, 0, 0, game.screenDimensions().x, game.screenDimensions().y )

                g.c.drawImage( this.image, 0, 0, this.image.width, this.image.height, 0, 0, game.screenDimensions().x, game.screenDimensions().y )
                g.setFont( sign.text.size, "Times New Roman" )
                g.drawTextBox( sign.pos, "VileMechs", { textColor: "white", boxColor: "rgba(0, 0, 100, 0.5)", alignX: TextAlignX.center, padding: 10 } )
                
                // let scrip = new Vector( game.screenCenter().x, 40 )
                // g.drawTextBox( scrip, "Scrip: " + Game.instance.scrip, { boxColor: "rgba(150,60,60,0.9)", padding: 5, alignX: TextAlignX.center } )
                // g.drawTextBox(new Vector(250, 3), "Scrip: " + Game.instance.scrip, { boxColor: "rgba(150, 60, 60, 0.9)", padding: 5 } )
            },
            content: () => {
                Scene.node( {
                    description: "start-button",
                    rect: { width: 300, height: 100 },
                    localMatrix: Matrix.identity.vTranslate( new Vector(game.screenCenter().x - 75, 100) ),
                    onRender: () => {
                        g.setFont( 13, "Times" )
                        g.drawRoundTextBox( new Vector( 0, 0 ), "Start Game", { boxColor: "rgba(200, 80, 80, 0.6)", alignX: TextAlignX.center, padding: 5, borderRadius: 8} )
                        // g.drawRect( new Vector( -screenDims.x / 2, 50 ), new Vector( screenDims.x * 2, screenDims.y * 2 ), "gray" )
                    },
                    onClick: () => {
                        console.log("Trying to startGame!!!!!!")
                        Game.instance.activity = "shop"
                    },
                } ), 
                Scene.node( {
                    description: "quit-button",
                    rect: { width: 300, height: 100 },
                    localMatrix: Matrix.identity.vTranslate( new Vector(game.screenCenter().x + 75, 100) ),
                    onRender: () => {
                        g.setFont( 13, "Times" )
                        g.drawRoundTextBox( new Vector( 0, 0 ), "Quit Game", { boxColor: "rgba(200, 80, 80, 0.6)", alignX: TextAlignX.center, padding: 5, borderRadius: 8 } )
                        // g.drawRect( new Vector( -screenDims.x / 2, 50 ), new Vector( screenDims.x * 2, screenDims.y * 2 ), "gray" )
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