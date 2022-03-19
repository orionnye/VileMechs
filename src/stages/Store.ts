import Clock from "../common/Clock"
import Input from "../common/Input"
import { getImg } from "../common/utils"
import Game from "../Game"
import Camera from "../gameobjects/Camera"
// import Card from "./gameobjects/Card"
// import { Deck } from "./gameobjects/Deck"
// import UnitTray from "./gameobjects/UnitTray"
import World from "../map/World"
import Graphics, { TextAlignX } from "../common/Graphics"
import { randomFloor } from "../math/math"
import Matrix from "../math/Matrix"
import { Vector } from "../math/Vector"
import Scene, { PickingResult, SceneNode } from "../common/Scene"
import UnitTray from "../gameobjects/ui/UnitTray"
import { Deck } from "../gameobjects/card/Deck"
import Card from "../gameobjects/card/Card"


const Jungle = getImg( require( "../www/images/BackgroundPixel1.png" ) )
const Jungle2 = getImg( require( "../www/images/BackgroundPixel2.png" ) )
const Swamp = getImg( require( "../www/images/BackgroundPixel3.png" ) )
const Forest = getImg( require( "../www/images/BackgroundPixel4.png" ) )
const Backgrounds = [ Jungle, Jungle2, Swamp, Forest]

export default class Store {
    static instance: Store

    //-----STORE DATA------
    // world: World
    static uiScale = 3
    static camVelocityDecay = 0.85

    graphics = new Graphics()
    camera = new Camera()
    input = new Input()
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    mouseOverData: PickingResult = { node: undefined, point: Vector.zero }
    
    unitTray = new UnitTray()
    stockTotal = 5
    stock = new Deck(this.stockTotal);
    
    showSceneDebug = false
    showFPS = false
    clock = new Clock()
    music = true
    musicPlaying = false
    isPlayerDone = false

    image


    constructor() {
        Store.instance = this
        this.image = Backgrounds[Math.floor(Math.random()*4)];
        // window.addEventListener( "mousedown", ev => this.onMousedown( ev ) )
        // window.addEventListener( "wheel", ev => this.onWheel( ev ) )
        window.addEventListener( "resize", ev => this.graphics.onResize() )
        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )
    }
    

    //Utility Functions
    // selectedUnit() { return this.unitTray.selectedUnit() }
    // playerUnits() { return this.world.units.filter( unit => unit.teamNumber == 0 ) }
    reset() {
        this.stock = new Deck(5)
    }

    //---------------------------User Input---------------------------
    onKeyup( ev: KeyboardEvent ) {
        this.camera.onKeyup( ev )
        if ( ev.key == "`" )
            this.showSceneDebug = !this.showSceneDebug
        if ( ev.key == "," )
            this.showFPS = !this.showFPS
        if ( ev.key == "Enter" ) {
            this.isPlayerDone = true
            //should exit the store and send players back into the game
        }
    }

    update()  {
        // console.log("store updating")
        this.makeSceneNode()
        //user Input Display
        this.mouseOverData = Scene.pick( this.scene, this.input.cursor )
        let { node, point } = this.mouseOverData
        if ( node?.onHover )
        node.onHover( node, point )
    }
    makeSceneNode() {
        let g = Graphics.instance
        let game = Game.instance
        let world = game.world
        let center = game.screenCenter()

        this.scene = Scene.node( {
            localMatrix: Matrix.identity,
            onRender: () => {
                //static Sign data storage
                const Sign = {
                    pos: new Vector(game.screenCenter().x, 0),
                    size: new Vector(20, 25),
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

                g.setFont(Sign.text.size, "Times New Roman")
                g.drawTextBox(Sign.pos, "Scavenge!", { textColor: "white", boxColor: "rgba(0, 0, 100, 0.5)", alignX: TextAlignX.center, padding: 10 })
            },
            content: () => {
                //display data(static except for UI Scaling)
                // unitTray.makeSceneNode(this.playerUnits())
                const shelf = {
                    dim: new Vector((game.screenDimensions().x / 5)*3, Card.dimensions.y*1.3),
                    pos: new Vector(game.screenDimensions().x / 5, game.screenDimensions().y * 0.5),
                    margin: 10,
                    stockPos: ( index: number ) => {
                        //break and divide the cardSpace by total cards and then divide remaining space evenly
                        let spacePerCard = shelf.dim.x / (this.stock.length) 
                        return new Vector(index*spacePerCard + shelf.margin*index, 0)
                    }
                }
                Scene.node( {
                    description: "store-Shelf",
                    rect: { width: shelf.dim.x, height: shelf.dim.y },
                    localMatrix: Matrix.identity.vTranslate(shelf.pos),
                    onRender: () => {
                        // g.drawRect(Vector.zero, shelf.dim, "gray")
                    },
                    content: () => {
                        this.stock.cards.forEach( ( card, i ) => Scene.node( {
                            description: "store-Stock",
                            localMatrix: Matrix.translation(shelf.stockPos(i).x, shelf.stockPos(i).y),
                            
                            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
                            onRender: () => card.render(),
                            onHover: () => {
                                // console.log(card.type.name)
                            },
                            onClick: () => {
                                // console.log("Unit:", unitTray.selectedUnit())
                                if (world.selectedUnit()) {
                                    let copy = this.stock.cards.splice(i, 1)[0]
                                    // console.log("COPY:", copy[0])
                                    world.selectedUnit()?.draw.addCard(copy)
                                    // console.log("trying to buy!")
                                }
                            }
                        } ) )
                    }
                } )
            }
        } )
    }
}