export const SCALE_CONFIG = {
  distanceScale: 1e-9,      // Scale km to render units
  planetSizeBase: 0.5,      // Minimum render radius
  sunSize: 5,               // Sun render radius
  sizeMultiplier: 10000,    // Planet size amplification
};

/**
 * Scale a distance from km to render units
 */
export function scaleDistance(distanceKm: number): number {
  return distanceKm * SCALE_CONFIG.distanceScale;
}

/**
 * Scale a radius for rendering, with minimum size guarantee
 */
export function scaleRadius(realRadiusKm: number, isSun: boolean = false): number {
  if (isSun) {
    return SCALE_CONFIG.sunSize;
  }

  // Scale the radius but ensure minimum visibility
  const scaledRadius = realRadiusKm * SCALE_CONFIG.distanceScale * SCALE_CONFIG.sizeMultiplier;
  return Math.max(scaledRadius, SCALE_CONFIG.planetSizeBase);
}