import * as THREE from 'three';
import { ASSET_CONFIG } from '../core/assetConfig';

export interface BoundingBoxCollider {
  min: [number, number, number];
  max: [number, number, number];
  name?: string;
}

// Furniture and room collision obstacles in home scene
export const HOME_COLLIDERS: BoundingBoxCollider[] = [
  // Dining table & dining chairs
  { min: [-1.4, 0, -4.6], max: [0.6, 1.2, -1.8], name: 'dining_table' },
  // Bookshelf area
  { min: [-6.8, 0, -5.2], max: [-5.6, 2.5, -2.6], name: 'bookshelf' },
  // Fireplace
  { min: [3.4, 0, 4.2], max: [5.0, 2.2, 6.6], name: 'fireplace' },
  // Living room coffee table
  { min: [-0.8, 0, 5.0], max: [0.25, 0.7, 5.9], name: 'coffee_table' },
  // Living room Sofa where Dada sits (sofa back and seat bounds)
  { min: [-1.25, 0, 2.1], max: [0.35, 1.1, 3.2], name: 'sofa_dada' },
  // Armchair on the left wall
  { min: [-2.6, 0, 5.0], max: [-1.3, 1.1, 6.3], name: 'armchair_left' },
  // Radiator left
  { min: [-5.0, 0, 0.2], max: [-4.3, 1.0, 1.2], name: 'radiator_left' },
  // Stairs boundary
  { min: [3.8, 0, -7.5], max: [5.5, 1.5, -5.0], name: 'stairs_barrier' },
];

export class PlayerPhysics {
  private position = new THREE.Vector3(0, 0, 0);
  private velocity = new THREE.Vector3(0, 0, 0);
  // Adjusted smaller radius matching the scaled Child model (0.20m radius)
  private radius = ASSET_CONFIG.characters.child.colliderRadius;
  private walkSpeed = 2.1;
  private runSpeed = 3.8;
  private acceleration = 18.0;
  private friction = 14.0;
  private gravity = -18.0;
  private verticalVelocity = 0;
  private isGrounded = true;

  constructor(initialPosition: [number, number, number] = [0, 0, 0]) {
    this.position.set(...initialPosition);
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

  private checkCollision(testPos: THREE.Vector3): boolean {
    const { bounds } = ASSET_CONFIG.environments.home;
    const r = this.radius;

    // Room boundaries
    if (
      testPos.x - r < bounds.minX ||
      testPos.x + r > bounds.maxX ||
      testPos.z - r < bounds.minZ ||
      testPos.z + r > bounds.maxZ
    ) {
      return true;
    }

    // Obstacle boxes
    for (const box of HOME_COLLIDERS) {
      if (
        testPos.x + r > box.min[0] &&
        testPos.x - r < box.max[0] &&
        testPos.z + r > box.min[2] &&
        testPos.z - r < box.max[2] &&
        testPos.y + 0.9 > box.min[1] &&
        testPos.y < box.max[1]
      ) {
        return true;
      }
    }

    return false;
  }

  update(
    moveDirection: THREE.Vector3,
    isRunning: boolean,
    delta: number
  ): { position: THREE.Vector3; speed: number } {
    const dt = Math.min(delta, 0.1);
    const targetSpeed = moveDirection.lengthSq() > 0.001
      ? (isRunning ? this.runSpeed : this.walkSpeed)
      : 0;

    const targetVelocity = moveDirection.clone().multiplyScalar(targetSpeed);

    // Smooth horizontal acceleration and friction
    if (targetSpeed > 0) {
      this.velocity.lerp(targetVelocity, this.acceleration * dt);
    } else {
      this.velocity.lerp(new THREE.Vector3(0, 0, 0), this.friction * dt);
    }

    // Horizontal sliding movement test with smaller radius
    const stepX = new THREE.Vector3(this.position.x + this.velocity.x * dt, this.position.y, this.position.z);
    if (!this.checkCollision(stepX)) {
      this.position.x = stepX.x;
    } else {
      this.velocity.x = 0;
    }

    const stepZ = new THREE.Vector3(this.position.x, this.position.y, this.position.z + this.velocity.z * dt);
    if (!this.checkCollision(stepZ)) {
      this.position.z = stepZ.z;
    } else {
      this.velocity.z = 0;
    }

    // Gravity & ground clamping
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
