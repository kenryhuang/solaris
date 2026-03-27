interface OrbitalParams {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;  // degrees
  meanAnomaly: number;  // radians
}

/**
 * Calculate mean anomaly from time and orbital period
 * M = 2π * t / T
 */
export function calculateMeanAnomaly(time: number, orbitalPeriod: number): number {
  if (orbitalPeriod <= 0) return 0;
  return (2 * Math.PI * time) / orbitalPeriod;
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