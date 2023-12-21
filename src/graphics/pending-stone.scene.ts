import * as THREE from "three";
import { PreloadableScene } from "./preloadable-scene.class";
import { StoneScene } from "./stone.scene";

export class PendingStoneScene extends PreloadableScene({ dependencies: [StoneScene] }) {
    private highStone = new StoneScene(undefined, undefined, true);
    private lowStone = new StoneScene(undefined, true);

    constructor() {
        super();

        this.highStone.position.set(0, .4, 0);
        this.add(this.highStone);

        this.add(this.lowStone);
    }

    setColor(color: "black" | "white") {
        this.highStone.setColor(color);
        this.lowStone.setColor(color);
    }
}