import * as THREE from "three";
import { AssetType } from "./assets-manager.class";

import { PreloadableScene, createAssets } from "./preloadable-scene.class";

const assets = createAssets({
    room: {
        type: AssetType.GLTF,
        path: "/assets/room.glb"
    }
})

export class RoomScene extends PreloadableScene({ assets }) {
    static DEBUGGING = false;

    static async create(goScene: THREE.Object3D) {
        await RoomScene.preload()

        return new RoomScene(goScene);
    }

    constructor(
        private goScene: THREE.Object3D
    ) {
        super();
        
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
}