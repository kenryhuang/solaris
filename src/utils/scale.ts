export const SCALE_CONFIG = {
  distanceBase: 8,          // Render units at 1 AU (sqrt-compressed distance scale)
  planetSizeBase: 0.5,      // Minimum render radius
  sunSize: 2.5,             // Sun render radius
  sizeMultiplier: 10000,    // Planet size amplification (corrected from spec: 50 was too small for Neptune-scale bodies)
  moonOrbitGap: 2.2,        // Moon orbit base offset, in parent render radii
  moonDistanceSpread: 0.9,  // Render units per sqrt(million km) of moon distance
};

const AU_KM = 149_597_870.7;

/**
 * Scale a heliocentric distance from km to render units.
 *
 * Uses sqrt compression (`distanceBase * sqrt(d / 1 AU)`): the real solar
 * system spans a 1:175 ratio between Mercury's and Eris's orbits, so any
 * *linear* scale either puts the inner planets inside the rendered Sun or
 * pushes the outer planets beyond the camera. Sqrt keeps ordering exact,
 * lands Earth at `distanceBase` units, and fits Eris (~67.7 AU) within ~66
 * units — comfortably inside camera range.
 *
 * Regression note: the previous linear scale (km * 1e-9) placed Earth's orbit
 * at 0.15 units while the Sun renders with radius 5 — every planet orbited
 * *inside* the Sun mesh and appeared stacked on top of it.
 */
export function scaleDistance(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return SCALE_CONFIG.distanceBase * Math.sqrt(distanceKm / AU_KM);
}

/**
 * Scale a radius for rendering, with minimum size guarantee
 */
export function scaleRadius(realRadiusKm: number, isSun: boolean = false): number {
  if (isSun) {
    return SCALE_CONFIG.sunSize;
  }

  // Scale the radius but ensure minimum visibility
  const scaledRadius = realRadiusKm * 1e-9 * SCALE_CONFIG.sizeMultiplier;
  return Math.max(scaledRadius, SCALE_CONFIG.planetSizeBase);
}

/**
 * Scale a moon's orbital radius (km from its parent) to render units,
 * relative to the parent's render radius.
 *
 * Real moon distances (0.1–1.9 M km) are invisible on the heliocentric
 * scale — the Moon would sit 0.05 units from Earth while Earth itself
 * renders with radius 0.5. Instead each moon orbits at
 * `parentRadius * moonOrbitGap + spread * sqrt(d / 1e6 km)`: always outside
 * the parent's surface, ordered by true distance, compact enough that moon
 * systems read as satellites of their planet rather than independent bodies.
 */
export function scaleMoonDistance(distanceKm: number, parentRenderRadius: number): number {
  if (distanceKm <= 0) return 0;
  return (
    parentRenderRadius * SCALE_CONFIG.moonOrbitGap +
    SCALE_CONFIG.moonDistanceSpread * Math.sqrt(distanceKm / 1e6)
  );
}
