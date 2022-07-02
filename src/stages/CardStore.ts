import { getImg } from "../common/utils"
import Game from "../Game"
import Graphics, { TextAlignX } from "../common/Graphics"
import { randomFloor } from "../math/math"
import Matrix from "../math/Matrix"
import { Vector } from "../math/Vector"
import Scene, { PickingResult, SceneNode } from "../common/Scene"
import UnitTray from "../gameobjects/ui/UnitTray"
import { Deck } from "../gameobjects/card/Deck"
import Card, { getLines } from "../gameobjects/card/Card"
import { Chrome, Earth, Flesh, Treant } from "../gameobjects/mech/RigTypes"
import Unit from "../gameobjects/mech/Unit"


const Jungle = getImg( require( "../www/images/gui/BackgroundPixel1.png" ) )
const Jungle2 = getImg( require( "../www/images/gui/BackgroundPixel2.png" ) )
const Swamp = getImg( require( "../www/images/gui/BackgroundPixel3.png" ) )
const Forest = getImg( require( "../www/images/gui/BackgroundPixel4.png" ) )
const Backgrounds = [ Jungle, Jungle2, Swamp, Forest ]

const Grunt = getImg( require( "../www/images/characters/grunt.png" ) )

export default class CardStore {

    //-----STORE DATA------
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    unitTray = new UnitTray()
    stockTotal = 4
    stock = new Deck( this.stockTotal )
    isPlayerDone = false

    image: HTMLImageElement

    //shop keeper dialogue
    dialogue: {
        text: string
        pos: Vector
        offset: Vector
    }

    constructor() {
        this.image = Backgrounds[ Math.floor( Math.random() * 4 ) ]
        this.dialogue = {
            text: "Buy something!",
            pos: new Vector(Game.instance.screenDimensions().x - 150, 70),
            offset: new Vector(0, 0)
        }
        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )
    }

    reset() {
        this.stock = new Deck( this.stockTotal )
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
                //static Sign data storage
                const Sign = {
                    pos: new Vector( game.screenCenter().x, 0 ),
                    size: new Vector( 20, 25 ),
                    text: {
                        size: 30,
                    }
                }
                this.dialogue.pos = new Vector(Game.instance.screenDimensions().x - 150, 70)
                //Sign rendering
                // g.drawRect(Sign.pos, Sign.size, "rgba(0, 0, 100, 0.5)")

                g.c.imageSmoothingEnabled = false

                //Background
                g.drawRect(new Vector(0, 0), g.size, "rgba(205, 205, 255, 1)" )
                //unit display
                let selected = Game.instance.match.selectedUnit()
                if (selected) {
                    g.c.save()
                    g.c.translate(-20, -10)
                    g.c.scale(7, 7)
                    selected.render(false)
                    g.c.restore()
                }
                let maxI = 15
                for (let i = 0; i < maxI; i++) {
                    g.drawRect(new Vector(0, 0), new Vector(g.size.x, (g.size.y/maxI)*i), "rgba(50, 50, 50, 0.1)" )
                }                
                //Shop Keeper
                g.c.drawImage( Grunt, 0, 0, Grunt.width, Grunt.height, game.screenDimensions().x - 150, 80, 150, 150 )
                //shop keeper dialogue
                let dialogue = this.dialogue
                if (dialogue.text.length > 0) {
                    g.setFont( 10, "Pixel2" )
                    let lines = getLines(dialogue.text, 15)
                    let textPos = dialogue.pos.add(dialogue.offset)
                    lines.forEach( ( line, index ) => {
                        // g.drawText( new Vector( 6, 42 + index * 4 ), line, "#f0ead8" )
                        g.drawTextBox( textPos.add(new Vector( 6, 42 + index * 10 )), line, { boxColor: "rgba(60,60,150, 1)", alignX: TextAlignX.center } )
                    } )
                }
                
                //Shop Sign
                g.setFont( Sign.text.size, "Pixel2" )
                g.drawText( Sign.pos, "Part Shop", "black", { boxColor: "rgba(0, 0, 100, 0.5)", alignX: TextAlignX.center, padding: 10 } )
                //Scrip display
                let scrip = new Vector( game.screenCenter().x, 40 )
                g.setFont( Sign.text.size-10, "Pixel2" )
                g.drawText( scrip, "Scrip: " + Game.instance.scrip, "white", { boxColor: "rgba(150,60,60,0.9)", padding: 5, alignX: TextAlignX.center } )
                
                //Enter to leave display
                g.drawRect(new Vector(0, 230), new Vector( game.screenDimensions().x, 40), "black")
                g.setFont( 10, "Pixel2" )
                g.drawTextBox(new Vector(game.screenDimensions().x - 150,  240), "Press 'Enter' to leave", {})

            },
            content: () => {
                //display data(static except for UI Scaling)
                // unitTray.makeSceneNode(this.playerUnits())
                const screenDims = game.screenDimensions()
                const shelf = {
                    dim: new Vector( ( screenDims.x / 5 ) * 3, Card.dimensions.y * 1.3 ),
                    pos: new Vector( screenDims.x / 7, screenDims.y * 0.6 ),
                    margin: 10,
                    cost: 5,
                    stockPos: ( index: number ) => {
                        //break and divide the cardSpace by total cards and then divide remaining space evenly
                        let spacePerCard = shelf.dim.x / ( this.stock.length )
                        return new Vector( index * spacePerCard + shelf.margin * index, 0 )
                    }
                }
                let selectedIndex = -1

                Scene.node( {
                    description: "card-Shelf",
                    rect: { width: shelf.dim.x, height: shelf.dim.y },
                    localMatrix: Matrix.identity.vTranslate( shelf.pos ),
                    onRender: () => {
                        g.setFont( 13, "Times" )
                        g.drawTextBox( new Vector( -50, 35 ), "Cost: " + shelf.cost, { boxColor: "rgba(200, 80, 80, 0.9)" } )
                    },
                    content: () => {
                        this.stock.cards.forEach( ( card, i ) => Scene.node( {
                            description: "store-Stock",
                            localMatrix: Matrix.translation( shelf.stockPos( i ).x, shelf.stockPos( i ).y ),
                            scalar: 5,

                            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
                            onRender: () => {
                                card.render()
                                if (selectedIndex == i) {
                                    g.strokeRect(card.pos, Card.dimensions, "rgba(255, 255, 255, 0.5)")
                                }
                            },
                            onHover: () => {
                                // console.log(card.type.name)
                                selectedIndex = i
                            },
                            onClick: () => {
                                // console.log("Unit:", unitTray.selectedUnit())
                                let game = Game.instance
                                if ( match.selectedUnit() ) {
                                    if (game.scrip >= shelf.cost) {
                                        game.scrip -= shelf.cost
                                        let copy = this.stock.cards.splice( i, 1 )[ 0 ]
                                        // console.log("COPY:", copy[0])
                                        match.selectedUnit()?.draw.addCard( copy )
                                        // console.log("trying to buy!")
                                        let possibleText = [
                                            "Good Choice",
                                            "I like that one",
                                            "meh"
                                        ]
                                        this.dialogue.text = possibleText[randomFloor(possibleText.length)]
                                    } else {
                                        let possibleText = [
                                            "no scrip, no parts",
                                            "I don't work for free bud",
                                            "sorry bud, I don't do charity"
                                        ]
                                        this.dialogue.text = possibleText[randomFloor(possibleText.length)]
                                    }
                                } else {
                                    this.dialogue.text = "Hit 'Tab' to select which mech you want that on"
                                }
                            }
                        } ) )
                    }
                } )
            }
        } )
    }
}