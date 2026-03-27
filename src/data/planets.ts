import type { CelestialBody } from '../types/celestial';
import { TEXTURE_URLS } from './textures';
import { scaleRadius, SCALE_CONFIG } from '../utils/scale';

// Real astronomical data (distances in km, radii in km)
const PLANET_RAW_DATA = {
  sun: {
    name: 'Sun',
    radius: 696340,
    semiMajorAxis: 0,
    orbitalPeriod: 0,
    rotationPeriod: 25.05, // Equatorial rotation
    eccentricity: 0,
    inclination: 0,
    axialTilt: 7.25,
  },
  mercury: {
    name: 'Mercury',
    radius: 2439.7,
    semiMajorAxis: 57909050,
    orbitalPeriod: 87.969,
    rotationPeriod: 58.646,
    eccentricity: 0.2056,
    inclination: 7.0,
    axialTilt: 0.034,
  },
  venus: {
    name: 'Venus',
    radius: 6051.8,
    semiMajorAxis: 108208000,
    orbitalPeriod: 224.701,
    rotationPeriod: -243.025, // Negative = retrograde
    eccentricity: 0.0067,
    inclination: 3.4,
    axialTilt: 177.4,
  },
  earth: {
    name: 'Earth',
    radius: 6371,
    semiMajorAxis: 149598023,
    orbitalPeriod: 365.256,
    rotationPeriod: 0.9973,
    eccentricity: 0.0167,
    inclination: 0,
    axialTilt: 23.44,
  },
  mars: {
    name: 'Mars',
    radius: 3389.5,
    semiMajorAxis: 227939200,
    orbitalPeriod: 686.98,
    rotationPeriod: 1.026,
    eccentricity: 0.0934,
    inclination: 1.85,
    axialTilt: 25.19,
  },
  jupiter: {
    name: 'Jupiter',
    radius: 69911,
    semiMajorAxis: 778570000,
    orbitalPeriod: 4332.59,
    rotationPeriod: 0.4135,
    eccentricity: 0.0489,
    inclination: 1.31,
    axialTilt: 3.13,
  },
  saturn: {
    name: 'Saturn',
    radius: 58232,
    semiMajorAxis: 1433530000,
    orbitalPeriod: 10759.22,
    rotationPeriod: 0.444,
    eccentricity: 0.0565,
    inclination: 2.49,
    axialTilt: 26.73,
  },
  uranus: {
    name: 'Uranus',
    radius: 25362,
    semiMajorAxis: 2872460000,
    orbitalPeriod: 30688.5,
    rotationPeriod: -0.718, // Retrograde
    eccentricity: 0.0457,
    inclination: 0.77,
    axialTilt: 97.77,
  },
  neptune: {
    name: 'Neptune',
    radius: 24622,
    semiMajorAxis: 4495060000,
    orbitalPeriod: 60182,
    rotationPeriod: 0.6713,
    eccentricity: 0.0113,
    inclination: 1.77,
    axialTilt: 28.32,
  },
};

// Moon data
const MOON_RAW_DATA = {
  moon: {
    name: 'Moon',
    radius: 1737.4,
    semiMajorAxis: 384400, // Distance from Earth
    orbitalPeriod: 27.322,
    rotationPeriod: 27.322, // Tidally locked
    eccentricity: 0.0549,
    inclination: 5.145,
    axialTilt: 6.68,
    parentId: 'earth',
  },
};

// Build celestial body objects with scaled values
function buildCelestialBody(
  id: string,
  data: typeof PLANET_RAW_DATA[keyof typeof PLANET_RAW_DATA] & { parentId?: string },
  type: 'star' | 'planet' | 'moon',
  textureKey: keyof typeof TEXTURE_URLS
): CelestialBody {
  return {
    id,
    name: data.name,
    type,
    radius: data.radius,
    mass: 0, // Not used for rendering
    semiMajorAxis: data.semiMajorAxis,
    eccentricity: data.eccentricity,
    inclination: data.inclination,
    orbitalPeriod: data.orbitalPeriod,
    rotationPeriod: data.rotationPeriod,
    axialTilt: data.axialTilt,
    textureUrl: TEXTURE_URLS[textureKey],
    renderRadius: scaleRadius(data.radius, id === 'sun'),
    parentId: (data as { parentId?: string }).parentId,
  };
}

// Export planet and moon data
export const SUN: CelestialBody = buildCelestialBody('sun', PLANET_RAW_DATA.sun, 'star', 'sun');

export const PLANETS: CelestialBody[] = [
  buildCelestialBody('mercury', PLANET_RAW_DATA.mercury, 'planet', 'mercury'),
  buildCelestialBody('venus', PLANET_RAW_DATA.venus, 'planet', 'venus'),
  buildCelestialBody('earth', PLANET_RAW_DATA.earth, 'planet', 'earth'),
  buildCelestialBody('mars', PLANET_RAW_DATA.mars, 'planet', 'mars'),
  buildCelestialBody('jupiter', PLANET_RAW_DATA.jupiter, 'planet', 'jupiter'),
  buildCelestialBody('saturn', PLANET_RAW_DATA.saturn, 'planet', 'saturn'),
  buildCelestialBody('uranus', PLANET_RAW_DATA.uranus, 'planet', 'uranus'),
  buildCelestialBody('neptune', PLANET_RAW_DATA.neptune, 'planet', 'neptune'),
];

export const MOONS: CelestialBody[] = [
  buildCelestialBody('moon', MOON_RAW_DATA.moon, 'moon', 'moon'),
];

// All celestial bodies indexed by ID
export const CELESTIAL_BODIES: Record<string, CelestialBody> = {
  [SUN.id]: SUN,
  ...Object.fromEntries(PLANETS.map(p => [p.id, p])),
  ...Object.fromEntries(MOONS.map(m => [m.id, m])),
};

// All bodies as array
export const ALL_BODIES = [SUN, ...PLANETS, ...MOONS];

// Bodies that orbit the sun (for root-level rendering)
export const ROOT_BODIES = [SUN, ...PLANETS];

// Saturn has rings - special case
export const SATURN_RING = {
  planetId: 'saturn',
  innerRadius: 1.5,
  outerRadius: 2.5,
  textureUrl: TEXTURE_URLS.saturnRing,
};