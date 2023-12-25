import { Cell, Group, Point } from "./go.types";

export const mergeGroupsAround = (board: Cell[][], groups: Map<number, Group>, sameColorGroups: number[], x: number, y: number): number => {
    const center = board[x][y];
    if(center.type !== "stone") throw new Error("Memes");

    let firstOperand = groups.get(center.groupID)!;

    let mainGroup;
    let secondaryGroup;
    for(const groupID of sameColorGroups) {
        const group = groups.get(groupID)!;

        if(firstOperand.stones.length > group.stones.length) {
            mainGroup = firstOperand;
            secondaryGroup = group;
        } else {
            mainGroup = group;
            secondaryGroup = firstOperand;
        }

        mainGroup = { 
            ...mainGroup,
            breath: new Map(mainGroup.breath.entries()),
            stones: mainGroup.stones.slice(0) 
        };
        groups.set(mainGroup.id, mainGroup);
        groups.delete(secondaryGroup.id);
        
        for(const stone of secondaryGroup.stones) {
            mainGroup.stones.push(stone);
            board[stone.x] = board[stone.x].slice(0);
            board[stone.x][stone.y] = {
                type: "stone",
                color: mainGroup.color,
                groupID: mainGroup.id
            }
        }

        for(const [breathPointKey, breathPoint] of secondaryGroup.breath.entries()) {
            const breath = board[breathPoint.x][breathPoint.y];
            if(breath.type !== "empty") continue;
            mainGroup.breath.set(breathPointKey, breathPoint);

            const nextAttachedGroups = new Map<number, Point[]>(breath.attachedGroups.entries());

            const secondaryGroupEntry = nextAttachedGroups.get(secondaryGroup.id)!;
            nextAttachedGroups.delete(secondaryGroup.id);
            
            if(!nextAttachedGroups.has(mainGroup.id)) {
                nextAttachedGroups.set(mainGroup.id, []);
            }
            const mainGroupEntry = nextAttachedGroups.get(mainGroup.id)!;
            mainGroupEntry.push(...secondaryGroupEntry);

            board[breathPoint.x] = board[breathPoint.x].slice(0);
            board[breathPoint.x][breathPoint.y] = {
                type: "empty",
                attachedGroups: nextAttachedGroups
            }
        }

        firstOperand = mainGroup;
    }

    if(!mainGroup) throw new Error("Merge did not happened");

    return mainGroup.id;
}