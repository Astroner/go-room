import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AssetType, AssetsManager } from "./assets-manager.class";
import { GoScene } from "./go.scene";

export class App {
    static CAMERA_DEFAULT_X_ROTATION = -.7;
    static CAMERA_X_ROTATION_AVAILABLE = Math.PI / 30;
    static CAMERA_X_ROTATION_SPEED_RATIO = 0.015;

    static CAMERA_DEFAULT_Y_ROTATION = 0;
    static CAMERA_Y_ROTATION_AVAILABLE = Math.PI / 40;
    static CAMERA_Y_ROTATION_SPEED_RATIO = 0.015;

    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    private assets = new AssetsManager({
        room: {
            type: AssetType.GLTF,
            path: "/assets/room.glb"
        }
    });
    
    private mouse = new THREE.Vector2(.5, .5);

    constructor(
        width: number,
        height: number,
        canvas: HTMLCanvasElement,
    ) {
        this.camera = new THREE.PerspectiveCamera(45, width / height);
        this.camera.position.set(0, 12, 6);

        this.camera.rotation.set(App.CAMERA_DEFAULT_X_ROTATION, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setClearColor(0xfe9380)
        this.renderer.setSize(width, height)
    }

    async loadAssets() {
        await this.assets.load();
    }

    start() {
        return new Promise<void>(async (resolve, reject) => {
            await this.loadAssets();
            const scene = new THREE.Scene();

            const goScene = await GoScene.create();
            scene.add(goScene);

            const room = this.assets.getAsset("room");
            scene.add(room.scene);
    
            // const controls = new OrbitControls(this.camera, this.renderer.domElement);

            let once = false;
            this.renderer.setAnimationLoop((data, ss) => {
                
                this.renderer.render(scene, this.camera);
                if(!once) {
                    once = true;
                    resolve();
                }


                {
                    let targetAngle;
                    if(this.mouse.y < .2 || this.mouse.y > .8) {
                        targetAngle = App.CAMERA_DEFAULT_X_ROTATION + (this.mouse.y * -2 + 1) * App.CAMERA_X_ROTATION_AVAILABLE;
                    } else { 
                        targetAngle = App.CAMERA_DEFAULT_X_ROTATION;
                    }

                    const diff = targetAngle - this.camera.rotation.x;

                    this.camera.rotation.x += diff * App.CAMERA_X_ROTATION_SPEED_RATIO;
                }

                {
                    let targetAngle;
                    if(this.mouse.x < .2 || this.mouse.x > .8) {
                        targetAngle = App.CAMERA_DEFAULT_Y_ROTATION + (this.mouse.x * -2 + 1) * App.CAMERA_Y_ROTATION_AVAILABLE;
                    } else {
                        targetAngle = App.CAMERA_DEFAULT_Y_ROTATION;
                    }

                    const diff = targetAngle - this.camera.rotation.y;

                    this.camera.rotation.y += diff * App.CAMERA_Y_ROTATION_SPEED_RATIO;
                }
    
                // controls.update();
            })
        })
    }

    stop() {
        this.renderer.dispose();
    }

    setSize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    setMouse(x: number, y: number) {
        this.mouse.set(x, y);
    }
}