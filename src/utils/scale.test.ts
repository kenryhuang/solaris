import { describe, it, expect } from 'vitest';
import { scaleDistance, scaleRadius, scaleMoonDistance, SCALE_CONFIG } from './scale';

const AU_KM = 149_597_870.7;

describe('scaleDistance', () => {
  it('returns 0 for 0 input', () => {
    expect(scaleDistance(0)).toBe(0);
  });

  it('places Earth (1 AU) at the distance base', () => {
    expect(scaleDistance(AU_KM)).toBeCloseTo(SCALE_CONFIG.distanceBase, 5);
  });

  it('is monotonically increasing with distance', () => {
    const distances = [0.387, 0.723, 1, 1.52, 5.2, 9.58, 19.2, 30.1, 39.5, 67.7].map(
      (au) => au * AU_KM
    );
    const scaled = distances.map(scaleDistance);
    for (let i = 1; i < scaled.length; i++) {
      expect(scaled[i]).toBeGreaterThan(scaled[i - 1]);
    }
  });

  it('compresses outer planets so the whole system fits in view', () => {
    // Eris (~67.7 AU) must stay within camera range (far plane 1000, maxDistance 200)
    expect(scaleDistance(67.7 * AU_KM)).toBeLessThan(100);
  });

  it('keeps Mercury outside the rendered Sun', () => {
    // Regression: linear scaling put Mercury's orbit (0.058 units) inside the
    // Sun's render radius (5 units), hiding every planet inside the Sun mesh.
    expect(scaleDistance(0.387 * AU_KM)).toBeGreaterThan(SCALE_CONFIG.sunSize);
  });
});

describe('scaleRadius', () => {
  it('applies minimum radius for small bodies', () => {
    const result = scaleRadius(1000); // Small radius
    expect(result).toBe(SCALE_CONFIG.planetSizeBase);
  });

  it('scales larger radii correctly', () => {
    const result = scaleRadius(70000); // ~Jupiter size
    expect(result).toBeGreaterThan(SCALE_CONFIG.planetSizeBase);
  });

  it('gives the Sun its configured size', () => {
    expect(scaleRadius(696340, true)).toBe(SCALE_CONFIG.sunSize);
  });
});

describe('scaleMoonDistance', () => {
  it('returns 0 for 0 input', () => {
    expect(scaleMoonDistance(0, 0.5)).toBe(0);
  });

  it('always places the moon outside its parent surface', () => {
    // Regression: moons were positioned around the scene origin at ~0.0004
    // units — deep inside the Sun — instead of orbiting their parent planet.
    const parentRadius = 0.5; // Earth's render radius (clamped minimum)
    const moonDistances = [129390, 190900, 354759, 384400, 421700, 1882709];
    moonDistances.forEach((d) => {
      expect(scaleMoonDistance(d, parentRadius)).toBeGreaterThan(parentRadius);
    });
  });

  it('preserves distance ordering among siblings', () => {
    // Galilean moons: Io < Europa < Ganymede < Callisto
    const jupiterRadius = scaleRadius(69911);
    const io = scaleMoonDistance(421700, jupiterRadius);
    const europa = scaleMoonDistance(671034, jupiterRadius);
    const ganymede = scaleMoonDistance(1070412, jupiterRadius);
    const callisto = scaleMoonDistance(1882709, jupiterRadius);
    expect(io).toBeLessThan(europa);
    expect(europa).toBeLessThan(ganymede);
    expect(ganymede).toBeLessThan(callisto);
  });

  it('keeps moon systems compact relative to planet spacing', () => {
    // Callisto (Jupiter's outermost major moon) must stay well within
    // the gap between Jupiter's and Saturn's orbits.
    const jupiterRadius = scaleRadius(69911);
    const callisto = scaleMoonDistance(1882709, jupiterRadius);
    const jupiterOrbit = scaleDistance(5.2 * AU_KM);
    const saturnOrbit = scaleDistance(9.58 * AU_KM);
    expect(callisto).toBeLessThan((saturnOrbit - jupiterOrbit) / 2);
  });
});
