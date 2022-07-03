import { Vector } from "./math/Vector"
import Matrix from "./math/Matrix"
import Match from './stages/Match'
import Input from "./common/Input"
import Graphics, { TextAlignX } from "./common/Graphics"
import "./common/GlobalTypes"
import { PickingResult, SceneNode } from "./common/Scene"
import Scene from "./common/Scene"
import Camera from "./gameobjects/Camera"
import Clock from "./common/Clock"
import Unit from "./gameobjects/mech/Unit"
import content from "*.css"
import Team from "./gameobjects/mech/Team"
import { Chrome, Earth, Flesh, Treant } from "./gameobjects/mech/RigTypes"
import CardStore from "./stages/CardStore"
import Grid from "./gameobjects/map/Grid"
import { randomFloor } from "./math/math"
import Title from "./stages/Title"
import Origin from "./stages/Origin"
import Lose from "./stages/Lose"
const vacationurl = require( './www/audio/Vacation.mp3' )
let vacation = new Audio( vacationurl )
const knockurl = require( './www/audio/Knock.mp3' )
let knock = new Audio( knockurl )

// activity 
type Activity = "shop" | "match" | "title" | "origin" | "lose"

export default class Game {
    static instance: Game
    static uiScale = 3
    static camVelocityDecay = 0.85
    graphics = new Graphics()
    input = new Input()
    scene: SceneNode = { localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ) }
    mouseOverData: PickingResult = { node: undefined, point: new Vector( 0, 0 ) }
    
    //Scene List (paired with their relevant stats)
    title: Title
    origin: Origin
    lose: Lose

    match: Match
    level: number = 1
    
    store: CardStore
    scrip: number
    scripRewards : number[]
    units : Unit[]


    //Dev stats
    showSceneDebug = false
    showFPS = false
    clock = new Clock()

    isPlayerDone = false

    activity: Activity = "match"

    constructor() {
        Game.instance = this

        this.title = new Title()
        this.origin = new Origin()
        this.lose = new Lose()

        //Store Init
        this.store = new CardStore()
        this.store.reset()
        this.scrip = 15
        this.scripRewards = [50, 20, 0]
        
        //player team Init
        this.units = [
            new Earth(new Vector(0, 0), 0),
            new Chrome(new Vector(0, 0), 0),
            // new Treant(new Vector(0, 0), 0),
            // new Flesh(new Vector(0, 0), 0),
        ]
        // this.units = []
        
        //Match Init
        this.match = new Match( this.team )
        this.match.start()


        window.addEventListener( "click", ev => this.onClick( ev ) )
        window.addEventListener( "resize", ev => this.graphics.onResize() )
        window.addEventListener( "keyup", ev => this.onKeyup( ev ) )
        window.addEventListener( "keydown", ev => this.onKeydown( ev ) )
    }
    get team() {
        let playerTeam = new Team("Choden Warriors", false, 0)
        playerTeam.units = this.units
        return playerTeam
    }
    get shopping() {
        return (this.activity == "shop")
    }
    get randomUnit() {
        let mechList = [
            new Chrome( new Vector( 0, 0 ), 1 ),
            // new Treant( new Vector( 0, 0 ), 1 ),
            // new Flesh( new Vector( 0, 0 ), 1 ),
            // new Earth( new Vector( 0, 0 ), 1 ),
        ]
        let random = randomFloor( mechList.length )
        return mechList[ random ]
    }
    generateEnemies( amount: number ) {
        this.match.teams[ 1 ] = new Team( "Drunken Scholars", true, 1 )
        // console.log(mechList[0])
        for ( let i = 0; i < amount; i++ ) {
            this.match.teams[ 1 ].units.push( this.randomUnit )
        }
    }
    //----------------MODEL------------------
    get scripReward() {
        let rewardIndex = this.match.timer >= this.scripRewards.length ? this.scripRewards.length - 1 : this.match.timer
        return this.scripRewards[ rewardIndex ]
    }
    //----------------------UPDATE----------------------------
    update() {
        let { match } = this
        this.clock.nextFrame()

        this.match.update()

        this.makeSceneNode()
        //user Input Display
        this.mouseOverData = Scene.pick( this.scene, this.input.cursor )
        let { node, point } = this.mouseOverData
        if ( node?.onHover )
            node.onHover( node, point )
    }

    //---------------------------User Input---------------------------
    onClick( ev: MouseEvent ) {
        let cursor = this.input.cursor
        let { node, point } = Scene.pick( this.scene, cursor )
        if ( node && !this.input.keys.get( "shift" ) ) {
            if ( node.onClick )
                node.onClick( node, point )
        }
    }
    
    onKeyup( ev: KeyboardEvent ) {
        if ( ev.key == "`" ) {
            this.showSceneDebug = !this.showSceneDebug
        }
        if ( ev.key == "," ) {
            this.showFPS = !this.showFPS
        }
    }
    onKeydown( ev: KeyboardEvent ) {
        if ( ev.key == "Tab" ) {
            ev.preventDefault()
        }
    }

    //--------------------------RENDER-----------------------------
    render() {
        let g = this.graphics
        g.c.imageSmoothingEnabled = false
        g.c.fillStyle = "#2b69f5"
        g.c.fillRect( 0, 0, g.size.x, g.size.y )
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

        if ( this.showFPS ) {
            g.setFont( 24, "impact" )
            g.drawText( Vector.one.scale( 2 ), this.clock.averageFPS.toFixed( 2 ), "red" )
        }
    }
    makeSceneNode() {
        let g = Graphics.instance
        let { match, store } = this
        let { unitTray, cardTray } = this.match
        let selectedUnit = this.match.activeTeam().selectedUnit()
        let center = Game.instance.screenCenter()
        this.scene = Scene.node( {
            localMatrix: Matrix.scale( Game.uiScale, Game.uiScale ),
            onRenderPost: () => {
                if ( this.activity == "match" ) {
                    //TEAM NAME DISPLAY
                    // g.setFont( 6, "pixel" )
                    // g.drawTextBox( new Vector( center.x, 0 ), this.match.activeTeam().name, {
                    //     textColor: "#c2c2c2", boxColor: "#6969698f", alignX: TextAlignX.center
                    // } )
                    //Money / Reward for current round, and Timer
                    g.setFont( 6, "pixel" )
                    g.drawTextBox( new Vector( center.x/2, 0 ), `SCRIP: ${ this.scripReward } `, {
                        textColor: "#c2c2c2", boxColor: "rgba(200, 80, 80, 0.7)", alignX: TextAlignX.center
                    } )
                    // g.drawTextBox( new Vector( center.x/2, 0 ), `SCRIP: ${ this.scrip } `, {
                    //     textColor: "#c2c2c2", boxColor: "rgba(200, 80, 80, 0.7)", alignX: TextAlignX.center
                    // } )
                }
            },
            content: () => {

                switch (this.activity) {
                    case "shop":
                        //-----------------Shopping Display-------------------
                        store.makeSceneNode()
                        unitTray.makeSceneNode( new Vector( 0, 0 ), match.teams[ 0 ] )
                        break
                    case "match":
                        //-----------------Match Display-----------------------
                        match.makeSceneNode()
                        g.c.restore()
                        if ( this.match.turn == 0 ) {
                            unitTray.makeSceneNode( new Vector( 0, 0 ), match.teams[ 0 ] )
                        } else {
                            //display Unit Tray backwords for second player
                            unitTray.makeSceneNode( new Vector( this.screenDimensions().x, 0 ), match.activeTeam(), true )
                        }
                        if ( selectedUnit ) {
                            cardTray.makeSceneNode( selectedUnit )
                        }
                        break
                    case "title":
                        //Title
                        this.title.makeSceneNode()
                        break 
                    case "origin":
                        //Origin
                        this.origin.makeSceneNode()
                        break 
                    case "lose":
                        //Origin
                        this.lose.makeSceneNode()
                        break 
                }
            }
        } )
    }
    screenDimensions() { return this.graphics.size.scale( 1 / Game.uiScale ) }
    screenCenter() { return this.graphics.size.scale( 0.5 / Game.uiScale ) }
}