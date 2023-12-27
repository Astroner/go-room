import * as THREE from "three";
import { AssetType, createAssets, PreloadableScene } from "./preloadable-scene.class";
import { StoneColor } from "../../game/game.types";

const assets = createAssets({
    stone: {
        path: "/assets/stone.glb",
        type: AssetType.GLTF
    }
})

export class StoneScene extends PreloadableScene({ assets }) {
    private stone: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

    constructor(color: StoneColor = StoneColor.BLACK, transparent: boolean = false, disableShadow = false) {
        super();

        const mesh = StoneScene.assets.getAsset("stone").scene.children[0];
        if(!(mesh instanceof THREE.Mesh) || !(mesh.material instanceof THREE.MeshStandardMaterial)) {
            throw new Error("Unexpected mesh loaded");
        }

        const material = mesh.material.clone();
        if(transparent) {
            material.transparent = true;
            material.opacity = .3;
        }

        if(color === StoneColor.WHITE) {
            material.color.set(0xffffff);
        } else {
            material.color.set(0x000000);
        }

        this.stone = new THREE.Mesh(mesh.geometry, material);
        if(!transparent && !disableShadow) {
            this.stone.castShadow = true;
        }
        this.stone.scale.setScalar(.2);


        this.add(this.stone)
    }

    setColor(color: StoneColor) {
        if(color === StoneColor.WHITE) {
            this.stone.material.color.set(0xffffff);
        } else {
            this.stone.material.color.set(0x000000);
        }
    }
}