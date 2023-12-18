import * as THREE from "three";

import { Asset, AssetsManager } from "./assets-manager.class";

interface Preloadable {
    preload(): Promise<unknown>
}

export type PreloadingConfig<Assets extends Record<string, Asset>> = {
    assets?: Assets,
    dependencies?: Preloadable[]
}

export const PreloadableScene = <Assets extends Record<string, Asset>>(config: PreloadingConfig<Assets>) => class PreloadableScene extends THREE.Scene {
    static loading: Promise<unknown> | null = null;
    static assets: AssetsManager<Assets>;

    static async preload() {
        if(!PreloadableScene.loading) {
            PreloadableScene.loading = Promise.all([
                config.assets ? AssetsManager.create(config.assets).then(a => PreloadableScene.assets = a) : Promise.resolve(),
                config.dependencies ? Promise.all(config.dependencies.map(p => p.preload())) : Promise.resolve()
            ])
        }

        await PreloadableScene.loading;
    }
}