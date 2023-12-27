import { Game, Point, StoneColor } from "../game/game.types";
import { Subscription } from "./mvvm.types";

export type OnStonePlaced = (color: StoneColor, x: number, y: number) => void;
export type OnStonesRemoved = (stones: Point[]) => void;
export type OnError = (err: string) => void;
export type OnStoneColorChange = (color: StoneColor) => void;

export class ViewModel {
    private onStonePlacedListeners = new Set<OnStonePlaced>()
    private onStonesRemovedListeners = new Set<OnStonesRemoved>()
    private onErrorListeners = new Set<OnError>()
    private onStoneColorChangeListeners = new Set<OnStoneColorChange>()

    constructor(private game: Game) {
        game.onGameError = (err) => {
            this.onErrorListeners.forEach(listener => listener(err));
        }
        game.onStoneColorChange = (color) => {
            this.onStoneColorChangeListeners.forEach(listener => listener(color));
        }
        game.onStonePlace = (color, x, y) => {
            this.onStonePlacedListeners.forEach(listener => listener(color, x, y));
        }
        game.onStonesRemove = (stones) => {
            this.onStonesRemovedListeners.forEach(listener => listener(stones));
        }
    }

    destroy() {
        this.onStonePlacedListeners.clear();
        this.onStonesRemovedListeners.clear();
        this.onErrorListeners.clear();
        this.onStoneColorChangeListeners.clear();

        this.game.onGameError = undefined;
        this.game.onStoneColorChange = undefined;
        this.game.onStonePlace = undefined;
        this.game.onStonesRemove = undefined;
    }

    getGameState() {
        return this.game.getBoard();
    }

    async boardClick(x: number, y: number) {
        const err = await this.game.placeStone(x, y);

        return err;
    }

    onStoneColorChange(cb: OnStoneColorChange): Subscription {
        this.onStoneColorChangeListeners.add(cb);

        return {
            unsubscribe: () => {
                this.onStoneColorChangeListeners.delete(cb);
            }
        }
    }
    onError(cb: OnError): Subscription {
        this.onErrorListeners.add(cb);

        return {
            unsubscribe: () => {
                this.onErrorListeners.delete(cb);
            }
        }
    }
    onStonesRemoved(cb: OnStonesRemoved): Subscription {
        this.onStonesRemovedListeners.add(cb);

        return {
            unsubscribe: () => {
                this.onStonesRemovedListeners.delete(cb);
            }
        }
    }
    onStonePlaced(cb: OnStonePlaced): Subscription {
        this.onStonePlacedListeners.add(cb);

        return {
            unsubscribe: () => {
                this.onStonePlacedListeners.delete(cb);
            }
        }
    }
}