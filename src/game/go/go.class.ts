import { BoardSize, BoardSizeToNumber, Game, Point, StoneColor } from "../game.types";
import { areBoardsEqual } from "./are-boards-equal";
import { deleteGroup } from "./delete-group";
import { Cell, Group, Empty, Stone } from "./go.types";
import { mergeGroupsAround } from "./merge-groups-around";
import { pointToKey } from "./point-to-key";


export class Go implements Game {
    private ID_COUNTER = 0;
    private groups = new Map<number, Group>();

    private prevBoard: null | Cell[][] = null;
    private board: Cell[][];

    private currentColor: StoneColor = StoneColor.BLACK;

    onStonePlace?: (color: StoneColor, x: number, y: number) => void;
    onStonesRemove?: (remove: Point[]) => void;
    onStoneColorChange?: (nextColor: StoneColor) => void;
    onGameError?: (err: string) => void;

    constructor(private boardSize: BoardSize) {
        this.board = new Array(BoardSizeToNumber[boardSize]).fill(null).map(() => new Array(BoardSizeToNumber[boardSize]).fill(null).map(() => ({
            type: "empty",
            attachedGroups: new Map()
        })));
    }

    getBoardSize() {
        return this.boardSize;
    }

    getBoard() {
        return this.board.map(col => col.map(cell => cell.type === "empty" ? null : cell.color))
    }

    getCurrentColor() {
        return this.currentColor;
    }

    isEmpty(x: number, y: number) {
        return this.board[x][y].type === "empty";
    }

    async placeStone(x: number, y: number) {
        const current = this.board[x][y];

        if(!current || current.type !== "empty") return new Error("Place is already occupied");

        const nextBoard = this.board.map(r => r.slice(0));
        const nextGroups = new Map(this.groups.entries());
        
        let potentialSuicideGroup: null | number = null;

        if(current.attachedGroups.size === 0) {
            this.createNewGroup(nextBoard, nextGroups, x, y);
        } else {
            let freeBreathPoints = this.getDefaultBreathPointsNumber(x, y);
            const sameColorGroups: number[] = [];
            const oppositeColorGroups: number[] = [];

            for(const [groupID, attachmentPoints] of current.attachedGroups.entries()) {
                const group = nextGroups.get(groupID)!;
                freeBreathPoints -= attachmentPoints.length;

                if(group.color === this.currentColor) sameColorGroups.push(group.id)
                else oppositeColorGroups.push(group.id)
            }

            if(freeBreathPoints > 0) {
                if(sameColorGroups.length > 0) {
                    this.createNewGroup(nextBoard, nextGroups, x, y);
                    mergeGroupsAround(nextBoard, nextGroups, sameColorGroups, x, y);
                } else {
                    this.createNewGroup(nextBoard, nextGroups, x, y);
                }
            } else if (sameColorGroups.length > 0){
                this.createNewGroup(nextBoard, nextGroups, x, y);
                potentialSuicideGroup = mergeGroupsAround(nextBoard, nextGroups, sameColorGroups, x, y);
            } else {
                const newGroup = this.createNewGroup(nextBoard, nextGroups, x, y);
                potentialSuicideGroup = newGroup.groupID;
            }
        }

        const deletedStones: Point[] = [];
        for(const groupToDelete of nextGroups.values()) {
            if(groupToDelete.breath.size > 0) continue;
            if(groupToDelete.id === potentialSuicideGroup) {
                continue;
            }
            deletedStones.push(...deleteGroup(nextBoard, nextGroups, groupToDelete));
        }

        if(potentialSuicideGroup !== null) {
            const suicideData = nextGroups.get(potentialSuicideGroup)!;

            if(suicideData.breath.size === 0) {
                this.onGameError && this.onGameError("Forbidden suicidal move")
                return new Error("Forbidden suicidal move");
            }
        }

        if(this.prevBoard) {
            if(areBoardsEqual(this.prevBoard, nextBoard)) {
                this.onGameError && this.onGameError("Ko")
                return new Error("Ko");
            }
        }

        this.prevBoard = this.board;


        if(this.onStonesRemove) {
            this.onStonesRemove(deletedStones);
        }

        // console.group("Groups update")
        //     console.log("New", Array.from(nextGroups.values()));
        //     console.log("Old", Array.from(this.groups.values()));
        // console.groupEnd();

        this.board = nextBoard;
        this.groups = nextGroups;

        this.onStonePlace && this.onStonePlace(this.currentColor, x, y);
        this.switchColor();
        this.onStoneColorChange && this.onStoneColorChange(this.currentColor);
    }

    getGameState() {
        return this.board;
    }

    private getDefaultBreathPointsNumber(x: number, y: number) {
        let result = 4;

        if(x === 0 || x === BoardSizeToNumber[this.boardSize] - 1) {
            result -= 1;
        }

        if(y === 0 || y === BoardSizeToNumber[this.boardSize] - 1) {
            result -= 1;
        }

        return result;
    }

    private switchColor() {
        if(this.currentColor === StoneColor.BLACK) {
            this.currentColor = StoneColor.WHITE
        } else {
            this.currentColor = StoneColor.BLACK
        }
    }

    private createNewGroup(board: Cell[][], groups: Map<number, Group>, x: number, y: number): Stone {
        const id = this.ID_COUNTER++;

        const space = board[x][y];
        if(space.type !== "empty") throw new Error("Stone already exists");

        for(const groupID of space.attachedGroups.keys()) {
            const group = groups.get(groupID)!;
            const updatedGroup: Group = {
                ...group,
                breath: new Map(group.breath.entries())
            }
            updatedGroup.breath.delete(pointToKey(x, y));

            groups.set(updatedGroup.id, updatedGroup);
        }

        const breath = new Map<string, Point>();
        for(const dx of [-1, 0, 1]) {
            if(!board[x + dx]) continue;
            for(const dy of [-1, 0, 1]) {
                const neighbor = board[x + dx][y + dy];
                if(
                    !neighbor 
                    || neighbor.type !== "empty"
                    || dx * dy !== 0 
                    || (dx === 0 && dy === 0)
                ) continue;
                breath.set(pointToKey(x + dx, y + dy), { x: x + dx, y: y + dy });

                const updatedCell: Empty = {
                    type: "empty",
                    attachedGroups: new Map(neighbor.attachedGroups.entries())
                };
                updatedCell.attachedGroups.set(id, [{ x, y }]);
                board[x + dx] = board[x + dx].slice(0);
                board[x + dx][y + dy] = updatedCell;
            }
        }

        groups.set(id, {
            id,
            color: this.currentColor,
            stones: [{ x, y }],
            breath
        })

        const group: Stone = {
            type: "stone",
            color: this.currentColor,
            groupID: id
        };

        board[x][y] = group;

        return group;
    }
}
