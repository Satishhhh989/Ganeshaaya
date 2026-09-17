/**
 * Shiva 3D Asset Lazy Loader & Verification Service
 * Prepares the Shiva 3D model for upcoming Phase 3 cinematic sequences.
 * Implements strict on-demand lazy loading so that the ~32MB asset is never
 * downloaded during the 2D mythology scenes.
 */

import * as THREE from 'three';

export interface ShivaAssetStatus {
  loaded: boolean;
  loading: boolean;
  model: THREE.Group | null;
  animations: THREE.AnimationClip[];
  error: string | null;
}

class ShivaAssetManager {
  private status: ShivaAssetStatus = {
    loaded: false,
    loading: false,
    model: null,
    animations: [],
    error: null,
  };

  private readonly assetUrl = '/assets/characters/shiva_walking.fbx';

  getStatus(): ShivaAssetStatus {
    return this.status;
  }

  /**
   * Fast verification test: checks if the Shiva asset endpoint is accessible
   * without downloading the full 32MB payload.
   */
  async verifyAssetAvailability(): Promise<boolean> {
    try {
      const res = await fetch(this.assetUrl, { method: 'HEAD' });
      return res.ok;
    } catch (err) {
      console.warn('Shiva asset check failed:', err);
      return false;
    }
  }

  /**
   * Lazy load the 3D Shiva model. Only called when entering Phase 3.
   */
  async loadShivaModel(
    onProgress?: (progress: number) => void
  ): Promise<THREE.Group> {
    if (this.status.model) {
      return this.status.model;
    }

    this.status.loading = true;

    try {
      // Dynamically import FBXLoader so it's not bundled into early 2D code
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      const loader = new FBXLoader();

      return await new Promise<THREE.Group>((resolve, reject) => {
        loader.load(
          this.assetUrl,
          (fbx) => {
            fbx.scale.setScalar(1.0); // Keep raw coordinates for calibrated scaling in ShivaCharacter
            fbx.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            this.status.model = fbx;
            this.status.animations = fbx.animations || [];
            this.status.loaded = true;
            this.status.loading = false;
            resolve(fbx);
          },
          (xhr) => {
            if (xhr.total > 0 && onProgress) {
              onProgress(xhr.loaded / xhr.total);
            }
          },
          (error: unknown) => {
            const msg = error instanceof Error ? error.message : String(error);
            this.status.error = msg || 'Failed to load Shiva FBX';
            this.status.loading = false;
            reject(error);
          }
        );
      });
    } catch (err: unknown) {
      this.status.loading = false;
      const msg = err instanceof Error ? err.message : String(err);
      this.status.error = msg;
      throw err;
    }
  }
}

export const shivaAssetManager = new ShivaAssetManager();
