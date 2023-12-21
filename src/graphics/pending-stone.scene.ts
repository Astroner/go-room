import * as THREE from "three";
import { PreloadableScene } from "./preloadable-scene.class";
import { StoneScene } from "./stone.scene";

export class PendingStoneScene extends PreloadableScene({ dependencies: [StoneScene] }) {
    private stone = new StoneScene(undefined, true);

    constructor() {
        super();
        
        this.add(this.stone);
    }

    setColor(color: "black" | "white") {
        this.stone.setColor(color);
    }
}