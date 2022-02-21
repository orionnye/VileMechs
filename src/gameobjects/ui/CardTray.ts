import Graphics from "../../common/Graphics"
import Scene from "../../common/Scene"
import Game from "../../Game"
import { lerp } from "../../math/math"
import Matrix from "../../math/Matrix"
import { Vector } from "../../math/Vector"
import Card from "../card/Card"
import Unit from "../mech/Unit"

export default class CardTray {
    static selectionTimeout = 500
    static restingDepth = 24
    index = -1
    lastSelectTime: number = -Infinity
    isPickingTarget = false

    constructor() {
    }

    hasCardSelected() { return this.index > -1 }

    selectedCard(unit: Unit) {
        return unit?.hand.cards[ this.index ]
    }

    selectIndex( index: number ) {
        this.index = index
        this.lastSelectTime = Date.now()
    }

    deselect() {
        this.selectIndex( -1 )
        this.isPickingTarget = false
    }

    onSelectUnit(unit: Unit) {
        this.deselect()
        this.lerpCards( unit, 1 )
        let { hand, draw, discard } = unit
        let decks = [ hand, draw, discard ]
        for ( let deck of decks ) {
            for ( let card of deck.cards ) {
                card.yRotation = Math.PI / 2
            }
        }
    }

    update(unit: Unit) {
        let { lastSelectTime } = this
        this.lerpCards(unit, .2 )
        if ( this.hasCardSelected() && !this.isPickingTarget ) {
            let now = Date.now()
            let dt = now - lastSelectTime
            this.selectIndex( -1 )
        }
    }

    lerpCards( unit: Unit, alpha: number ) {
        let flipRate = 0.5
        if ( unit ) {
            let { hand, draw, discard } = unit
            hand.cards.forEach( ( card, i ) => {
                let targetPos = this.handPosition( hand.length, i )
                card.pos = card.pos.lerp( targetPos, alpha )
                card.yRotation = lerp( card.yRotation, 0, alpha * flipRate )
            } )
            draw.cards.forEach( ( card, i ) => {
                let targetPos = this.drawPosition( draw.length, i )
                card.pos = card.pos.lerp( targetPos, alpha )
                card.yRotation = lerp( card.yRotation, Math.PI, alpha * flipRate )
            } )
            discard.cards.forEach( ( card, i ) => {
                let targetPos = this.discardPosition( discard.length, i )
                card.pos = card.pos.lerp( targetPos, alpha )
                card.yRotation = lerp( card.yRotation, Math.PI, alpha * flipRate )
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
        let drawBase = new Vector( 20 - width, screenSize.y - Card.dimensions.y / 1.2 )
        return drawBase.addXY( cardIndex * 3, cardIndex * 3 )
    }
    discardPosition( handLength: number, cardIndex: number ) {
        let screenSize = Game.instance.screenDimensions()
        let stride = 3, width = stride * handLength
        let discardBase = new Vector( screenSize.x - Card.dimensions.x - 10 - width, screenSize.y - Card.dimensions.y / 1.2 )
        return discardBase.addXY( cardIndex * 3, cardIndex * 3 )
    }

    makeSceneNode( unit: Unit ) {
        let g = Graphics.instance
        let hand = unit.hand
        let draw = unit.draw
        let discard = unit.discard
        if ( !hand || !draw || !discard ) return

        const marigin = CardTray.handMargin
        let stride = Card.dimensions.x + marigin
        let width = stride * hand.length - marigin
        Scene.node( {
            description: "card-tray",
            localMatrix: Matrix.vTranslation( this.handBase( hand.length ) ),
            rect: { width, height: Card.dimensions.y },
        } )

        hand.cards.forEach( ( card, i ) => Scene.node( {
            description: "card-hand",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render(),
            onHover: () => {
                this.selectIndex( i )
            },
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

        draw.cards.forEach( ( card, i ) => Scene.node( {
            description: "card-draw",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render()
        } ) )

        discard.cards.forEach( ( card, i ) => Scene.node( {
            description: "card-discard",
            localMatrix: Matrix.vTranslation( card.pos ),
            rect: { width: Card.dimensions.x, height: Card.dimensions.y },
            onRender: () => card.render()
        } ) )
    }
}