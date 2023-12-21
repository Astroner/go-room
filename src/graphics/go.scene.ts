import * as THREE from "three";
import { AssetType } from "./assets-manager.class";
import { PreloadableScene, createAssets } from "./preloadable-scene.class";
import { StoneScene } from "./stone.scene";

const assets = createAssets({
    goBoard: {
        type: AssetType.GLTF,
        path: "/assets/go-board.glb"
    },
    desk: {
        type: AssetType.GLTF,
        path: "/assets/desk.glb"
    },
    chair: {
        type: AssetType.GLTF,
        path: "/assets/chair.glb"
    }
})

export class GoScene extends PreloadableScene({ assets, dependencies: [StoneScene] }) {
    static async create(raycaster: THREE.Raycaster) {
        await GoScene.preload();

        return new GoScene(raycaster);
    }

    private pendingStone = new StoneScene();
    
    private bigBoard!: THREE.Mesh;
    private smallBoard!: THREE.Mesh;
    private boardBox!: THREE.Box3;

    private isWhite = false;
    private gameData = {
        x: 0,
        y: 0
    }; 

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
                    this.boardBox = new THREE.Box3().setFromObject(child);
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

    mouseClick() {
        const stone = new StoneScene(this.isWhite ? "white" : "black");
        stone.position.copy(this.pendingStone.position);
        this.add(stone);
        
        this.isWhite = !this.isWhite;
        this.pendingStone.setColor(this.isWhite ? "white" : "black");
    }

    updateMouse() {
        const [boardIntersection] = this.raycaster.intersectObject(this.bigBoard);

        if(boardIntersection) {
            this.pendingStone.visible = true;            
            const width = this.boardBox.max.x - this.boardBox.min.x;
            const height = this.boardBox.max.z - this.boardBox.min.z;

            const segmentWidth = width / (6);
            const segmentHeight = height / (6);

            this.gameData.x = Math.round((boardIntersection.point.x - this.boardBox.min.x) / segmentWidth);
            this.gameData.y = Math.round((boardIntersection.point.z - this.boardBox.min.z) / segmentHeight);
            
            const newX = this.gameData.x * segmentWidth;
            const newZ = this.gameData.y * segmentHeight;

            this.pendingStone.position.x = this.boardBox.min.x + newX;
            this.pendingStone.position.y = boardIntersection.point.y;
            this.pendingStone.position.z = this.boardBox.min.z + newZ;
        } else {
            this.pendingStone.visible = false;
        }
    }
}