import * as THREE from "three";
import { AssetType, AssetsManager } from "./assets-manager.class";

import { GoScene } from "./go.scene";
import { PreloadableScene, createAssets } from "./preloadable-scene.class";

const assets = createAssets({
    room: {
        type: AssetType.GLTF,
        path: "/assets/room.glb"
    }
})

export class RoomScene extends PreloadableScene({ assets, dependencies: [GoScene] }) {
    static DEBUGGING = false;

    static async create(rayCaster: THREE.Raycaster) {
        await RoomScene.preload()

        return new RoomScene(rayCaster);
    }

    private goScene: GoScene;

    constructor(rayCaster: THREE.Raycaster) {
        super();
        if(RoomScene.DEBUGGING) {
            GoScene.DEBUGGING = true;
        }

        this.goScene = new GoScene(rayCaster);
        this.add(this.goScene);

        const room = RoomScene.assets.getAsset("room");
        this.add(room.scene);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
        hemiLight.position.set(0, 20, 0);
        this.add(hemiLight);

        const projector = new THREE.DirectionalLight(0xEDEAD4, 10);
        projector.position.set(40, 20, 0);
        projector.castShadow = true;
        projector.target.position.y = 8;
        this.add(projector);
        this.add(projector.target);



        if(RoomScene.DEBUGGING) {
            const helper = new THREE.CameraHelper(projector.shadow.camera);
            this.add(helper);
        }

    }

    mouseChange() {
        this.goScene.updateMouse();
    }

    mouseClick() {
        if(this.goScene) this.goScene.mouseClick();
    }
}