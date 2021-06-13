import treantSrc from "../www/images/Treant.png";
import rogueSrc from "../www/images/BloodRogue.png";

const rougeImg = new Image()
rougeImg.src = rogueSrc

import Unit from "./Unit";
import Grid from "./Grid";
import Canvas from "./Canvas";
import SparseGrid from "./SparseGrid";
import { Vector } from "./math";

export default class World {

    map: Grid
    units: Unit[]

    constructor() {
        this.map = new Grid(10, 10, new Vector(500, 500))
        this.units = [
            new Unit(new Vector(0, 0))
        ]

        let randomTerrain = false;
        if (randomTerrain) {
            this.map.randomize(0.3);
        } else {
            //custom map
            this.map.setBlock(new Vector(2, 2), new Vector(4, 4), 1);
        }
    }

    render(c: Canvas) {
        this.drawGrid(c, this.map)
        c.c.drawImage(rougeImg, 0, 0)
    }

    drawGrid(c: Canvas, grid: Grid, numbered: boolean = true) {
        let tileSize = grid.tileSize;
        grid.content.forEach((row, indexR) => {
            row.forEach((tile, indexC) => {
                let currentPos = new Vector(indexC * tileSize.x, indexR * tileSize.y);
                c.strokeRect(currentPos, tileSize);
                //type definition
                if (tile.content == 1) {
                    c.drawRect(currentPos, tileSize, "grey");
                }
                //numbers
                if (numbered) {
                    let textPos = new Vector(indexC * tileSize.x - tileSize.x / 3.3, indexR * tileSize.y);
                    let currentText = indexC.toString() +", "+ indexR.toString();
                    c.drawText(textPos, tileSize.x / 3.3, currentText);
                }
            });
        });
    }

}