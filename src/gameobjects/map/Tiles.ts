import { getImg } from "../../common/utils"
import { Vector } from "../../math/Vector"
import { BasicTile } from "./Tile"

// export const Grass = new BasicTile( {
//     name: "grass", traversalCost: 1, elevation: 0, texture: getImg( require( "../www/images/tiles/flat/grass.png" ) )
// } )
export const Grass = new BasicTile( {
    name: "grass", traversalCost: 1, elevation: 0, texture: getImg( require( "../../www/images/tiles/iso/grass.png" ) ),
    align: Vector.upRight
} )
export const GrassHill = new BasicTile( {
    name: "grassHill", traversalCost: Infinity, elevation: 1, texture: getImg( require( "../../www/images/tiles/flat/hill5.png" ) )
} )
export const WaterShallow = new BasicTile( {
    name: "waterShallow", traversalCost: Infinity, elevation: -1, texture: getImg( require( "../../www/images/tiles/flat/ShallowWater.png" ) )
} )
export const WaterDeep = new BasicTile( {
    name: "waterDeep", traversalCost: Infinity, elevation: -2, texture: getImg( require( "../../www/images/tiles/flat/DeepWater.png" ) )
} )
export const AncientMech = new BasicTile( {
    name: "ancientMech", traversalCost: Infinity, elevation: 1, texture: getImg( require( "../../www/images/tiles/flat/ancientMech.png" ) )
} )
