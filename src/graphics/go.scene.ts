import * as THREE from "three";
import { AssetType, AssetsManager } from "./assets-manager.class";

const assets = {
    goBoard: {
        type: AssetType.GLTF as AssetType.GLTF,
        path: "/assets/go-board.glb"
    },
    desk: {
        type: AssetType.GLTF as AssetType.GLTF,
        path: "/assets/desk.glb"
    },
    chair: {
        type: AssetType.GLTF as AssetType.GLTF,
        path: "/assets/chair.glb"
    }
}

export class GoScene extends THREE.Group {
    static assetsLoading: Promise<AssetsManager<typeof assets>> | null = null;
    static assets: AssetsManager<typeof assets>;

    static async create() {
        if(!GoScene.assetsLoading) {
            GoScene.assetsLoading = AssetsManager.create(assets).then((a) => {
                GoScene.assets = a;
                return a;
            });
        }

        await GoScene.assetsLoading;

        return new GoScene();
    }

    constructor() {
        super();

        const desk = GoScene.assets.getAsset("desk");
        this.add(desk.scene);

        const board = GoScene.assets.getAsset("goBoard");
        board.scene.position.y = 6.35;
        board.scene.scale.set(2, 2, 2);
        this.add(board.scene);


        const { scene: chair } = GoScene.assets.getAsset("chair");
        chair.position.set(0, 0, -5);
        this.add(chair);


        const sphereG = new THREE.SphereGeometry(.1);
        const mat = new THREE.MeshNormalMaterial();
        const sphere = new THREE.Mesh(sphereG, mat);
        this.add(sphere);
        sphere.position.set(-7, 21, 1);

        const light = new THREE.PointLight(0xffffff, 400, 100);
        light.position.set(-7, 21, 1);
        this.add(light);

        const light1 = new THREE.PointLight(0xffffff, 400, 100);
        light1.position.set(-7, 21, -1);
        this.add(light1);
    }
}