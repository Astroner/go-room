import { BoardSize, Game } from "../game/game.types";
import { Model, Subscription, View } from "./mvc.types";

export class Controller {
    private currentGame?: Game;

    private viewSub?: Subscription;

    constructor(
        private model: Model, 
        private view: View
    ) {

    }

    async startOfflineGame(size: BoardSize) {
        const game = await this.model.createOfflineGame(size);
        this.currentGame = game;

        await this.view.init(size);

        const board = game.getBoard();

        for(let x = 0; x < board.length; x++) {
            for(let y = 0; y < board[x].length; y++) {
                const color = board[x][y];

                if(color) {
                    this.view.addStone(color, x, y);
                }
            }
        }

        this.viewSub = this.view.onBoardClick((x, y) => {
            game.placeStone(x, y);
        })

        game.onGameError = (err) => console.error(err);
        game.onStoneColorChange = this.view.setCurrentColor.bind(this.view);
        game.onStonePlace = this.view.addStone.bind(this.view);
        game.onStonesRemove = this.view.removeStones.bind(this.view);
    }

    stop() {
        this.view.destroy();
        if(this.currentGame) {
            delete this.currentGame.onGameError;
            delete this.currentGame.onStoneColorChange;
            delete this.currentGame.onStonePlace;
            delete this.currentGame.onStonesRemove;
        }
        this.viewSub && this.viewSub.unsubscribe();
    }
}