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

export default class Store {
    static instance: Store

    //-----STORE DATA------
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    unitTray = new UnitTray()
    stockTotal = 5
    stock = new Deck( this.stockTotal );
    mechs = <Unit[]>[];
    isPlayerDone = false

    image: HTMLImageElement

    constructor() {
        Store.instance = this
        this.image = Backgrounds[ Math.floor( Math.random() * 4 ) ];
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
                const Sign = {
                    pos: new Vector( game.screenCenter().x, 0 ),
                    size: new Vector( 20, 25 ),
                    text: {
                        size: 20,
                    }
                }
                //Sign rendering
                // g.drawRect(Sign.pos, Sign.size, "rgba(0, 0, 100, 0.5)")

                g.c.imageSmoothingEnabled = false
                // g.c.fillStyle = "#636912"
                // g.c.fillRect( 0, 0, g.size.x, g.size.y )
                g.c.drawImage( this.image, 0, 0, this.image.width, this.image.height, 0, 0, game.screenDimensions().x, game.screenDimensions().y )

                g.setFont( Sign.text.size, "Times New Roman" )
                g.drawTextBox( Sign.pos, "Scavenge!", { textColor: "white", boxColor: "rgba(0, 0, 100, 0.5)", alignX: TextAlignX.center, padding: 10 } )
                let scrip = new Vector( game.screenCenter().x, 40 )
                g.drawTextBox( scrip, "Scrip: " + Game.instance.scrip, { boxColor: "rgba(150,60,60,0.9)", padding: 5, alignX: TextAlignX.center } )
                // g.drawTextBox(new Vector(250, 3), "Scrip: " + Game.instance.scrip, { boxColor: "rgba(150, 60, 60, 0.9)", padding: 5 } )
            },
            content: () => {
                //display data(static except for UI Scaling)
                // unitTray.makeSceneNode(this.playerUnits())
                const screenDims = game.screenDimensions()
                const shelf = {
                    dim: new Vector( ( screenDims.x / 5 ) * 3, Card.dimensions.y * 1.3 ),
                    pos: new Vector( screenDims.x / 5, screenDims.y * 0.7 ),
                    margin: 10,
                    cost: 5,
                    stockPos: ( index: number ) => {
                        //break and divide the cardSpace by total cards and then divide remaining space evenly
                        let spacePerCard = shelf.dim.x / ( this.stock.length )
                        return new Vector( index * spacePerCard + shelf.margin * index, 0 )
                    }
                }
                const mechShelf = {
                    dim: new Vector( screenDims.x / 1.7, screenDims.y / 4 ),
                    pos: new Vector( screenDims.x / 5, screenDims.y * 0.3 ),
                    margin: 10,
                    scalar: 1,
                    cost: 20,
                    stockPos: ( index: number ) => {
                        //break and divide the cardSpace by total cards and then divide remaining space evenly
                        let spacePerMech = mechShelf.dim.x / ( this.mechs.length )
                        return new Vector( index * spacePerMech + shelf.margin * index, 0 )
                    }
                }

                Scene.node( {
                    description: "card-Shelf",
                    rect: { width: shelf.dim.x, height: shelf.dim.y },
                    localMatrix: Matrix.identity.vTranslate( shelf.pos ),
                    onRender: () => {
                        g.setFont( 13, "Times" )
                        g.drawTextBox( new Vector( -50, 35 ), "Cost: " + shelf.cost, { boxColor: "rgba(200, 80, 80, 0.9)" } )
                        g.drawRect( new Vector( -screenDims.x / 2, 50 ), new Vector( screenDims.x * 2, screenDims.y * 2 ), "gray" )
                    },
                    content: () => {
                        this.stock.cards.forEach( ( card, i ) => Scene.node( {
                            description: "store-Stock",
                            localMatrix: Matrix.translation( shelf.stockPos( i ).x, shelf.stockPos( i ).y ),

                            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
                            onRender: () => card.render(),
                            onHover: () => {
                                // console.log(card.type.name)
                            },
                            onClick: () => {
                                // console.log("Unit:", unitTray.selectedUnit())
                                let game = Game.instance
                                if ( match.selectedUnit() && game.scrip >= shelf.cost ) {
                                    game.scrip -= shelf.cost
                                    let copy = this.stock.cards.splice( i, 1 )[ 0 ]
                                    // console.log("COPY:", copy[0])
                                    match.selectedUnit()?.draw.addCard( copy )
                                    // console.log("trying to buy!")
                                }
                            }
                        } ) )
                    }
                } )

                Scene.node( {
                    description: "mech-Shelf",
                    rect: { width: mechShelf.dim.x * mechShelf.scalar, height: mechShelf.dim.y * mechShelf.scalar },
                    localMatrix: Matrix.vTranslation( mechShelf.pos ),
                    onRender: () => {
                        g.setFont( 13, "Times" )
                        g.drawTextBox( new Vector( -50, 35 ), "Cost: " + mechShelf.cost, { boxColor: "rgba(200, 80, 80, 0.9)" } )
                        g.drawRect( new Vector( 0, 0 ), new Vector( mechShelf.dim.x, mechShelf.dim.y ), "grey" )
                    },
                    content: () => {
                        this.mechs.forEach( ( mech, i ) => Scene.node( {
                            description: "store-Stock",
                            localMatrix: Matrix.translation( mechShelf.stockPos( i ).x, mechShelf.stockPos( i ).y ),

                            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
                            onHover: () => {
                                mechShelf.scalar = 2
                            },
                            onRender: ( node ) => {
                                let c = Graphics.instance.c
                                let hover = node == game.mouseOverData.node

                                c.save()
                                if ( hover ) {
                                    c.scale( mechShelf.scalar, mechShelf.scalar )
                                }
                                mech.render()
                                c.restore()
                            },
                            onClick: () => {
                                // console.log("Unit:", unitTray.selectedUnit())
                                if ( game.scrip >= mechShelf.cost ) {
                                    game.scrip -= mechShelf.cost
                                    match.teams[ 0 ].units.push( mech )
                                    this.mechs.splice( this.mechs.indexOf( mech ), 1 )
                                }
                            }
                        } ) )
                    }
                } )
            }
        } )
    }
}