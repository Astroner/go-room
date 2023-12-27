import { BoardSize, Game, Point, StoneColor } from "../game/game.types";

export type Subscription = {
    unsubscribe(): void;
}

export type OnBoardClick = (x: number, y: number) => void;

export interface Model {
    createOfflineGame(boardSize: BoardSize): Promise<Game>;
}

export interface View {
    init(boardSize: BoardSize): Promise<void>
    destroy(): Promise<void>

    addStone(color: StoneColor, x: number, y: number): void;
    removeStones(stones: Point[]): void;
    setCurrentColor(color: StoneColor): void;

    onBoardClick(cb: OnBoardClick): Subscription;
}