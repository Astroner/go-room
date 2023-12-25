export enum StoneColor {
    WHITE,
    BLACK
}

export enum BoardSize {
    S9,
    S13,
    S19
}

export const BoardSizeToNumber: Record<BoardSize, number> = {
    [BoardSize.S9]: 9,
    [BoardSize.S13]: 13,
    [BoardSize.S19]: 19,
}

export type Point = {
    x: number,
    y: number
};

export interface Game {
    getBoard(): Array<Array<null | StoneColor>>;
    isEmpty(x: number, y: number): boolean;
    placeStone(x: number, y: number): Promise<void | Error>;
    getCurrentColor(): StoneColor;
    getBoardSize(): BoardSize;

    onStonePlace?: (color: StoneColor, x: number, y: number) => void;
    onStonesRemove?: (remove: Point[]) => void;
    onStoneColorChange?: (nextColor: StoneColor) => void;
    onGameError?: (err: string) => void;
}