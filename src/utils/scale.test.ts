import { describe, it, expect } from 'vitest';
import { scaleDistance, scaleRadius, SCALE_CONFIG } from './scale';

describe('scaleDistance', () => {
  it('applies distance scale factor', () => {
    const result = scaleDistance(1e9); // 1 billion km
    expect(result).toBe(1e9 * SCALE_CONFIG.distanceScale);
  });

  it('returns 0 for 0 input', () => {
    expect(scaleDistance(0)).toBe(0);
  });
});

describe('scaleRadius', () => {
  it('applies minimum radius for small bodies', () => {
    const result = scaleRadius(1000); // Small radius
    expect(result).toBe(SCALE_CONFIG.planetSizeBase);
  });

  it('scales larger radii correctly', () => {
    const result = scaleRadius(70000); // ~Neptune size
    expect(result).toBeGreaterThan(SCALE_CONFIG.planetSizeBase);
  });
});