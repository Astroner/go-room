import { Game } from "../game/game.types";
import { Subscription } from "./mvvm.types";
import { ViewModel } from "./view-model";
import { CanvasView } from "./view/canvas.view";

export class App {
    private view: CanvasView;
    
    private subs: Subscription[] = [];
    private vm: ViewModel | null = null;

    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        this.view = new CanvasView(width, height, canvas);
    }

    async start(game: Game) {
        const vm = new ViewModel(game);

        this.subs.push(
            this.view.onBoardClick((x, y) => {
                vm.boardClick(x, y);
            })
        )
        
        this.subs.push(
            vm.onError((err) => {
                console.log(err);
            })
        )

        this.subs.push(
            vm.onStoneColorChange((color) => {
                this.view.setCurrentColor(color);
            })
        )

        this.subs.push(
            vm.onStonePlaced((color, x, y) => {
                this.view.addStone(color, x, y);
            })
        )

        this.subs.push(
            vm.onStonesRemoved((stones) => {
                this.view.removeStones(stones);
            })
        )

        this.vm = vm;

        await this.view.init(game.getBoardSize());
    }

    stop() {
        this.view.destroy();
        
        if(this.vm) {
            this.vm.destroy();
        }

        for(const sub of this.subs) {
            sub.unsubscribe();
        }
    }

    setSize(width: number, height: number) {
        this.view.setSize(width, height);
    }
}