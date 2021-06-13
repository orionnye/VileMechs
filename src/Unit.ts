import baseUnitSrc from "../www/images/BaseEnemy.png";
const baseUnitImg = new Image()
baseUnitImg.src = baseUnitSrc

import { randomFloor, Vector } from "./math";
import Input from "./Input";
import { Deck } from "./Deck";
import Canvas from "./Canvas";
import names from "./names";

export default class Unit {
    name: string;
    pos: Vector;
    speed: number;
    energy: number;
    color: string;
    health: number;
    hand: Deck;
    draw: Deck;
    discard: Deck;

    constructor( pos ) {
        // this.name = "Igor Von Hefty Jhonson";
        this.name = names[ randomFloor( names.length ) ]
        this.pos = pos;
        this.speed = 4;
        this.energy = 2;
        this.color = "red";
        this.health = 10;
        //card stats test
        this.draw = new Deck( new Vector( 10, 470 ), new Vector( 1, 1 ) );
        this.hand = new Deck( new Vector( 300, 430 ), new Vector( 70, 0 ) );
        this.discard = new Deck( new Vector( 800, 470 ), new Vector( 2, 1 ) );
        this.draw.getRandomCards( 10 );
        this.hand.max = 3;
    }
    endTurn() {
        let { draw, hand, discard } = this;
        hand.emptyInto( discard );
        //draw
        hand.addCards( draw.removeCards( hand.max ) );
        if ( draw.cards.length == 0 ) {
            discard.emptyInto( draw );
            draw.shuffle();
            if ( hand.cards.length < hand.max ) {
                let missing = hand.max - hand.cards.length;
                hand.addCards( draw.removeCards( missing ) );
            }
        }
    }
    validMove( index ) {
        let { pos, speed } = this;
        if ( pos.subtract( index ).length <= speed )
            return true
        return false
    }
    move( index ) {
        if ( this.validMove( index ) )
            this.pos = new Vector( index.x, index.y );
    }
    renderCards( pos: Vector = Vector.zero ) {
        this.draw.render( pos );
        this.hand.render( pos );
        this.discard.render( pos );
    }
    render( cv: Canvas, offset = Vector.zero ) {
        cv.c.drawImage( baseUnitImg, offset.x, offset.y )

        const fontSize = 4
        cv.c.font = fontSize + "px pixel";
        let metrics = cv.c.measureText( this.name )
        let textDims = new Vector( metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent )
        let textOffset = offset.add( new Vector( 1, 31 - textDims.y ) )
        cv.drawRect( textOffset, textDims, "grey" )
        cv.drawText( textOffset, fontSize, this.name, "black" )
    }
}