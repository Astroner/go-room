import { BoardSize, Game } from "../game/game.types";
import { Go } from "../game/go/go.class";
import { Controller } from "./controller";
import { Subscription } from "./mvc.types";
import { CanvasView } from "./view/canvas.view";

export class App {
    private view: CanvasView;
    private controller: Controller;
    
    private subs: Subscription[] = [];

    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this.view = new CanvasView(width, height, canvas);
        this.controller = new Controller(
            {
                createOfflineGame: this.createGame.bind(this)
            }, 
            this.view
        );
    }

    async start(boardSize: BoardSize) {
        await this.controller.startOfflineGame(boardSize);
    }

    stop() {
        this.controller.stop();
    }

    setSize(width: number, height: number) {
        this.view.setSize(width, height);
    }

    private async createGame(boardSize: BoardSize) {
        return new Go(boardSize);
    }
}