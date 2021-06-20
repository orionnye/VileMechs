import { randomFloor } from "./math/math";
import { Vector } from "./math/Vector";
import Input from "./Input";
import Graphics from "./Graphics";
import names from "./names";
import { getImg } from "./utils";
import Card from "./Card";
import Game from "./Game";

const baseUnitImg = getImg( require( "../www/images/BaseEnemy.png" ) )

export default class Unit {
    name: string;
    pos: Vector;
    speed: number;
    energy: number;
    color: string;
    health: number;

    cards: Card[] = []

    constructor( pos ) {
        this.name = names[ randomFloor( names.length ) ]
        this.pos = pos;
        this.speed = 4;
        this.energy = 2;
        this.color = "red";
        this.health = 10;

        for ( let i = 0; i < 4; i++ )
            this.cards.push( new Card() )
    }

    render( offset = Vector.zero ) {
        let g = Graphics.instance
        g.c.drawImage( baseUnitImg, offset.x, offset.y )

        //  Nametag
        g.c.shadowBlur = 0
        const fontSize = 3.5
        g.c.font = fontSize + "px pixel";

        let name = this.name
        const maxLength = 8
        if ( name.length > maxLength )
            name = name.slice( 0, maxLength - 3 ) + "..."

        let metrics = g.c.measureText( name )
        let textDims = new Vector( metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent )
        let textOffset = offset.add( new Vector( 1, 31 - textDims.y ) )
        g.drawRect( textOffset, textDims, "grey" )
        g.drawText( textOffset, fontSize, name, "black" )
    }

    renderCards() {
        let g = Graphics.instance

        const marigin = 10
        let stride = Card.dimensions.x + marigin
        let width = stride * this.cards.length - marigin
        const heightAboveBottom = 20

        let screenSize = g.size.scale( 1 / Game.uiScale )
        let offset = new Vector( screenSize.x / 2 - width / 2, screenSize.y - heightAboveBottom )

        this.cards.forEach( ( card, i ) => {
            card.render( offset.add( Vector.right.scale( stride * i ) ) 
        } )

    }
}