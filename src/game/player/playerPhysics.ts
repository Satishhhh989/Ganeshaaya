import * as THREE from 'three';
import { ASSET_CONFIG } from '../core/assetConfig';

export interface BoundingBoxCollider {
  min: [number, number, number];
  max: [number, number, number];
  name?: string;
}

// ─── Room wall boundaries ───────────────────────────────────────────────
// These are invisible walls matching the home.glb geometry
// Home bounding box: min=[-8.34, -0.01, -11.17] max=[5.02, 4.78, 10.06]
export const WALL_COLLIDERS: BoundingBoxCollider[] = [
  // Left wall
  { min: [-8.5, 0, -11.5], max: [-4.8, 4.8, 10.5], name: 'wall_left' },
  // Right wall
  { min: [4.7, 0, -11.5], max: [5.5, 4.8, 10.5], name: 'wall_right' },
  // Back wall
  { min: [-8.5, 0, -11.5], max: [5.5, 4.8, -9.5], name: 'wall_back' },
  // Front wall
  { min: [-8.5, 0, 9.5], max: [5.5, 4.8, 10.5], name: 'wall_front' },
];

// ─── Furniture collision obstacles in home scene ──────────────────────
export const HOME_COLLIDERS: BoundingBoxCollider[] = [
  // Living room sofa (main seating area — where Dada sits)
  { min: [-1.6, 0, 1.9], max: [0.6, 1.1, 3.4], name: 'sofa_main' },
  // Living room coffee table (in front of sofa)
  { min: [-1.1, 0, 3.6], max: [0.5, 0.65, 4.5], name: 'coffee_table' },
  // Sofa left / armchair left
  { min: [-3.0, 0, 1.9], max: [-1.6, 1.1, 3.4], name: 'sofa_left' },
  // Right side sofa/seat
  { min: [0.6, 0, 1.9], max: [2.0, 1.1, 3.4], name: 'sofa_right' },
  // Dining table area
  { min: [-3.2, 0, -5.5], max: [0.8, 1.0, -2.5], name: 'dining_area' },
  // Bookshelf on left wall
  { min: [-4.8, 0, -2.5], max: [-3.8, 2.5, 0.5], name: 'bookshelf' },
  // Fireplace area
  { min: [3.0, 0, 4.0], max: [4.8, 2.2, 7.0], name: 'fireplace' },
  // Side table near sofa
  { min: [2.0, 0, 1.9], max: [3.0, 0.8, 3.0], name: 'side_table' },
  // Stairs area barrier
  { min: [3.5, 0, -8.0], max: [5.0, 1.5, -5.0], name: 'stairs' },
];

export const PANDAL_COLLIDERS: BoundingBoxCollider[] = [
  // Left colony residential wall
  { min: [-16, 0, -12], max: [-8.8, 6.0, 16], name: 'pandal_wall_left' },
  // Right colony residential wall
  { min: [8.8, 0, -12], max: [16, 6.0, 16], name: 'pandal_wall_right' },
  // Back boundary behind stage
  { min: [-14, 0, -12], max: [14, 6.0, -5.2], name: 'pandal_wall_back' },
  // Front boundary towards colony street
  { min: [-14, 0, 12], max: [14, 6.0, 16], name: 'pandal_wall_front' },
  // Central altar stage base (allows natural approach to front steps)
  { min: [-3.0, 0, -5.2], max: [3.0, 0.75, -1.2], name: 'pandal_stage_base' },
];

export class PlayerPhysics {
  private position = new THREE.Vector3(0, 0, 0);
  private velocity = new THREE.Vector3(0, 0, 0);
  private radius = ASSET_CONFIG.characters.child.colliderRadius;
  private activeColliders: BoundingBoxCollider[] = [...WALL_COLLIDERS, ...HOME_COLLIDERS];
  private walkSpeed = 2.4;
  private runSpeed = 4.2;
  private acceleration = 22.0;   // Snappier acceleration for responsive feel
  private deceleration = 18.0;   // Firm deceleration so stopping feels solid
  private gravity = -18.0;
  private verticalVelocity = 0;
  private isGrounded = true;

  constructor(initialPosition: [number, number, number] = [0, 0, 0]) {
    this.position.set(...initialPosition);
  }

  setCollidersForScene(scene: string) {
    if (scene === 'PANDAL') {
      this.activeColliders = PANDAL_COLLIDERS;
    } else {
      this.activeColliders = [...WALL_COLLIDERS, ...HOME_COLLIDERS];
    }
  }

  getPosition(): THREE.Vector3 {
    return this.position;
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }

  setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
  }

  /**
   * Check if testPos collides with any wall or furniture collider.
   * Uses cylinder-vs-AABB test (circle on XZ plane, ignoring Y for simplicity).
   */
  private checkCollision(testPos: THREE.Vector3): boolean {
    const r = this.radius;

    for (const box of this.activeColliders) {
      if (this.circleBoxCollision(testPos, r, box)) return true;
    }

    return false;
  }

  /**
   * Circle (XZ plane) vs AABB collision test.
   * Finds the closest point on the AABB to the circle center and checks distance.
   */
  private circleBoxCollision(pos: THREE.Vector3, radius: number, box: BoundingBoxCollider): boolean {
    // Only check if player is at the right height
    if (pos.y + 0.9 < box.min[1] || pos.y > box.max[1]) return false;

    // Find closest point on box to circle center in XZ
    const closestX = Math.max(box.min[0], Math.min(pos.x, box.max[0]));
    const closestZ = Math.max(box.min[2], Math.min(pos.z, box.max[2]));

    const dx = pos.x - closestX;
    const dz = pos.z - closestZ;
    const distSq = dx * dx + dz * dz;

    return distSq < radius * radius;
  }

  /**
   * Push position out of any collider it's currently inside.
   * Returns the corrected position.
   */
  private resolveCollision(pos: THREE.Vector3): THREE.Vector3 {
    const r = this.radius;
    const resolved = pos.clone();

    const allColliders = this.activeColliders;

    for (const box of allColliders) {
      if (resolved.y + 0.9 < box.min[1] || resolved.y > box.max[1]) continue;

      const closestX = Math.max(box.min[0], Math.min(resolved.x, box.max[0]));
      const closestZ = Math.max(box.min[2], Math.min(resolved.z, box.max[2]));

      const dx = resolved.x - closestX;
      const dz = resolved.z - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < r * r) {
        const dist = Math.sqrt(distSq);
        if (dist < 0.0001) {
          // Player center is inside the box — push out on the nearest edge
          const pushX1 = box.min[0] - r - resolved.x;
          const pushX2 = box.max[0] + r - resolved.x;
          const pushZ1 = box.min[2] - r - resolved.z;
          const pushZ2 = box.max[2] + r - resolved.z;

          const minPush = [
            { axis: 'x', val: pushX1, abs: Math.abs(pushX1) },
            { axis: 'x', val: pushX2, abs: Math.abs(pushX2) },
            { axis: 'z', val: pushZ1, abs: Math.abs(pushZ1) },
            { axis: 'z', val: pushZ2, abs: Math.abs(pushZ2) },
          ].sort((a, b) => a.abs - b.abs)[0];

          if (minPush.axis === 'x') resolved.x += minPush.val;
          else resolved.z += minPush.val;
        } else {
          // Push out along the penetration vector
          const overlap = r - dist;
          resolved.x += (dx / dist) * overlap;
          resolved.z += (dz / dist) * overlap;
        }
      }
    }

    return resolved;
  }

  update(
    moveDirection: THREE.Vector3,
    isRunning: boolean,
    delta: number
  ): { position: THREE.Vector3; speed: number } {
    const dt = Math.min(delta, 0.1);
    const isMoving = moveDirection.lengthSq() > 0.001;
    const targetSpeed = isMoving ? (isRunning ? this.runSpeed : this.walkSpeed) : 0;

    const targetVelocity = moveDirection.clone().multiplyScalar(targetSpeed);

    // Smooth horizontal acceleration and deceleration
    if (isMoving) {
      const t = 1 - Math.exp(-this.acceleration * dt);
      this.velocity.lerp(targetVelocity, t);
    } else {
      const t = 1 - Math.exp(-this.deceleration * dt);
      this.velocity.lerp(new THREE.Vector3(0, 0, 0), t);
    }

    // Kill very small velocities to prevent drift
    if (this.velocity.lengthSq() < 0.001) {
      this.velocity.set(0, 0, 0);
    }

    // ─── Axis-separated collision with sliding ───
    // Try X movement
    const newX = this.position.x + this.velocity.x * dt;
    const testX = new THREE.Vector3(newX, this.position.y, this.position.z);
    if (!this.checkCollision(testX)) {
      this.position.x = newX;
    } else {
      this.velocity.x *= -0.05; // Small bounce-back to prevent sticking
    }

    // Try Z movement
    const newZ = this.position.z + this.velocity.z * dt;
    const testZ = new THREE.Vector3(this.position.x, this.position.y, newZ);
    if (!this.checkCollision(testZ)) {
      this.position.z = newZ;
    } else {
      this.velocity.z *= -0.05;
    }

    // Final collision resolution pass (in case we clipped into something)
    this.position = this.resolveCollision(this.position);

    // ─── Gravity & ground clamping ───
    const floorY = ASSET_CONFIG.environments.home.floorY;
    if (this.position.y > floorY) {
      this.verticalVelocity += this.gravity * dt;
      this.position.y += this.verticalVelocity * dt;
      if (this.position.y <= floorY) {
        this.position.y = floorY;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    } else {
      this.position.y = floorY;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    return {
      position: this.position,
      speed: this.velocity.length(),
    };
  }
}
