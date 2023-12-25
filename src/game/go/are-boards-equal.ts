import { Cell } from "./go.types";

export const areBoardsEqual = (first: Cell[][], second: Cell[][]) => {
    for(let x = 0; x < first.length; x++) {
        for(let y = 0; y < first[x].length; y++) {
            const firstCell = first[x][y];
            const secondCell = second[x][y];
            
            if(firstCell.type !== secondCell.type) return false;
            if(firstCell.type === "stone" && secondCell.type === "stone") {
                if(firstCell.color !== secondCell.color) return false;
            }
        }
    }

    return true;
}