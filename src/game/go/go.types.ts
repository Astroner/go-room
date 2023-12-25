import { Point, StoneColor } from "../game.types";



export type Group = {
    id: number,
    color: StoneColor;
    breath: Map<string, Point>;
    stones: Point[];
};

export type Empty = {
    type: "empty";
    attachedGroups: Map<number, Point[]>;
}

export type Stone = {
    type: "stone";
    color: StoneColor;
    groupID: number;
};

export type Cell = Stone | Empty;