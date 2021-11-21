import { getImg } from "../common/utils"
import { BasicTile } from "./Tile"

export const Grass = new BasicTile( { name: "grass", traversalCost: 1, texture: getImg( require( "../www/images/tiles/flat/grass.png" ) ) } )
export const GrassHill = new BasicTile( { name: "grassHill", traversalCost: Infinity, texture: getImg( require( "../www/images/tiles/flat/hill5.png" ) ) } )
export const WaterShallow = new BasicTile( { name: "ancientMech", traversalCost: Infinity, texture: getImg( require( "../www/images/tiles/flat/ShallowWater.png" ) ) } )
export const WaterDeep = new BasicTile( { name: "ancientMech", traversalCost: Infinity, texture: getImg( require( "../www/images/tiles/flat/DeepWater.png" ) ) } )
export const AncientMech = new BasicTile( { name: "ancientMech", traversalCost: Infinity, texture: getImg( require( "../www/images/tiles/flat/ancientMech.png" ) ) } )
