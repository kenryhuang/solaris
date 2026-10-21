import type * as THREE from 'three';

/**
 * Registry mapping celestial body id → its scene group, populated by
 * CelestialBody on mount. Lets non-scene consumers (camera focus, orbit
 * lines that must follow a moving parent) read ground-truth world positions
 * without duplicating orbital math or threading refs through the tree.
 */
const registry = new Map<string, THREE.Group>();

export function registerBody(id: string, group: THREE.Group): void {
  registry.set(id, group);
}

export function unregisterBody(id: string): void {
  registry.delete(id);
}

export function getBodyGroup(id: string): THREE.Group | undefined {
  return registry.get(id);
}
