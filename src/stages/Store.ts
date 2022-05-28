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
import { Chrome, Earth, Flesh, Treant } from "../gameobjects/mech/RigTypes"
import Unit from "../gameobjects/mech/Unit"
import Tile from "../map/Tile"


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
    mouseOverData: PickingResult = { node: undefined, point: new Vector(0, 0) }
    
    unitTray = new UnitTray()
    stockTotal = 5
    stock = new Deck(this.stockTotal);
    mechs = <Unit[]> [];
    
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
        this.mechs = []
        let mechList = [
            new Chrome(new Vector(0, 0), 0),
            new Treant(new Vector(0, 0), 0),
            new Flesh(new Vector(0, 0), 0),
            new Earth(new Vector(0, 0), 0)
        ]
        for (let i = 0; i < 3; i++) {
            let random = randomFloor(mechList.length)
            this.mechs.push(mechList[random])
            mechList = [
                new Chrome(new Vector(0, 0), 0),
                new Treant(new Vector(0, 0), 0),
                new Flesh(new Vector(0, 0), 0),
                new Earth(new Vector(0, 0), 0)
            ]
        }
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
                let scrip = new Vector(game.screenCenter().x, 40)
                g.drawTextBox(scrip, "Scrip: " + Game.instance.scrip, { boxColor: "rgba(150,60,60,0.9)", padding: 5, alignX: TextAlignX.center} )
                // g.drawTextBox(new Vector(250, 3), "Scrip: " + Game.instance.scrip, { boxColor: "rgba(150, 60, 60, 0.9)", padding: 5 } )
            },
            content: () => {
                //display data(static except for UI Scaling)
                // unitTray.makeSceneNode(this.playerUnits())
                const shelf = {
                    dim: new Vector((game.screenDimensions().x / 5)*3, Card.dimensions.y*1.3),
                    pos: new Vector(game.screenDimensions().x / 5, game.screenDimensions().y * 0.7),
                    margin: 10,
                    cost: 5,
                    stockPos: ( index: number ) => {
                        //break and divide the cardSpace by total cards and then divide remaining space evenly
                        let spacePerCard = shelf.dim.x / (this.stock.length) 
                        return new Vector(index*spacePerCard + shelf.margin*index, 0)
                    }
                }
                const mechShelf = {
                    dim: new Vector(game.screenDimensions().x / 1.7, game.screenDimensions().y / 4),
                    pos: new Vector(game.screenDimensions().x / 5, game.screenDimensions().y * 0.3),
                    margin: 10,
                    scalar: 1,
                    cost: 20,
                    stockPos: ( index: number ) => {
                        //break and divide the cardSpace by total cards and then divide remaining space evenly
                        let spacePerMech = mechShelf.dim.x / (this.mechs.length) 
                        return new Vector(index*spacePerMech + shelf.margin*index, 0)
                    }
                }
                Scene.node( {
                    description: "card-Shelf",
                    rect: { width: shelf.dim.x, height: shelf.dim.y },
                    localMatrix: Matrix.identity.vTranslate(shelf.pos),
                    onRender: () => {
                        g.setFont(13, "Times")
                        g.drawTextBox(new Vector(-50, 35), "Cost: "+ shelf.cost, {boxColor: "rgba(200, 80, 80, 0.9)"} )
                        g.drawRect(new Vector(-game.screenDimensions().x/2, 50), new Vector(game.screenDimensions().x*2, game.screenDimensions().y*2), "gray")
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
                                let game = Game.instance
                                if (world.selectedUnit() && game.scrip >= shelf.cost) {
                                    game.scrip -= shelf.cost
                                    let copy = this.stock.cards.splice(i, 1)[0]
                                    // console.log("COPY:", copy[0])
                                    world.selectedUnit()?.draw.addCard(copy)
                                    // console.log("trying to buy!")
                                }
                            }
                        } ) )
                    }
                } ),
                Scene.node( {
                    description: "mech-Shelf",
                    rect: { width: mechShelf.dim.x*mechShelf.scalar, height: mechShelf.dim.y*mechShelf.scalar },
                    localMatrix: Matrix.identity.vTranslate(mechShelf.pos),
                    onRender: () => {
                        g.setFont(13, "Times")
                        g.drawTextBox(new Vector(-50, 35), "Cost: "+ mechShelf.cost, {boxColor: "rgba(200, 80, 80, 0.9)"} )
                        g.drawRect(new Vector(0, 0), new Vector(mechShelf.dim.x, mechShelf.dim.y), "grey")
                    },
                    content: () => {
                        this.mechs.forEach( ( mech, i ) => Scene.node( {
                            description: "store-Stock",
                            localMatrix: Matrix.translation(mechShelf.stockPos(i).x, mechShelf.stockPos(i).y),
                            
                            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
                            onHover: () => {
                                mechShelf.scalar = 2
                            },
                            onRender: ( node ) =>  {
                                let c = Graphics.instance.c
                                let hover = node == game.mouseOverData.node
                                
                                c.save()
                                if (hover) {
                                    c.scale(mechShelf.scalar, mechShelf.scalar)
                                }
                                mech.render()
                                c.restore()
                            },
                            onClick: () => {
                                // console.log("Unit:", unitTray.selectedUnit())
                                if ( game.scrip >= mechShelf.cost) {
                                    game.scrip -= mechShelf.cost
                                    world.teams[0].units.push(mech)
                                    this.mechs.splice(this.mechs.indexOf(mech), 1)
                                }
                            }
                        } ) )
                    }
                } )
            }
        } )
    }
}