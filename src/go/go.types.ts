export enum StoneColor {
    WHITE,
    BLACK
}

export type Point = {
    x: number,
    y: number
};

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