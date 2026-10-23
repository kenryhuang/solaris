export const SCALE_CONFIG = {
  distanceBase: 8,          // Render units at 1 AU (linear scale — true AU ratios)
  planetSizeBase: 0.5,      // Earth's render radius (sqrt-compressed radius scale)
  sunSize: 2.0,             // Sun render radius (kept below Mercury's perihelion, ~2.46 units)
  earthRadiusKm: 6371,      // Reference radius for the sqrt-compressed planet size scale
  moonOrbitMargin: 0.9,     // Minimum clearance beyond the parent's surface, in render units
  moonDistanceSpread: 1.4,  // Render units per sqrt(million km) of moon distance
};

const AU_KM = 149_597_870.7;

/**
 * Scale a heliocentric distance from km to render units.
 *
 * Uses a uniform linear conversion (`distanceBase * d / 1 AU`), so every
 * pair of orbits keeps its true astronomical-unit ratio: Mars renders at
 * 1.52x Earth's orbit radius, Mercury at 0.387x, Neptune at 30.1x.
 *
 * `distanceBase = 8` is chosen so Mercury (0.387 AU → ~3.1 units, perihelion
 * ~2.46) still orbits outside the rendered Sun (radius 2.0), while Neptune
 * (30.1 AU → ~241 units) stays within camera range (far plane 1000,
 * maxDistance 400).
 *
 * Regression note 1: the original linear scale (km * 1e-9) placed Earth's
 * orbit at 0.15 units while the Sun renders with radius 5 — every planet
 * orbited *inside* the Sun mesh.
 *
 * Regression note 2: the later sqrt compression (8 * sqrt(d / 1 AU))
 * destroyed the true AU ratios — Mars rendered at 9.86 vs Earth's 8 (ratio
 * 1.23 instead of 1.52) and Mercury at 4.97 (ratio 0.62 instead of 0.387),
 * so Mars and Mercury appeared far too close to Earth.
 */
export function scaleDistance(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return SCALE_CONFIG.distanceBase * (distanceKm / AU_KM);
}

/**
 * Scale a planetary radius from km to render units.
 *
 * Uses sqrt compression (`planetSizeBase * sqrt(r / r_earth)`), mirroring
 * the distance scale: real radii span ~1:29 (Mercury vs Jupiter), so a
 * linear scale with a minimum-size clamp either makes the six smaller
 * planets indistinguishable (all clamped to the same size) or blows the
 * gas giants off screen. Sqrt keeps ordering exact, lands Earth at
 * `planetSizeBase` units, and keeps every planet visible while making
 * size differences perceptible (Mercury ~0.31, Jupiter ~1.66 units).
 */
export function scaleRadius(realRadiusKm: number, isSun: boolean = false): number {
  if (isSun) {
    return SCALE_CONFIG.sunSize;
  }
  if (realRadiusKm <= 0) return 0;
  return SCALE_CONFIG.planetSizeBase * Math.sqrt(realRadiusKm / SCALE_CONFIG.earthRadiusKm);
}

/**
 * Scale a moon's orbital radius (km from its parent) to render units,
 * relative to the parent's render radius:
 * `parentRadius + moonOrbitMargin + moonDistanceSpread * sqrt(d / 1e6 km)`.
 *
 * Every moon orbits outside its parent's surface with a clearly visible
 * gap, siblings stay ordered by true distance, and each system stays
 * compact. The margin/spread are tuned so the Moon (~2.27 units, ~2.39 at
 * apogee) reads as a clearly separate body rather than grazing Earth's
 * surface, while always staying closer to Earth than any planet ever gets:
 * the tightest approach is Mars at opposition — Mars perihelion ~11.0 vs
 * Earth aphelion ~8.1 leaves ~2.9 units of clearance (Mercury never gets
 * closer than ~4.1).
 *
 * Regression note 1: the original formula (`parentRadius * 2.2 + 0.9 *
 * sqrt(d / 1e6 km)`) put the Moon at ~1.66 units from Earth — under the old
 * sqrt-compressed planet scale, Mars at opposition passed within ~0.82
 * units of Earth, so Mars and Mercury could appear closer than the Moon.
 *
 * Regression note 2: the first fix (margin 0.05, spread 0.35) pulled the
 * Moon in to ~0.77 units — only ~0.27 units above Earth's 0.5-unit surface,
 * so the Moon looked glued to Earth. Margin 0.4 / spread 1.0 (~1.52 units)
 * still rendered nearly touching Earth at typical camera zoom, so margin
 * 0.9 / spread 1.4 opens a clearly visible gap (~2.27 units) while keeping
 * the Moon well inside Mars' closest approach (~2.9 units).
 */
export function scaleMoonDistance(distanceKm: number, parentRenderRadius: number): number {
  if (distanceKm <= 0) return 0;
  return (
    parentRenderRadius +
    SCALE_CONFIG.moonOrbitMargin +
    SCALE_CONFIG.moonDistanceSpread * Math.sqrt(distanceKm / 1e6)
  );
}
