import { describe, it, expect } from 'vitest';
import { generateAsteroidPositions, ASTEROID_BELT_CONFIG } from './asteroid';

describe('generateAsteroidPositions', () => {
  it('generates correct number of positions', () => {
    const positions = generateAsteroidPositions(100);
    expect(positions.length).toBe(100);
  });

  it('positions are within asteroid belt range', () => {
    const positions = generateAsteroidPositions(50);
    const scaledInner = ASTEROID_BELT_CONFIG.innerRadius * 1e-9;
    const scaledOuter = ASTEROID_BELT_CONFIG.outerRadius * 1e-9;

    positions.forEach(([x, y, z]) => {
      const distance = Math.sqrt(x * x + y * y + z * z);
      expect(distance).toBeGreaterThanOrEqual(scaledInner * 0.8);
      expect(distance).toBeLessThanOrEqual(scaledOuter * 1.2);
    });
  });

  it('positions are randomly distributed (not all same)', () => {
    const positions = generateAsteroidPositions(100);
    const uniquePositions = new Set(positions.map(p => p.join(',')));
    expect(uniquePositions.size).toBeGreaterThan(90);
  });

  it('returns empty array for zero count', () => {
    const positions = generateAsteroidPositions(0);
    expect(positions).toEqual([]);
  });
});