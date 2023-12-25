import { Point } from "../game.types";
import { Cell, Group } from "./go.types";
import { pointToKey } from "./point-to-key";

export const deleteGroup = (board: Cell[][], groups: Map<number, Group>, groupToDelete: Group): Point[] => {
    groups.delete(groupToDelete.id);

    const deletedStones: Point[] = []

    for(const stone of groupToDelete.stones) {
        deletedStones.push(stone);
        const attachedGroups = new Map<number, Point[]>();

        for(const dx of [-1, 0, 1]) {
            if(!board[stone.x + dx]) continue;

            for(const dy of [-1, 0, 1]) {
                if(dx * dy !== 0 || (dx === 0 && dy === 0)) continue;

                const cell = board[stone.x + dx][stone.y + dy];
                if(!cell || cell.type === "empty" || cell.groupID === groupToDelete.id) continue;
                
                if(!attachedGroups.has(cell.groupID)) {
                    attachedGroups.set(cell.groupID, []);
                }
                
                attachedGroups.get(cell.groupID)?.push({ x: stone.x + dx, y: stone.y + dy });

                const group = groups.get(cell.groupID)!;
                const updatedGroup: Group = {
                    ...group,
                    breath: new Map(group.breath.entries())
                }
                updatedGroup.breath.set(pointToKey(stone.x, stone.y), stone);
                groups.set(updatedGroup.id, updatedGroup);
            }
        }

        board[stone.x] = board[stone.x].slice(0)
        board[stone.x][stone.y] = {
            type: "empty",
            attachedGroups
        }
    }

    return deletedStones;
}