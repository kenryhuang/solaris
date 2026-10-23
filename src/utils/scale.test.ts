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

  it('preserves true AU ratios between every pair of orbits', () => {
    // Linear scale: rendered ratio must equal the real AU ratio exactly.
    // Regression: sqrt compression rendered Mars at 1.23x Earth's orbit
    // (real: 1.52x) and Mercury at 0.62x (real: 0.387x), making both appear
    // far too close to Earth.
    const earth = scaleDistance(AU_KM);
    expect(scaleDistance(1.524 * AU_KM) / earth).toBeCloseTo(1.524, 5);
    expect(scaleDistance(0.387 * AU_KM) / earth).toBeCloseTo(0.387, 5);
    expect(scaleDistance(30.07 * AU_KM) / earth).toBeCloseTo(30.07, 5);
  });

  it('keeps Neptune within camera range', () => {
    // Neptune (30.07 AU) must stay inside the far plane (1000) and within
    // reach of the orbit controls (maxDistance 400).
    expect(scaleDistance(30.07 * AU_KM)).toBeLessThan(400);
  });

  it('keeps Mercury outside the rendered Sun', () => {
    // Regression: linear scaling put Mercury's orbit (0.058 units) inside the
    // Sun's render radius (5 units), hiding every planet inside the Sun mesh.
    expect(scaleDistance(0.387 * AU_KM)).toBeGreaterThan(SCALE_CONFIG.sunSize);
  });
});

describe('scaleRadius', () => {
  it('returns 0 for non-positive radii', () => {
    expect(scaleRadius(0)).toBe(0);
    expect(scaleRadius(-100)).toBe(0);
  });

  it('places Earth at the planet size base', () => {
    expect(scaleRadius(6371)).toBeCloseTo(SCALE_CONFIG.planetSizeBase, 5);
  });

  it('applies sqrt compression to larger radii', () => {
    // Jupiter (~11x Earth's radius) renders at ~3.3x Earth's render radius,
    // not 11x — compression keeps it on screen while staying larger.
    const result = scaleRadius(69911);
    expect(result).toBeCloseTo(
      SCALE_CONFIG.planetSizeBase * Math.sqrt(69911 / 6371),
      5
    );
    expect(result).toBeGreaterThan(SCALE_CONFIG.planetSizeBase);
    expect(result).toBeLessThan(SCALE_CONFIG.planetSizeBase * 11);
  });

  it('preserves size ordering across all planets', () => {
    const radii = [2439.7, 6051.8, 6371, 3389.5, 69911, 58232, 25362, 24622];
    const scaled = radii.map((r) => scaleRadius(r));
    const byReal = [...radii].sort((a, b) => a - b);
    const scaledSorted = byReal.map((r) => scaleRadius(r));
    for (let i = 1; i < scaledSorted.length; i++) {
      expect(scaledSorted[i]).toBeGreaterThan(scaledSorted[i - 1]);
    }
    // Spot-check: Mercury < Mars < Earth < Neptune < Uranus < Saturn < Jupiter
    expect(scaled[0]).toBeLessThan(scaled[3]);
    expect(scaled[3]).toBeLessThan(scaled[2]);
    expect(scaled[2]).toBeLessThan(scaled[7]);
    expect(scaled[7]).toBeLessThan(scaled[6]);
    expect(scaled[6]).toBeLessThan(scaled[5]);
    expect(scaled[5]).toBeLessThan(scaled[4]);
  });

  it('makes size differences perceptible (no clamp flattening)', () => {
    // Regression: the old linear scale clamped Mercury, Venus, Earth, Mars,
    // Uranus and Neptune to the same 0.5 minimum, hiding all size contrast.
    const mercury = scaleRadius(2439.7);
    const earth = scaleRadius(6371);
    const uranus = scaleRadius(25362);
    expect(mercury).toBeLessThan(earth);
    expect(uranus).toBeGreaterThan(earth);
    expect(uranus / mercury).toBeGreaterThan(2);
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
    // Callisto (Jupiter's outermost major moon) must never reach Saturn's
    // orbit, so the moon system reads as satellites of Jupiter rather than
    // independent bodies.
    const jupiterRadius = scaleRadius(69911);
    const callisto = scaleMoonDistance(1882709, jupiterRadius);
    const jupiterOrbit = scaleDistance(5.2 * AU_KM);
    const saturnOrbit = scaleDistance(9.58 * AU_KM);
    expect(callisto).toBeLessThan(saturnOrbit - jupiterOrbit);
  });

  it('keeps the Moon closer to Earth than any planet ever gets', () => {
    // Regression: the old formula (parentRadius * 2.2 + 0.9 * sqrt(d/1e6))
    // put the Moon at ~1.66 units from Earth; under the old sqrt-compressed
    // planet scale Mars at opposition passed within ~0.82 units of Earth,
    // so Mars (and Mercury) could appear closer than the Moon.
    const earthRadius = scaleRadius(6371);
    // Moon at apogee (eccentricity 0.0549): its farthest from Earth.
    const moonApogee = scaleMoonDistance(384400, earthRadius) * (1 + 0.0549);

    // Tightest possible Earth–planet clearances, from orbital geometry:
    // Mars at opposition: Mars perihelion vs Earth aphelion.
    const marsPerihelion = scaleDistance(227939200) * (1 - 0.0934);
    const earthAphelion = scaleDistance(149598023) * (1 + 0.0167);
    const marsClearance = marsPerihelion - earthAphelion;
    // Mercury at its closest: Earth perihelion vs Mercury aphelion.
    const mercuryAphelion = scaleDistance(57909050) * (1 + 0.2056);
    const earthPerihelion = scaleDistance(149598023) * (1 - 0.0167);
    const mercuryClearance = earthPerihelion - mercuryAphelion;

    expect(moonApogee).toBeLessThan(marsClearance);
    expect(moonApogee).toBeLessThan(mercuryClearance);
  });
});
