import { Object3D, Texture, TextureLoader, AudioLoader } from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export enum AssetType {
    OBJ,
    TEXTURE,
    GLTF,
    AUDIO
};

export type Asset = {
    path: string,
    type: AssetType
}

export type AssetTypeToResult = {
    [AssetType.OBJ]: Object3D,
    [AssetType.TEXTURE]: Texture,
    [AssetType.GLTF]: GLTF,
    [AssetType.AUDIO]: AudioBuffer
}

type MapAssets<Assets extends Record<string, Asset>> = {
    [K in keyof Assets]: AssetTypeToResult[Assets[K]['type']]
}

type Loaders = {
    [K in keyof AssetTypeToResult]: (path: string) => Promise<AssetTypeToResult[K]>
}


const textureLoader = new TextureLoader();
const objLoader = new OBJLoader()
const gltfLoader = new GLTFLoader();
const audioLoader = new AudioLoader();
const loaders: Loaders = {
    [AssetType.OBJ]: (path) => new Promise((res, rej) => {
        objLoader.load(
            path, 
            res,
            undefined, 
            rej
        )
    }),
    [AssetType.TEXTURE]: path => new Promise((res, rej) => {
        textureLoader.load(
            path,
            res,
            undefined,
            rej
        )
    }),
    [AssetType.GLTF]: path => new Promise((res, rej) => gltfLoader.load(path, res, undefined, rej)),
    [AssetType.AUDIO]: path => new Promise((res, rej) => audioLoader.load(path, res, undefined, rej))
}


export class AssetsManager<Assets extends Record<string, Asset>>{
    static async create<Assets extends Record<string, Asset>>(assets: Assets): Promise<AssetsManager<Assets>> {
        const instance = new AssetsManager(assets);

        await instance.load();

        return instance;
    }

    private loaded!: MapAssets<Assets>;

    public isLoaded = false;
    
    constructor(
        private assets: Assets
    ) {}

    async load() {
        if(this.isLoaded) return;
        this.loaded = Object.fromEntries(
            await Promise.all(
                Object
                    .entries(this.assets)
                    .map(async <Name extends keyof Assets>([name, asset]: [Name, Asset]) => {
                        return [name, await loaders[asset.type](asset.path)] as [Name, MapAssets<Assets>[Name]]
                    })
            )
        ) as any

        this.isLoaded = true;
    }

    getAsset<Name extends keyof Assets>(name: Name): MapAssets<Assets>[Name] {
        return this.loaded[name];
    }
}