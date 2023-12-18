import * as THREE from "three";
import { AssetType, AssetsManager } from "./assets-manager.class";

import { GoScene } from "./go.scene";
import { PreloadableScene } from "./preloadable-scene.class";

const assets = {
    room: {
        type: AssetType.GLTF as AssetType.GLTF,
        path: "/assets/room.glb"
    }
}

export class RoomScene extends PreloadableScene({ assets, dependencies: [GoScene] }) {
    static async create(rayCaster: THREE.Raycaster) {
        await RoomScene.preload()

        return new RoomScene(rayCaster);
    }

    private goScene: GoScene;

    constructor(private rayCaster: THREE.Raycaster) {
        super();

        this.goScene = new GoScene(rayCaster);
        this.add(this.goScene);

        const room = RoomScene.assets.getAsset("room");
        this.add(room.scene);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
        hemiLight.position.set(0, 20, 0);
        this.add(hemiLight);
    }

    mouseChange() {
        this.goScene.updateMouse();
    }
}