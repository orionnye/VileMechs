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
    lastSelectTime: number = -Infinity
    isPickingTarget = false

    constructor( cardCount = 4 ) {
        this.cardCount = cardCount
    }

    hasCardSelected() { return this.index > -1 }

    selectedCard() {
        let unit = Game.instance.selectedUnit()
        return unit?.hand[ this.index ]
    }

    selectIndex( index: number ) {
        this.index = index
        this.lastSelectTime = Date.now()
    }

    deselect() {
        this.selectIndex( -1 )
        this.isPickingTarget = false
    }

    onSelectUnit() {
        this.deselect()
        this.lerpCards( 1 )
    }

    update() {
        let { lastSelectTime } = this
        this.lerpCards( .2 )
        if ( this.hasCardSelected() && !this.isPickingTarget ) {
            let now = Date.now()
            let dt = now - lastSelectTime
            if ( dt > CardTray.selectionTimeout )
                this.selectIndex( -1 )
        }
    }

    lerpCards( alpha ) {
        let unit = Game.instance.selectedUnit()
        if ( unit ) {
            let hand = unit.hand
            let draw = unit.draw
            let discard = unit.discard
            hand.forEach( ( card, i ) => {
                let targetPos = this.handPosition( hand.length, i )
                card.pos = card.pos.lerp( targetPos, alpha )
            } )
            draw.forEach( ( card, i ) => {
                let targetPos = this.drawPosition( draw.length, i )
                card.pos = card.pos.lerp( targetPos, alpha )
            } )
            discard.forEach( ( card, i ) => {
                let targetPos = this.discardPosition( discard.length, i )
                card.pos = card.pos.lerp( targetPos, alpha )
            } )
        }
    }

    handPosition( handLength: number, cardIndex: number ) {
        const marigin = 3
        let stride = Card.dimensions.x + marigin
        let width = stride * handLength - marigin
        let screenSize = Game.instance.screenDimensions()
        let handBase = new Vector( screenSize.x / 2 - width / 2, screenSize.y - Card.dimensions.y + CardTray.restingDepth )
        let elevation = cardIndex == this.index ? CardTray.restingDepth : 0
        return handBase.addXY( stride * cardIndex, -elevation )
    }

    drawPosition( handLength: number, cardIndex: number ) {
        let screenSize = Game.instance.screenDimensions()
        let drawBase = new Vector( 10, screenSize.y - Card.dimensions.y / 3 * 2 )
        return drawBase.addXY( cardIndex * 3, cardIndex * 3 )
    }

    discardPosition( handLength: number, cardIndex: number ) {
        let screenSize = Game.instance.screenDimensions()
        let discardBase = new Vector( screenSize.x - Card.dimensions.x - 20, screenSize.y - Card.dimensions.y / 3 * 2 )
        return discardBase.addXY( cardIndex * 3, cardIndex * 3 )
    }

    makeSceneNode() {
        let g = Graphics.instance
        let hand = Game.instance.selectedUnit()?.hand
        let draw = Game.instance.selectedUnit()?.draw
        let discard = Game.instance.selectedUnit()?.discard
        if ( !hand || !draw || !discard ) return

        let { startNode, endNode, terminalNode } = Scene

        hand.forEach( ( card, i ) => terminalNode( {
            description: "card-hand",
            color: "orange",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render(),
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

        draw.forEach( ( card, i ) => terminalNode( {
            description: "card-draw",
            color: "orange",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render()
        } ) )

        discard.forEach( ( card, i ) => terminalNode( {
            description: "card-discard",
            color: "orange",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render()
        } ) )
    }
}