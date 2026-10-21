import { describe, it, expect } from 'vitest';
import { computeBodyPosition } from './positions';
import { scaleDistance, scaleMoonDistance } from './scale';
import type { CelestialBody } from '../types/celestial';

const AU_KM = 149_597_870.7;

function makeBody(overrides: Partial<CelestialBody>): CelestialBody {
  return {
    id: 'test',
    name: 'Test',
    type: 'planet',
    radius: 6371,
    mass: 0,
    semiMajorAxis: AU_KM,
    eccentricity: 0,
    inclination: 0,
    orbitalPeriod: 365.256,
    rotationPeriod: 1,
    axialTilt: 0,
    textureUrl: '#888888',
    renderRadius: 0.5,
    ...overrides,
  };
}

describe('computeBodyPosition', () => {
  it('places a root body on its orbit at the given time', () => {
    const earth = makeBody({});
    // At t=0 mean anomaly is 0 → position on +x axis at scaled distance
    const [x, y, z] = computeBodyPosition(earth, undefined, 0);
    expect(x).toBeCloseTo(scaleDistance(AU_KM), 5);
    expect(y).toBeCloseTo(0, 5);
    expect(z).toBeCloseTo(0, 5);
  });

  it('returns the origin for a body without an orbit (the Sun)', () => {
    const sun = makeBody({ id: 'sun', type: 'star', semiMajorAxis: 0, orbitalPeriod: 0 });
    expect(computeBodyPosition(sun, undefined, 123)).toEqual([0, 0, 0]);
  });

  it('offsets a moon by its parent position', () => {
    const earth = makeBody({});
    const moon = makeBody({
      id: 'moon',
      type: 'moon',
      semiMajorAxis: 384400,
      orbitalPeriod: 27.322,
      parentId: 'earth',
    });

    const earthPos = computeBodyPosition(earth, undefined, 0);
    const moonPos = computeBodyPosition(moon, earth, 0);

    // Moon must sit near its parent, not near the scene origin.
    // Regression: moons used to be placed around the origin at ~0.0004 units,
    // buried inside the Sun.
    const dx = moonPos[0] - earthPos[0];
    const dy = moonPos[1] - earthPos[1];
    const dz = moonPos[2] - earthPos[2];
    const separation = Math.sqrt(dx * dx + dy * dy + dz * dz);
    expect(separation).toBeCloseTo(scaleMoonDistance(384400, earth.renderRadius), 5);

    // And far from the Sun (Earth orbit radius ± moon separation)
    const moonDistFromOrigin = Math.hypot(...moonPos);
    expect(moonPos[2]).toBeCloseTo(0, 5);
    expect(moonPos[1]).toBeCloseTo(0, 5);
    expect(moonPos[0]).toBeGreaterThan(earthPos[0]); // t=0: moon at parent + local +x
    expect(moonDistFromOrigin).toBeGreaterThan(scaleDistance(AU_KM) - 2);
  });

  it('moves the moon with its parent over time', () => {
    const earth = makeBody({});
    const moon = makeBody({
      id: 'moon',
      type: 'moon',
      semiMajorAxis: 384400,
      orbitalPeriod: 27.322,
      parentId: 'earth',
    });

    const t = 91.3; // quarter of Earth's orbit
    const earthPos = computeBodyPosition(earth, undefined, t);
    const moonPos = computeBodyPosition(moon, earth, t);
    const separation = Math.hypot(
      moonPos[0] - earthPos[0],
      moonPos[1] - earthPos[1],
      moonPos[2] - earthPos[2]
    );
    expect(separation).toBeCloseTo(scaleMoonDistance(384400, earth.renderRadius), 5);
  });
});
