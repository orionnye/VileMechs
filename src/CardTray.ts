import Card from "./Card"
import Game from "./Game"
import Graphics from "./Graphics"
import { clamp } from "./math/math"
import Matrix from "./math/Matrix"
import { Vector } from "./math/Vector"
import { SceneNode } from "./scene/Scene"

export default class CardTray {

    index = -1
    hasCardSelected() { return this.index > -1 }
    cardCount: number
    cardElevations: number[] = []
    lastSelectTime: number = -Infinity
    static selectionTimeout = 500
    static restingDepth = 32

    constructor( cardCount = 4 ) {
        this.cardCount = cardCount
        for ( let i = 0; i < cardCount; i++ )
            this.cardElevations.push( 0 )
    }

    onSelectUnit() {
        this.selectIndex( -1 )
    }

    selectIndex( index: number ) {
        this.index = index
        this.lastSelectTime = Date.now()
    }

    update() {
        let { index, cardCount, cardElevations, lastSelectTime } = this
        for ( let i = 0; i < cardCount; i++ ) {
            let dy = ( i == index ) ? 2 : -2
            cardElevations[ i ] = clamp( 0, CardTray.restingDepth, cardElevations[ i ] + dy )
        }
        if ( this.hasCardSelected() ) {
            let now = Date.now()
            let dt = now - lastSelectTime
            if ( dt > CardTray.selectionTimeout )
                this.selectIndex( -1 )
        }
    }

    sceneNode( cards: Card[] ): SceneNode {
        let g = Graphics.instance

        const marigin = 3
        let stride = Card.dimensions.x + marigin
        let width = stride * cards.length - marigin

        let screenSize = g.size.scale( 1 / Game.uiScale )
        let offset = new Vector( screenSize.x / 2 - width / 2, screenSize.y - Card.dimensions.y + CardTray.restingDepth )

        return {
            description: "card-tray",
            transform: Matrix.vTranslation( offset ),
            rect: { width, height: Card.dimensions.y },
            children: cards.map(
                ( card, i ) => {
                    return {
                        description: "card",
                        color: "orange",
                        transform: Matrix.translation( stride * i, -this.cardElevations[ i ] ),
                        rect: { width: Card.dimensions.x, height: Card.dimensions.y },
                        onRender: () => card.render( Vector.zero ),
                        onHover: () => { this.index = i }
                    }
                }
            )
        }
    }
}