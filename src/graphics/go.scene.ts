import * as THREE from "three";
import { AssetType, AssetsManager } from "./assets-manager.class";
import { PreloadableScene } from "./preloadable-scene.class";

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

export class GoScene extends PreloadableScene({ assets }) {
    static async create(raycaster: THREE.Raycaster) {
        await GoScene.preload();

        return new GoScene(raycaster);
    }

    private pendingStone = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, .1), new THREE.MeshNormalMaterial())

    private bigBoard!: THREE.Mesh;
    private smallBoard!: THREE.Mesh;

    constructor(private raycaster: THREE.Raycaster) {
        super();

        this.pendingStone.visible = false;
        this.add(this.pendingStone);

        const desk = GoScene.assets.getAsset("desk");
        this.add(desk.scene);

        const board = GoScene.assets.getAsset("goBoard").scene;

        for(const child of board.children) {
            if(child.name === "board") continue;
            if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.visible = false;
                if(child.name === "big") {
                    this.bigBoard = child;
                } else if(child.name === "small") {
                    this.smallBoard = child;
                }
            }
        }

        board.position.y = 6.35;
        board.scale.set(2, 2, 2);
        this.add(board);


        const { scene: chair } = GoScene.assets.getAsset("chair");
        chair.position.set(0, 0, -5);
        this.add(chair);
    }

    updateMouse() {
        const [boardIntersection] = this.raycaster.intersectObject(this.bigBoard);

        if(boardIntersection) {
            this.pendingStone.visible = true;
            const boundingBox = new THREE.Box3().setFromObject(this.bigBoard);
            
            const width = boundingBox.max.x - boundingBox.min.x;
            const height = boundingBox.max.z - boundingBox.min.z;

            const segmentWidth = width / (13 - 1);
            const segmentHeight = height / (13 - 1);
            
            const newX = Math.round((boardIntersection.point.x - boundingBox.min.x) / segmentWidth) * segmentWidth;
            const newZ = Math.round((boardIntersection.point.z - boundingBox.min.z) / segmentHeight) * segmentHeight;

            this.pendingStone.position.x = boundingBox.min.x + newX;
            this.pendingStone.position.y = boardIntersection.point.y;
            this.pendingStone.position.z = boundingBox.min.z + newZ;
        } else {
            this.pendingStone.visible = false;
        }
    }
}