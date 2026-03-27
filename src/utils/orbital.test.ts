import { describe, it, expect } from 'vitest';
import { calculateOrbitalPosition, calculateMeanAnomaly } from './orbital';

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