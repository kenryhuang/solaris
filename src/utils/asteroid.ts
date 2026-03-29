import { scaleDistance } from './scale';

// Asteroid belt configuration (between Mars and Jupiter)
export const ASTEROID_BELT_CONFIG = {
  innerRadius: 329115000,    // ~2.2 AU (km)
  outerRadius: 478710000,    // ~3.2 AU (km)
  count: 2000,               // Number of asteroids to render
  sizeRange: [0.01, 0.05],   // Render size range
  inclinationSpread: 20,     // Degrees of inclination spread
};

/**
 * Generate random positions for asteroids in the belt
 */
export function generateAsteroidPositions(count: number): [number, number, number][] {
  if (count <= 0) return [];

  const positions: [number, number, number][] = [];
  const { innerRadius, outerRadius, inclinationSpread } = ASTEROID_BELT_CONFIG;

  for (let i = 0; i < count; i++) {
    const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
    const angle = Math.random() * 2 * Math.PI;
    const inclination = (Math.random() - 0.5) * inclinationSpread;
    const inclinationRad = (inclination * Math.PI) / 180;

    const scaledDistance = scaleDistance(distance);
    const x = scaledDistance * Math.cos(angle);
    const y = scaledDistance * Math.sin(angle) * Math.cos(inclinationRad);
    const z = scaledDistance * Math.sin(angle) * Math.sin(inclinationRad);

    positions.push([x, z, y]); // Swap y and z for Three.js coordinate system
  }

  return positions;
}

/**
 * Generate random sizes for asteroids
 */
export function generateAsteroidSizes(count: number): number[] {
  if (count <= 0) return [];

  const { sizeRange } = ASTEROID_BELT_CONFIG;
  const sizes: number[] = [];

  for (let i = 0; i < count; i++) {
    const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    sizes.push(size);
  }

  return sizes;
}