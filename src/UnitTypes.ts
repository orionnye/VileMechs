import { getImg } from "./common/utils"
import Game from "./Game"
import Card from "./gameobjects/Card"
import Unit from "./gameobjects/Unit"
import World from "./gameobjects/World"
import { Vector } from "./math/Vector"
import { findPath } from "./pathfinding"

// const chrome = getImg( require( "./www/images/units/MinigunMech_sheet.png" ) )
// const frost = getImg( require( "./www/images/cards/icon/frost.png" ) )

// export type UnitType = {
//     name: string,
//     sprite: HTMLImageElement
// }
// const UnitTypes: { [ name: string ]: UnitType } = {
//     chrome: {
//         name: "Asdf",
//         sprite: chrome

//     }
// }