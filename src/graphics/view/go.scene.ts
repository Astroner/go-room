import * as THREE from "three";
import { AssetType } from "./assets-manager.class";
import { PreloadableScene, createAssets } from "./preloadable-scene.class";
import { StoneScene } from "./stone.scene";
import { PendingStoneScene } from "./pending-stone.scene";
import { CupScene } from "./cup.scene";
import { BoardSize, BoardSizeToNumber, Point, StoneColor } from "../../game/game.types";

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
    },
    placeStone: {
        type: AssetType.AUDIO,
        path: "/assets/place-stone.mp3"
    }
})

export class GoScene extends PreloadableScene({ assets, dependencies: [StoneScene, PendingStoneScene, CupScene] }) {
    static DEBUGGING = false;

    private boardCursor = {
        x: 0,
        y: 0
    };
    
    private pendingStone = new PendingStoneScene();
    private stonesMap = new Map<string, StoneScene>();
    
    private gridPlane!: THREE.Object3D;
    private boardBox!: THREE.Box3;

    private placeStoneTrack: THREE.Audio;

    public onMouseClick?: (x: number, y: number) => void;

    private boardY = 6.35;
    private stoneY = this.boardY + .13;

    constructor(private raycaster: THREE.Raycaster, private boardSize: BoardSize) {
        super();

        if(boardSize === BoardSize.S19) throw new Error("Unsupported board size");

        this.pendingStone.visible = false;
        this.add(this.pendingStone);

        const { scene: desk } = GoScene.assets.getAsset("desk");
        
        const plane = desk.children.find((item): item is THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> => item.name === "desk" && item instanceof THREE.Mesh && item.material instanceof THREE.MeshStandardMaterial)
        if(!plane) {
            throw new Error("Failed to load desk");
        }
        plane.receiveShadow = true;

        this.add(desk);

        const { scene: board } = GoScene.assets.getAsset("goBoard");

        for(const child of board.children) {
            if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                if(child.name !== "board") {
                    if(GoScene.DEBUGGING) {
                        child.material.wireframe = true;
                    } else {
                        child.material.visible = false;
                    }
                }

                if(child.name === "big" && boardSize === BoardSize.S13) {
                    this.gridPlane = child;
                    this.boardBox = new THREE.Box3().setFromObject(child);
                } else if(child.name === "small" && boardSize === BoardSize.S9) {
                    this.gridPlane = child;
                    this.boardBox = new THREE.Box3().setFromObject(child);
                } else if(child.name === "board") {
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            } else {
                throw new Error("Unexpected object");
            }
        }
        
        board.position.y = 6.35;
        board.scale.set(2, 2, 2);
        if(boardSize === BoardSize.S9) {
            board.rotateZ(Math.PI);
        }
        this.add(board);


        const { scene: chair } = GoScene.assets.getAsset("chair");
        chair.position.set(0, 0, -5);
        this.add(chair);

        const cup1 = new CupScene();
        cup1.position.set(-3, 6.35, 1.5);
        this.add(cup1);

        const cup2 = new CupScene();
        cup2.position.set(-3, 6.35, -1.5);
        this.add(cup2);


        const listener = new THREE.AudioListener();
        this.placeStoneTrack = new THREE.Audio(listener);
        this.placeStoneTrack.setBuffer(GoScene.assets.getAsset("placeStone"));
        this.placeStoneTrack.setVolume(.1);
    }

    async mouseClick() {
        if(!this.pendingStone.visible) return;

        if(this.onMouseClick) {
            this.onMouseClick(this.boardCursor.x, this.boardCursor.y);
        }
    }

    updateMouse() {
        const [boardIntersection] = this.raycaster.intersectObject(this.gridPlane);

        if(boardIntersection) {
            const width = this.boardBox.max.x - this.boardBox.min.x;
            const height = this.boardBox.max.z - this.boardBox.min.z;

            const halfBoardSize = Math.floor(BoardSizeToNumber[this.boardSize] / 2);

            const segmentWidth = width / (halfBoardSize);
            const segmentHeight = height / (halfBoardSize);

            const boardX = Math.round((boardIntersection.point.x - this.boardBox.min.x) / segmentWidth);
            const boardZ = Math.round((boardIntersection.point.z - this.boardBox.min.z) / segmentHeight);
            
            const newX = boardX * segmentWidth;
            const newZ = boardZ * segmentHeight;

            this.boardCursor = {
                x: boardX + halfBoardSize / 2,
                y: boardZ + halfBoardSize / 2,
            }

            this.pendingStone.visible = !this.stonesMap.has(`${this.boardCursor.x} ${this.boardCursor.y}`)

            if(!this.pendingStone.visible) return;

            this.pendingStone.position.x = this.boardBox.min.x + newX;
            this.pendingStone.position.y = boardIntersection.point.y + .05;
            this.pendingStone.position.z = this.boardBox.min.z + newZ;
        } else {
            this.pendingStone.visible = false;
        }
    }

    addStone(color: StoneColor, x: number, y: number) {
        const stone = new StoneScene(color);

        const width = this.boardBox.max.x - this.boardBox.min.x;
        const height = this.boardBox.max.z - this.boardBox.min.z;

        const halfBoardSize = Math.floor(BoardSizeToNumber[this.boardSize] / 2);

        const segmentWidth = width / (halfBoardSize);
        const segmentHeight = height / (halfBoardSize);

        stone.position.x = this.boardBox.min.x + (x - halfBoardSize / 2) * segmentWidth;
        stone.position.y = this.stoneY;
        stone.position.z = this.boardBox.min.z + (y - halfBoardSize / 2) * segmentHeight;

        this.add(stone);
        this.stonesMap.set(`${x} ${y}`, stone);
        this.placeStoneTrack.play();
    }

    removeStones(stones: Point[]) {
        for(const stone of stones) {
            this.stonesMap.get(`${stone.x} ${stone.y}`)?.removeFromParent();
            this.stonesMap.delete(`${stone.x} ${stone.y}`);
        }
    }

    setCurrentColor(color: StoneColor) {
        this.pendingStone.setColor(color)
    }
}