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
import { Bulwarkus_Johnson, Chrome, Earth, Flesh, Gelraug, Jelly, Treant } from "./gameobjects/mech/RigTypes"
import CardStore from "./stages/CardStore"
import Grid from "./gameobjects/map/Grid"
import { randomFloor } from "./math/math"
import Title from "./stages/Title"
import Origin from "./stages/Origin"
import Lose from "./stages/Lose"
import DealerShip from "./stages/DealerShip"
import PawnShop from "./stages/PawnShop"
import Route from "./stages/route/Route"
import { capitalize } from "./common/utils"

const vacationurl = require( './www/audio/Vacation.mp3' )
let vacation = new Audio( vacationurl )
const knockurl = require( './www/audio/Knock.mp3' )
let knock = new Audio( knockurl )

// activity 
export type Activity =
    //mid-screens
    "title" |
    "origin" |
    "lose" |
    //stat testing
    "match" |
    //stat management
    "shop" |
    "dealerShip" |
    "pawnShop" |
    //test plans
    "route"

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

    store: CardStore
    dealerShip: DealerShip
    pawnShop: PawnShop

    route: Route

    scrip: number
    scripRewards: number[]

    match: Match
    level: number = 0

    // units : Unit[]
    team: Team
    unitMax: number = 3


    //Dev stats
    showSceneDebug = false
    showFPS = false
    clock = new Clock()

    isPlayerDone = false
    activity: Activity = "title"

    constructor() {
        Game.instance = this

        //Transition Stages
        this.title = new Title()
        this.lose = new Lose()
        this.origin = new Origin()
        this.route = new Route()

        //Shop Stages
        this.store = new CardStore()
        this.store.reset()

        this.dealerShip = new DealerShip()
        this.dealerShip.reset()
        this.pawnShop = new PawnShop()
        this.pawnShop.reset()

        //Store Init
        this.scrip = 20
        this.scripRewards = [ 50, 40, 30, 20, 10 ]

        //player team Init
        let units = [
            new Earth( new Vector( 0, 0 ), 0 ),
            // new Chrome(new Vector(0, 0), 0),
            // new Treant(new Vector(0, 0), 0),
            // new Flesh(new Vector(0, 0), 0),
        ]

        this.team = new Team( "Choden Warriors", "cyan", units, false, 0 )
        //Match Init
        this.match = new Match( this.team )
        if ( this.activity == "match" ) {
            this.match.start()
        }

        window.addEventListener( "resize", ev => this.graphics.onResize() )
        // onWheel, onMouseup, onMousedown
        for ( let name of [ "click", "keyup", "keydown", "wheel", "mouseup", "mousedown" ] )
            window.addEventListener( name, ev => this[ "on" + capitalize( name ) ]( ev ) )
    }

    // get team() {
    //     let playerTeam = new Team("Choden Warriors", this.units, false, 0)
    //     // playerTeam.units = this.units
    //     return playerTeam
    // }
    get randomUnit() {
        let mechList = [
            new Chrome( new Vector( 0, 0 ), 1 ),
            new Earth( new Vector( 0, 0 ), 1 )
        ]
        let random = randomFloor( mechList.length )
        return mechList[ random ]
    }
    get randomBoss() {
        let mechList = [
            new Gelraug( new Vector( 0, 0 ), 1 ),
            new Bulwarkus_Johnson( new Vector( 0, 0 ), 1 )
        ]
        let random = randomFloor( mechList.length )
        return mechList[ random ]
    }
    // get randomStage() {
    //     let options: Activity[] = [
    //         "match",
    //         "shop",
    //         "pawnShop",
    //         "dealerShip"
    //     ]
    //     let randomPick = options[randomFloor(options.length)]
    //     return randomPick
    // }
    get randomShop() {
        let options: Activity[] = [
            "shop",
            "pawnShop",
            "dealerShip"
        ]
        let randomPick = options[ randomFloor( options.length ) ]
        return randomPick
    }
    reset() {
        this.level = 1
        this.scrip = 20
    }

    changeStage( stage: Activity ) {
        let delay = 100
        window.setTimeout( () => {
            switch ( stage ) {
                case "match": {
                    this.level += 1
                    if ( this.level >= this.route.length ) {
                        this.match.startBoss()
                    } else {
                        this.match.start()
                    }
                }
                case "shop": {
                    this.store.reset()
                    this.activity = stage
                }
                case "route": {
                    let peak = 0
                    this.route.options.forEach( option => {
                        if ( option.traverse().length >= peak ) {
                            peak = option.traverse().length
                        }
                    } )
                    if ( this.level > peak ) {
                        this.route.reset( 6 )
                    }
                }
                default: {
                    this.activity = stage
                }
            }
        }, delay )
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

        if ( this.activity == "match" ) {
            this.match.update()
        }

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
    onMousedown( ev: MouseEvent ) {
        if ( this.activity == "match" )
            this.match.onMousedown( ev )
    }
    onMouseup( ev: MouseEvent ) {
        if ( this.activity == "match" )
            this.match.onMouseup( ev )
    }
    onWheel( ev: WheelEvent ) {
        if ( this.activity == "match" )
            this.match.onWheel( ev )
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
                    g.setFont( 5, "pixel" )
                    g.drawTextBox( new Vector( center.x / 4, 0 ), `SCRIP Reward: ${ this.scripReward } `, {
                        textColor: "#c2c2c2", boxColor: "rgba(200, 80, 80, 0.7)", alignX: TextAlignX.left
                    } )
                    g.drawTextBox( new Vector( center.x / 4, 8 ), `SCRIP: ${ this.scrip } `, {
                        textColor: "#c2c2c2", boxColor: "rgba(200, 80, 80, 0.7)", alignX: TextAlignX.left
                    } )
                }
            },
            content: () => {
                switch ( this.activity ) {
                    case "shop":
                        //-----------------Card Shop Display-------------------
                        store.makeSceneNode()
                        break
                    case "dealerShip":
                        //-----------------Mech Shop Display-------------------
                        this.dealerShip.makeSceneNode()
                        break
                    case "pawnShop":
                        //-----------------Pawn Shop Display-------------------
                        this.pawnShop.makeSceneNode()
                        // unitTray.makeSceneNode( new Vector( 0, 0 ), this.team )
                        break
                    case "match" || "boss":
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
                        //Lose
                        this.lose.makeSceneNode()
                        break
                    case "route":
                        //Pathfinding to the next match
                        this.route.makeSceneNode()
                        break
                }
            }
        } )
    }
    screenDimensions() { return this.graphics.size.scale( 1 / Game.uiScale ) }
    screenCenter() { return this.graphics.size.scale( 0.5 / Game.uiScale ) }
}