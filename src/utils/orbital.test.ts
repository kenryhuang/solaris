import { describe, it, expect } from 'vitest';
import {
  calculateOrbitalPosition,
  calculateMeanAnomaly,
  calculateRotationAngle,
} from './orbital';

describe('calculateMeanAnomaly', () => {
  it('returns 0 at time 0', () => {
    expect(calculateMeanAnomaly(0, 365.25)).toBe(0);
  });

  it('returns 2*PI after one orbital period', () => {
    const result = calculateMeanAnomaly(365.25, 365.25);
    expect(Math.abs(result - 2 * Math.PI)).toBeLessThan(0.0001);
  });

  it('returns PI after half orbital period', () => {
    const result = calculateMeanAnomaly(182.625, 365.25);
    expect(Math.abs(result - Math.PI)).toBeLessThan(0.0001);
  });
});

describe('calculateOrbitalPosition', () => {
  it('returns origin for zero semi-major axis', () => {
    const [x, y, z] = calculateOrbitalPosition({
      semiMajorAxis: 0,
      eccentricity: 0,
      inclination: 0,
      meanAnomaly: 0
    });
    expect(x).toBe(0);
    expect(y).toBe(0);
    expect(z).toBe(0);
  });

  it('returns correct position for circular orbit at M=0', () => {
    const [x, y, z] = calculateOrbitalPosition({
      semiMajorAxis: 1,
      eccentricity: 0,
      inclination: 0,
      meanAnomaly: 0
    });
    expect(x).toBeCloseTo(1, 5);
    expect(y).toBeCloseTo(0, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  it('applies inclination correctly', () => {
    const [x, y, z] = calculateOrbitalPosition({
      semiMajorAxis: 1,
      eccentricity: 0,
      inclination: 90,
      meanAnomaly: 0
    });
    expect(x).toBeCloseTo(1, 5);
    expect(y).toBeCloseTo(0, 5);
    expect(z).toBeCloseTo(0, 5);
  });
});

describe('calculateMeanAnomaly (retrograde orbits)', () => {
  it('returns a negative anomaly for a negative orbital period', () => {
    // Triton orbits retrograde (-5.877 days); it must move backwards, not freeze at 0.
    expect(calculateMeanAnomaly(5.877, -5.877)).toBeCloseTo(-2 * Math.PI, 5);
  });

  it('returns 0 for a zero orbital period', () => {
    expect(calculateMeanAnomaly(10, 0)).toBe(0);
  });
});

describe('calculateRotationAngle', () => {
  it('returns 0 at time 0', () => {
    expect(calculateRotationAngle(0, 0.9973)).toBe(0);
  });

  it('returns exactly one full turn after one rotation period', () => {
    expect(calculateRotationAngle(0.9973, 0.9973)).toBeCloseTo(2 * Math.PI, 5);
  });

  it('returns a negative angle for retrograde spin (Venus)', () => {
    expect(calculateRotationAngle(243.025, -243.025)).toBeCloseTo(-2 * Math.PI, 5);
  });

  it('returns 0 when there is no rotation data', () => {
    expect(calculateRotationAngle(100, 0)).toBe(0);
  });

  it('is linear in simulated days, so spin never depends on frame rate', () => {
    const a = calculateRotationAngle(1, 0.9973);
    const b = calculateRotationAngle(2, 0.9973);
    expect(b).toBeCloseTo(2 * a, 5);
  });
});

describe('rotation/revolution synchronisation', () => {
  // The regression that was fixed: self-rotation used to be integrated from
  // real seconds with a hardcoded 1000x factor while revolution used the
  // day-based simulated clock, so the two ran ~8.64x apart.
  const EARTH_ROTATION_PERIOD = 0.9973; // days
  const EARTH_ORBITAL_PERIOD = 365.256; // days

  it('advances Earth by one turn per simulated day', () => {
    expect(calculateRotationAngle(1, EARTH_ROTATION_PERIOD)).toBeCloseTo(
      (2 * Math.PI) / EARTH_ROTATION_PERIOD,
      5
    );
  });

  it('keeps the spin/orbit ratio equal to the real ratio at any simulated time', () => {
    for (const days of [0.5, 1, 10, 365.256]) {
      const spin = calculateRotationAngle(days, EARTH_ROTATION_PERIOD);
      const orbit = calculateMeanAnomaly(days, EARTH_ORBITAL_PERIOD);
      expect(spin / orbit).toBeCloseTo(EARTH_ORBITAL_PERIOD / EARTH_ROTATION_PERIOD, 5);
    }
  });

  it('completes one orbit per sidereal year while spinning 366.25 times', () => {
    const days = EARTH_ORBITAL_PERIOD;
    const spinTurns = calculateRotationAngle(days, EARTH_ROTATION_PERIOD) / (2 * Math.PI);
    const orbitTurns = calculateMeanAnomaly(days, EARTH_ORBITAL_PERIOD) / (2 * Math.PI);
    expect(orbitTurns).toBeCloseTo(1, 5);
    expect(spinTurns).toBeCloseTo(EARTH_ORBITAL_PERIOD / EARTH_ROTATION_PERIOD, 5);
  });

  it('keeps a tidally locked moon showing the same face (spin angle == mean anomaly)', () => {
    // Triton: rotationPeriod === orbitalPeriod === -5.877 days
    const period = -5.877;
    for (const days of [1, 2.9385, 5.877, 20]) {
      expect(calculateRotationAngle(days, period)).toBeCloseTo(
        calculateMeanAnomaly(days, period),
        8
      );
    }
  });
});
