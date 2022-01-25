import Clock from "./common/Clock"
import Input from "./common/Input"
import { getImg } from "./common/utils"
import Game from "./Game"
import Camera from "./gameobjects/Camera"
import Card from "./gameobjects/Card"
import { Deck } from "./gameobjects/Deck"
import UnitTray from "./gameobjects/UnitTray"
import World from "./gameobjects/World"
import Graphics from "./Graphics"
import { randomFloor } from "./math/math"
import Matrix from "./math/Matrix"
import { Vector } from "./math/Vector"
import Scene, { PickingResult, SceneNode } from "./Scene"


const Jungle = getImg( require( "./www/images/BackgroundPixel1.png" ) )
const Jungle2 = getImg( require( "./www/images/BackgroundPixel2.png" ) )
const Swamp = getImg( require( "./www/images/BackgroundPixel3.png" ) )
const Forest = getImg( require( "./www/images/BackgroundPixel4.png" ) )
const Backgrounds = [ Jungle, Jungle2, Swamp, Forest]

export default class Store {
    static instance: Store

    //-----STORE DATA------
    world: World
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


    constructor( world: World ) {
        Store.instance = this
        this.world = world
        this.image = Backgrounds[Math.floor(Math.random()*4)];
        window.addEventListener( "click", ev => this.onClick( ev ) )
        // window.addEventListener( "mousedown", ev => this.onMousedown( ev ) )
        window.addEventListener( "mouseup", ev => this.onMouseup( ev ) )
        // window.addEventListener( "wheel", ev => this.onWheel( ev ) )
        window.addEventListener( "resize", ev => this.graphics.onResize() )
        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )
    }
    

    //Utility Functions
    selectedUnit() { return this.unitTray.selectedUnit() }
    playerUnits() { return this.world.units.filter( unit => unit.teamNumber == 0 ) }
    reset() {
        this.stock = new Deck(5)
        this.image = Backgrounds[Math.floor(Math.random()*4)]
    }

    //---------------------------User Input---------------------------
    onClick( ev: MouseEvent ) {
        //switch that shuts off player input during enemy turn
        let cursor = this.input.cursor
        let { node, point } = Scene.pick( this.scene, cursor )
            if ( node && !this.input.keys.get( "shift" ) ) {
            if ( node.onClick )
                node.onClick( node, point )
        }
    }
    onMouseup( ev: MouseEvent ) {
        this.camera.stopDragging()
    }
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
    render()  {
        //Background
        let g = this.graphics
        g.c.imageSmoothingEnabled = false
        // g.c.fillStyle = "#636912"
        // g.c.fillRect( 0, 0, g.size.x, g.size.y )

        g.c.drawImage( this.image, 0, 0, this.image.width, this.image.height, 0, 0, g.size.x, g.size.y )
        g.c.textBaseline = "top"
        let picked = Scene.pickNode( this.scene, this.input.cursor )
        if ( this.showSceneDebug ) {
            if ( picked ) picked.debugColor = "white"
            Scene.render( g.c, this.scene, true )
            g.setFont( 12, "pixel" )
            g.drawText( this.input.cursor.add( Vector.one.scale( 20 ) ), picked?.description ?? "", "white" )
        } else {
            Scene.render( g.c, this.scene, false )
        }

        //----SIGN RENDERING----
        //static Sign data storage
        const Sign = {
            pos: new Vector(450, 0),
            size: new Vector(550, 150),
            text: {
                pos: new Vector(80, 30),
                size: 100,
            },
        }
        //Sign rendering
        g.drawRect(Sign.pos, Sign.size, "rgba(0, 0, 100, 0.5)")
        g.setFont(Sign.text.size, "Times")
        g.drawText(Sign.pos.add(Sign.text.pos), "Scavenge", "white")
    }

    makeSceneNode() {
        let g = Graphics.instance
        let { unitTray } = this

        const shelf = {
            pos: new Vector(150, 250),
            margin: new Vector(Card.dimensions.x + 10, 0)
        }

        this.scene = Scene.node( {
            localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ),
            content: () => {
                unitTray.makeSceneNode(this.playerUnits())
                this.stock.cards.forEach( ( card, i ) => Scene.node( {
                    description: "store-Stock",
                    localMatrix: Matrix.vTranslation( shelf.pos.add(shelf.margin.scale(i)) ),
                    
                    rect: { width: Card.dimensions.x, height: Card.dimensions.y },
                    onRender: () => card.render(),
                    onHover: () => {
                        // console.log(card.type.name)
                    },
                    onClick: () => {
                        // console.log("Unit:", unitTray.selectedUnit())
                        if (unitTray.selectedUnit()) {
                            let copy = this.stock.cards.splice(i, 1)[0]
                            // console.log("COPY:", copy[0])
                            unitTray.selectedUnit()?.draw.addCard(copy)
                            console.log("trying to buy!")
                        }
                    }
                } ) )
            }
        } )
    }
}