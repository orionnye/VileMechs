import treantSrc from "../www/images/Treant.png";
import rogueSrc from "../www/images/BloodRogue.png";

import { Vector } from './math';
import { clearCanvas, drawGrid, fillCell, drawRect } from './render';
import { Card, Deck } from './card';
import Character from './character';
import Input from "./input";
import Grid from './grid';
import "./GlobalTypes";


//------------------Page Access---------------------
let canvas = <HTMLCanvasElement> document.getElementById("canvas1");
let c = canvas.getContext("2d");
let canvasSize = new Vector(canvas.clientWidth, canvas.clientHeight);
//images
let treant = new Image();
treant.src = treantSrc;
let rogue = new Image();
rogue.src = rogueSrc;
//player input
let input = new Input();
input.watchCursor();
input.watchMouse();
input.watchKeys();


//-------------------WORLD DATA --------------------
let map = new Grid(10, 10, new Vector(500, 500));
let player = new Character(new Vector(0, 0));
let enemy = new Character(new Vector(5, 5));

//random terrain switch
let randomTerrain = 1;
if (randomTerrain) {
    map.randomize(0.3);
} else {
    //custom map
    map.setBlock(new Vector(2, 2), new Vector(4, 4), 1);
}

//!!!!!!!!!!!!!temporary deck data!!!!!!!!!!!!!!will be ported into character class when done
let draw = new Deck(new Vector(10, 400), new Vector(4, 1));
draw.getRandomCards(3);
let hand = new Deck(new Vector(300, 400), new Vector(70, 0));
hand.max = 3;
//card stats test
let discard = new Deck(new Vector(850, 400), new Vector(4, 1));
discard.getRandomCards(2);
player.draw.getRandomCards(10);
player.draw.cards[0].r = 255;
draw.cards[0].g = 0;
draw.cards[0].b = 0;
draw.cards[0].onApply = (player, enemy) => {
    console.log("CUSTOM RED EFFECT");
};


//-------------------CORE GAME LOOP--------------------
function update() {
    //useless and fun mouse centering display
    if (input.keys.get("a")) {
        map.pos = map.pos.add(new Vector(10, 0));
    }
    if (input.keys.get("d")) {
        map.pos = map.pos.subtract(new Vector(10, 0));
    }
    if (input.keys.get("s")) {
        map.pos = map.pos.subtract(new Vector(0, 10));
    }
    if (input.keys.get("w")) {
        map.pos = map.pos.add(new Vector(0, 10));
    }
    //onclick player movement
    if (input.mouse.get(0)) {
        let cell = map.pick(input.cursor);
        if (map.containsCell(cell)) {
            if (map.content[cell.y][cell.x].content == 0) {
                player.pos = cell;
            }
        }
    }
    //card cycling
    if (input.keys.get("Enter")) {
        //timers are cosmetic
        //discard
        hand.emptyInto(discard);
        //draw
        hand.addCards(draw.removeCards(hand.max));
        if (draw.cards.length == 0) {
            discard.emptyInto(draw);
            draw.shuffle();
            if (hand.cards.length < hand.max) {
                let missing = hand.max - hand.cards.length;
                hand.addCards(draw.removeCards(missing));
            }
        }
    }
    //card picking
    hand.cards.forEach(card => {
        if (card.contains(input.cursor)) {
            card.apply(player, enemy);
        }
    });
    
}
function render() {
    clearCanvas();
    
    //draw Character
    let playerCell = player.pos.cross(map.tileSize);
    let enemyCell = enemy.pos.cross(map.tileSize);
    drawRect(enemyCell.add(map.pos), map.tileSize, "red");
    drawGrid(map);
    
    c.drawImage(rogue, playerCell.x+map.pos.x, playerCell.y+map.pos.y, 50, 50);
    c.drawImage(treant, 100+map.pos.x, 100+map.pos.y, 100, 100);

    //card rendering
    draw.render();
    hand.render();
    discard.render();
}
function reload() {
    update();
    render();
    window.requestAnimationFrame(reload);
}
reload();