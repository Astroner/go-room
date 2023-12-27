import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { BoardSize, Point, StoneColor } from "@/src/game/game.types";

import { GoScene } from "./go.scene";
import { RoomScene } from "./room.scene";
import { Subscription } from "../mvvm.types";

export class CanvasView {
    static DEBUGGING = false;

    static CAMERA_DEFAULT_X_ROTATION = -.7;
    static CAMERA_X_ROTATION_AVAILABLE = Math.PI / 30;
    static CAMERA_X_ROTATION_SPEED_RATIO = 0.015;

    static CAMERA_DEFAULT_Y_ROTATION = 0;
    static CAMERA_Y_ROTATION_AVAILABLE = Math.PI / 40;
    static CAMERA_Y_ROTATION_SPEED_RATIO = 0.015;

    private mouse = new THREE.Vector2(.5, .5);

    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private raycaster = new THREE.Raycaster();
        
    private goScene: GoScene | null = null;

    private onBoardClickListener?: (x: number, y: number) => void;

    constructor(
        width: number,
        height: number,
        canvas: HTMLCanvasElement,
    ) {
        if(CanvasView.DEBUGGING) {
            GoScene.DEBUGGING = true;
            RoomScene.DEBUGGING = true;
        }

        this.camera = new THREE.PerspectiveCamera(45, width / height);
        this.camera.position.set(0, 12, 6);

        this.camera.rotation.set(CanvasView.CAMERA_DEFAULT_X_ROTATION, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setClearColor(0xfe9380)
        this.renderer.setSize(width, height)
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    init(boardSize: BoardSize): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.renderer.domElement.addEventListener("mousemove", this.mouseMoveHandler);
            this.renderer.domElement.addEventListener("click", this.mouseClickHandler);

            const scene = new THREE.Scene();

            await Promise.all([
                GoScene.preload(),
                RoomScene.preload()
            ])

            this.goScene = new GoScene(this.raycaster, boardSize);
            if(this.onBoardClickListener) {
                this.goScene.onMouseClick = this.onBoardClickListener;
            }
            
            const room = new RoomScene(this.goScene);
            scene.add(room);

            const controls = CanvasView.DEBUGGING ? new OrbitControls(this.camera, this.renderer.domElement) : null;

            let once = false;
            this.renderer.setAnimationLoop((data, ss) => {
                this.renderer.render(scene, this.camera);
                if(!once) {
                    once = true;
                    resolve();
                }
    
                this.tick();

                controls?.update();
            })
        })
    }

    private tick(){
        {
            let targetAngle;
            if(this.mouse.y < .2 || this.mouse.y > .8) {
                targetAngle = CanvasView.CAMERA_DEFAULT_X_ROTATION + (this.mouse.y * -2 + 1) * CanvasView.CAMERA_X_ROTATION_AVAILABLE;
            } else {
                targetAngle = CanvasView.CAMERA_DEFAULT_X_ROTATION;
            }

            const diff = targetAngle - this.camera.rotation.x;

            this.camera.rotation.x += diff * CanvasView.CAMERA_X_ROTATION_SPEED_RATIO;
        }

        {
            let targetAngle;
            if(this.mouse.x < .2 || this.mouse.x > .8) {
                targetAngle = CanvasView.CAMERA_DEFAULT_Y_ROTATION + (this.mouse.x * -2 + 1) * CanvasView.CAMERA_Y_ROTATION_AVAILABLE;
            } else {
                targetAngle = CanvasView.CAMERA_DEFAULT_Y_ROTATION;
            }

            const diff = targetAngle - this.camera.rotation.y;

            this.camera.rotation.y += diff * CanvasView.CAMERA_Y_ROTATION_SPEED_RATIO;
        }
    }

    async destroy() {
        this.renderer.domElement.removeEventListener("mousemove", this.mouseMoveHandler);
        this.renderer.dispose();
    }

    async addStone(color: StoneColor, x: number, y: number) {
        if(!this.goScene) return;

        this.goScene.addStone(color, x, y);
    }

    async removeStones(stones: Point[]) {
        if(!this.goScene) return;

        this.goScene.removeStones(stones);
    }

    setCurrentColor(color: StoneColor): void {
        if(this.goScene) {
            this.goScene.setCurrentColor(color);
        }
    }

    onBoardClick(cb: (x: number, y: number) => void): Subscription {
        if(!this.goScene) {
            this.onBoardClickListener = cb;
        } else {
            this.goScene.onMouseClick = cb;
        }
        
        return {
            unsubscribe: () => {
                if(this.goScene) {
                    this.goScene.onMouseClick = undefined;
                }
            }
        }
    }

    setSize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private mouseMoveHandler = (e: MouseEvent) => {
        this.mouse.set(e.clientX / this.renderer.domElement.clientWidth, e.clientY / this.renderer.domElement.clientHeight);


        this.raycaster.setFromCamera(new THREE.Vector2(this.mouse.x * 2 - 1, this.mouse.y * -2 + 1), this.camera);

        if(this.goScene) {
            this.goScene.updateMouse();
        }
    }

    private mouseClickHandler = (e: MouseEvent) => {
        if(this.goScene) this.goScene.mouseClick();
    }
}