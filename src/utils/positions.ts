import { calculateMeanAnomaly, calculateOrbitalPosition } from './orbital';
import { scaleDistance, scaleMoonDistance } from './scale';
import type { CelestialBody } from '../types/celestial';

/**
 * Compute a body's world position (Three.js coordinates, y/z swapped) at the
 * given simulation time in days.
 *
 * Moons are positioned relative to their parent: the local orbit is scaled
 * with `scaleMoonDistance` (parent-relative) and offset by the parent's own
 * world position, recomputed here from the same time base so both stay in
 * lockstep without sharing refs.
 *
 * Bodies without an orbit (the Sun: semiMajorAxis 0 / period 0) sit at the
 * origin.
 */
export function computeBodyPosition(
  body: CelestialBody,
  parent: CelestialBody | undefined,
  timeDays: number
): [number, number, number] {
  if (body.semiMajorAxis <= 0 || body.orbitalPeriod === 0) {
    return [0, 0, 0];
  }

  const isMoon = body.type === 'moon' && parent;
  const scaledAxis = isMoon
    ? scaleMoonDistance(body.semiMajorAxis, parent.renderRadius)
    : scaleDistance(body.semiMajorAxis);

  const meanAnomaly = calculateMeanAnomaly(timeDays, body.orbitalPeriod);
  const [x, y, z] = calculateOrbitalPosition({
    semiMajorAxis: scaledAxis,
    eccentricity: body.eccentricity,
    inclination: body.inclination,
    meanAnomaly,
  });

  // Swap y and z for the Three.js coordinate system
  let px = x;
  let py = z;
  let pz = y;

  if (isMoon) {
    const [ox, oy, oz] = computeBodyPosition(parent, undefined, timeDays);
    px += ox;
    py += oy;
    pz += oz;
  }

  return [px, py, pz];
}
