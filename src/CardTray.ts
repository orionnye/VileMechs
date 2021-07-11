import Card from "./Card"
import Game from "./Game"
import Graphics from "./Graphics"
import { clamp } from "./math/math"
import Matrix from "./math/Matrix"
import { Vector } from "./math/Vector"
import Scene, { SceneNode } from "./scene/Scene"

export default class CardTray {
    static selectionTimeout = 500
    static restingDepth = 32
    index = -1
    cardCount: number
    cardElevations: number[] = []
    lastSelectTime: number = -Infinity
    isPickingTarget = false

    constructor( cardCount = 4 ) {
        this.cardCount = cardCount
        for ( let i = 0; i < cardCount; i++ )
            this.cardElevations.push( 0 )
    }

    hasCardSelected() { return this.index > -1 }

    selectedCard() {
        let unit = Game.instance.selectedUnit()
        return unit?.cards[ this.index ]
    }

    selectIndex( index: number ) {
        this.index = index
        this.lastSelectTime = Date.now()
    }

    deselect() {
        this.selectIndex( -1 )
        this.isPickingTarget = false
    }

    update() {
        let { index, cardCount, cardElevations, lastSelectTime } = this
        for ( let i = 0; i < cardCount; i++ ) {
            let dy = ( i == index ) ? 2 : -2
            cardElevations[ i ] = clamp( 0, CardTray.restingDepth, cardElevations[ i ] + dy )
        }
        if ( this.hasCardSelected() && !this.isPickingTarget ) {
            let now = Date.now()
            let dt = now - lastSelectTime
            if ( dt > CardTray.selectionTimeout )
                this.selectIndex( -1 )
        }
    }

    makeSceneNode() {
        let g = Graphics.instance
        let cards = Game.instance.selectedUnit()?.cards
        if ( !cards ) return

        const marigin = 3
        let stride = Card.dimensions.x + marigin
        let width = stride * cards.length - marigin

        let screenSize = g.size.scale( 1 / Game.uiScale )
        let offset = new Vector( screenSize.x / 2 - width / 2, screenSize.y - Card.dimensions.y + CardTray.restingDepth )

        let { startNode, endNode, terminalNode } = Scene
        startNode( {
            description: "card-tray",
            localMatrix: Matrix.vTranslation( offset ),
            rect: { width, height: Card.dimensions.y }
        } )
        cards.forEach( ( card, i ) => terminalNode( {
            description: "card",
            color: "orange",
            localMatrix: Matrix.translation( stride * i, -this.cardElevations[ i ] ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render( Vector.zero ),
            onHover: () => { if ( !this.isPickingTarget ) this.index = i },
            onClick: () => {
                let isSelectedCard = this.index == i
                if ( this.isPickingTarget && isSelectedCard ) {
                    this.deselect()
                } else {
                    this.index = i
                    this.isPickingTarget = true
                }
            }
        } ) )
        endNode()
    }
}