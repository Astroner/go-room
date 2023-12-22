import * as THREE from "three";

import { AssetType, PreloadableScene, createAssets } from "./preloadable-scene.class";

const assets = createAssets({
    cup: {
        type: AssetType.GLTF,
        path: "/assets/stones-cup.glb"
    }
})

export class CupScene extends PreloadableScene({ assets }) {
    constructor() {
        super();


        const cup = CupScene.assets.getAsset("cup").scene.clone();
        cup.scale.setScalar(.6);
        cup.children[0].castShadow = true;
        cup.children[0].receiveShadow = true;
        this.add(cup);
    }
}