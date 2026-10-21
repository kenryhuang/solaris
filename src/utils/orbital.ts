interface OrbitalParams {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;  // degrees
  meanAnomaly: number;  // radians
}

/**
 * Calculate mean anomaly from time and orbital period
 * M = 2π * t / T
 *
 * `time` and `orbitalPeriod` are both expressed in Earth days, so the result is
 * independent of any real-time scaling. A negative period (retrograde orbit,
 * e.g. Triton) yields a negative mean anomaly — motion in the opposite
 * direction — instead of freezing the body at M = 0 while it keeps spinning.
 */
export function calculateMeanAnomaly(time: number, orbitalPeriod: number): number {
  if (orbitalPeriod === 0) return 0;
  return (2 * Math.PI * time) / orbitalPeriod;
}

/**
 * Calculate the self-rotation angle (radians) after `time` simulated days.
 * θ = 2π * t / P_rot
 *
 * This deliberately mirrors `calculateMeanAnomaly`: both take the *same*
 * day-based simulated time, which is what keeps self-rotation and orbital
 * revolution synchronised. One simulated Earth day always advances Earth by
 * exactly one turn and by 1/365.256 of its orbit, regardless of frame rate,
 * pause state or the days-per-second time scale.
 *
 * A negative rotation period (retrograde spin, e.g. Venus, Uranus, Triton)
 * yields a negative angle. A zero period means "no rotation data" → 0.
 */
export function calculateRotationAngle(time: number, rotationPeriod: number): number {
  if (rotationPeriod === 0) return 0;
  return (2 * Math.PI * time) / rotationPeriod;
}

/**
 * Solve Kepler's equation using Newton-Raphson iteration
 * E - e*sin(E) = M
 */
function solveKeplerEquation(meanAnomaly: number, eccentricity: number): number {
  let E = meanAnomaly;
  for (let i = 0; i < 10; i++) {
    const dE = (E - eccentricity * Math.sin(E) - meanAnomaly) /
               (1 - eccentricity * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

/**
 * Calculate 3D position from orbital parameters
 * Returns [x, y, z] position in AU or whatever units semiMajorAxis is in
 */
export function calculateOrbitalPosition(params: OrbitalParams): [number, number, number] {
  const { semiMajorAxis, eccentricity, inclination, meanAnomaly } = params;

  if (semiMajorAxis === 0) return [0, 0, 0];

  // Solve Kepler's equation for eccentric anomaly
  const E = solveKeplerEquation(meanAnomaly, eccentricity);

  // Calculate true anomaly
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
  );

  // Calculate distance from focus
  const distance = semiMajorAxis * (1 - eccentricity * Math.cos(E));

  // Position in orbital plane
  const xOrbital = distance * Math.cos(trueAnomaly);
  const yOrbital = distance * Math.sin(trueAnomaly);

  // Apply inclination (rotate around x-axis)
  const inclinationRad = (inclination * Math.PI) / 180;
  const x = xOrbital;
  const y = yOrbital * Math.cos(inclinationRad);
  const z = yOrbital * Math.sin(inclinationRad);

  return [x, y, z];
}