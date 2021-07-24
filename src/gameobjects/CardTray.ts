import Card from "./Card"
import Game from "../Game"
import Graphics from "../Graphics"
import { clamp } from "../math/math"
import Matrix from "../math/Matrix"
import { Vector } from "../math/Vector"
import Scene, { SceneNode } from "../Scene"

export default class CardTray {
    static selectionTimeout = 500
    static restingDepth = 22
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
            let hand = unit.hand, draw = unit.draw, discard = unit.discard
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

    static handMargin = 3
    handBase( handLength: number ) {
        const marigin = CardTray.handMargin
        let stride = Card.dimensions.x + marigin
        let width = stride * handLength - marigin
        let screenSize = Game.instance.screenDimensions()
        return new Vector( screenSize.x / 2 - width / 2, screenSize.y - Card.dimensions.y + CardTray.restingDepth )
    }
    handPosition( handLength: number, cardIndex: number ) {
        const marigin = CardTray.handMargin
        let stride = Card.dimensions.x + marigin
        let elevation = cardIndex == this.index ? CardTray.restingDepth : 0
        return this.handBase( handLength ).addXY( stride * cardIndex, -elevation )
    }
    drawPosition( handLength: number, cardIndex: number ) {
        let screenSize = Game.instance.screenDimensions()
        let stride = 3, width = stride * handLength
        let drawBase = new Vector( 10 - width / 2, screenSize.y - Card.dimensions.y / 3 * 2 - width / 2 )
        return drawBase.addXY( cardIndex * 3, cardIndex * 3 - width / 2 )
    }
    discardPosition( handLength: number, cardIndex: number ) {
        let screenSize = Game.instance.screenDimensions()
        let stride = 3, width = stride * handLength
        let discardBase = new Vector( screenSize.x - Card.dimensions.x - 10 - width / 2, screenSize.y - Card.dimensions.y / 3 * 2 - width / 2 )
        return discardBase.addXY( cardIndex * 3, cardIndex * 3 )
    }

    makeSceneNode() {
        let g = Graphics.instance
        let hand = Game.instance.selectedUnit()?.hand
        let draw = Game.instance.selectedUnit()?.draw
        let discard = Game.instance.selectedUnit()?.discard
        if ( !hand || !draw || !discard ) return

        const marigin = CardTray.handMargin
        let stride = Card.dimensions.x + marigin
        let width = stride * hand.length - marigin
        Scene.node( {
            description: "card-tray",
            localMatrix: Matrix.vTranslation( this.handBase( hand.length ) ),
            rect: { width, height: Card.dimensions.y },
        } )

        hand.forEach( ( card, i ) => Scene.node( {
            description: "card-hand",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render(),
            onHover: () => { if ( !this.isPickingTarget ) this.selectIndex( i ) },
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

        draw.forEach( ( card, i ) => Scene.node( {
            description: "card-draw",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render()
        } ) )

        discard.forEach( ( card, i ) => Scene.node( {
            description: "card-discard",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render()
        } ) )
    }
}