import type { CelestialBody } from '../types/celestial';
import { TEXTURE_URLS, PLACEHOLDER_COLORS } from './textures';
import { scaleRadius } from '../utils/scale';

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

// Real astronomical data for the major moons (distances in km from the
// parent planet, radii in km). Orbital periods in Earth days; negative
// period = retrograde orbit (Triton). All major moons are tidally locked,
// so rotationPeriod === orbitalPeriod.
const MOON_RAW_DATA = {
  moon: {
    name: 'Moon',
    parentId: 'earth',
    radius: 1737.4,
    semiMajorAxis: 384400,
    orbitalPeriod: 27.322,
    rotationPeriod: 27.322,
    eccentricity: 0.0549,
    inclination: 5.145,
    axialTilt: 6.68,
  },
  io: {
    name: 'Io',
    parentId: 'jupiter',
    radius: 1821.6,
    semiMajorAxis: 421700,
    orbitalPeriod: 1.769,
    rotationPeriod: 1.769,
    eccentricity: 0.0041,
    inclination: 0.05,
    axialTilt: 0,
  },
  europa: {
    name: 'Europa',
    parentId: 'jupiter',
    radius: 1560.8,
    semiMajorAxis: 671034,
    orbitalPeriod: 3.551,
    rotationPeriod: 3.551,
    eccentricity: 0.0094,
    inclination: 0.47,
    axialTilt: 0.1,
  },
  ganymede: {
    name: 'Ganymede',
    parentId: 'jupiter',
    radius: 2634.1,
    semiMajorAxis: 1070412,
    orbitalPeriod: 7.155,
    rotationPeriod: 7.155,
    eccentricity: 0.0013,
    inclination: 0.2,
    axialTilt: 0.33,
  },
  callisto: {
    name: 'Callisto',
    parentId: 'jupiter',
    radius: 2410.3,
    semiMajorAxis: 1882709,
    orbitalPeriod: 16.689,
    rotationPeriod: 16.689,
    eccentricity: 0.0074,
    inclination: 0.19,
    axialTilt: 0,
  },
  titan: {
    name: 'Titan',
    parentId: 'saturn',
    radius: 2574.7,
    semiMajorAxis: 1221870,
    orbitalPeriod: 15.945,
    rotationPeriod: 15.945,
    eccentricity: 0.0288,
    inclination: 0.35,
    axialTilt: 0,
  },
  triton: {
    name: 'Triton',
    parentId: 'neptune',
    radius: 1353.4,
    semiMajorAxis: 354759,
    orbitalPeriod: -5.877, // Retrograde
    rotationPeriod: -5.877,
    eccentricity: 0.000016,
    inclination: 157,
    axialTilt: 0,
  },
};

// Build celestial body objects with scaled values
function buildCelestialBody(
  id: string,
  data: typeof PLANET_RAW_DATA[keyof typeof PLANET_RAW_DATA],
  type: 'star' | 'planet',
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
  };
}

// Build a moon object. Moons reuse the same sqrt-compressed radius scale as
// planets (scaleRadius); their orbital distance is scaled parent-relative at
// render time via scaleMoonDistance (see utils/scale.ts). Moons without an
// available texture fall back to a placeholder color.
function buildMoon(
  id: string,
  data: typeof MOON_RAW_DATA[keyof typeof MOON_RAW_DATA]
): CelestialBody {
  const textureUrl = id === 'moon' ? TEXTURE_URLS.moon : PLACEHOLDER_COLORS[id];
  return {
    id,
    name: data.name,
    type: 'moon',
    radius: data.radius,
    mass: 0,
    semiMajorAxis: data.semiMajorAxis,
    eccentricity: data.eccentricity,
    inclination: data.inclination,
    orbitalPeriod: data.orbitalPeriod,
    rotationPeriod: data.rotationPeriod,
    axialTilt: data.axialTilt,
    textureUrl,
    renderRadius: scaleRadius(data.radius),
    parentId: data.parentId,
  };
}

// The Sun
export const SUN: CelestialBody = buildCelestialBody('sun', PLANET_RAW_DATA.sun, 'star', 'sun');

// The eight solar system planets — exactly one entry per planet, with no
// duplicates and no extraneous bodies (dwarf planets, moons, etc. were
// previously mixed in here and inflated the rendered body count).
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

// Major moons of the planets, grouped by parent. Each moon orbits its parent
// planet (rendered relative to it), not the Sun.
export const MOONS: CelestialBody[] = [
  buildMoon('moon', MOON_RAW_DATA.moon),
  buildMoon('io', MOON_RAW_DATA.io),
  buildMoon('europa', MOON_RAW_DATA.europa),
  buildMoon('ganymede', MOON_RAW_DATA.ganymede),
  buildMoon('callisto', MOON_RAW_DATA.callisto),
  buildMoon('titan', MOON_RAW_DATA.titan),
  buildMoon('triton', MOON_RAW_DATA.triton),
];

// Moons indexed by their parent planet's id, for scene rendering.
export const MOONS_BY_PARENT: Record<string, CelestialBody[]> = MOONS.reduce(
  (acc, moon) => {
    (acc[moon.parentId!] ??= []).push(moon);
    return acc;
  },
  {} as Record<string, CelestialBody[]>
);

// Wire up parent → children links.
PLANETS.forEach((p) => {
  p.children = (MOONS_BY_PARENT[p.id] ?? []).map((m) => m.id);
});

// All celestial bodies indexed by ID
export const CELESTIAL_BODIES: Record<string, CelestialBody> = {
  [SUN.id]: SUN,
  ...Object.fromEntries(PLANETS.map(p => [p.id, p])),
  ...Object.fromEntries(MOONS.map(m => [m.id, m])),
};

// All bodies as array
export const ALL_BODIES = [SUN, ...PLANETS, ...MOONS];

// Bodies rendered at the root of the scene: the Sun plus the 8 planets.
export const ROOT_BODIES = [SUN, ...PLANETS];

// Saturn has rings - special case
export const SATURN_RING = {
  planetId: 'saturn',
  innerRadius: 1.5,
  outerRadius: 2.5,
  textureUrl: TEXTURE_URLS.saturnRing,
};
