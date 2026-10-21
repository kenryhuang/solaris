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

// Dwarf planet data
const DWARF_PLANET_RAW_DATA = {
  pluto: {
    name: 'Pluto',
    radius: 1188.3,
    semiMajorAxis: 5906380000,    // ~39.5 AU
    orbitalPeriod: 90560,         // ~248 years
    rotationPeriod: -6.387,       // Retrograde
    eccentricity: 0.2488,
    inclination: 17.16,
    axialTilt: 122.53,
  },
  ceres: {
    name: 'Ceres',
    radius: 473,
    semiMajorAxis: 413700000,     // ~2.77 AU (in asteroid belt)
    orbitalPeriod: 1681.63,       // ~4.6 years
    rotationPeriod: 0.378,
    eccentricity: 0.076,
    inclination: 10.59,
    axialTilt: 4,
  },
  haumea: {
    name: 'Haumea',
    radius: 780,
    semiMajorAxis: 6484000000,
    orbitalPeriod: 103774,
    rotationPeriod: 0.163,
    eccentricity: 0.195,
    inclination: 28.19,
    axialTilt: 126,
  },
  makemake: {
    name: 'Makemake',
    radius: 715,
    semiMajorAxis: 6850000000,
    orbitalPeriod: 111767,
    rotationPeriod: 0.95,
    eccentricity: 0.159,
    inclination: 28.96,
    axialTilt: 30,
  },
  eris: {
    name: 'Eris',
    radius: 1163,
    semiMajorAxis: 10122000000,
    orbitalPeriod: 203830,
    rotationPeriod: 1.08,
    eccentricity: 0.441,
    inclination: 44.04,
    axialTilt: 78,
  },
};

// Moon data
const MOON_RAW_DATA = {
  // Earth's Moon
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
  // Jupiter's Galilean moons
  io: {
    name: 'Io',
    radius: 1821.6,
    semiMajorAxis: 421700,
    orbitalPeriod: 1.769,
    rotationPeriod: 1.769,
    eccentricity: 0.0041,
    inclination: 0.05,
    axialTilt: 0,
    parentId: 'jupiter',
  },
  europa: {
    name: 'Europa',
    radius: 1560.8,
    semiMajorAxis: 671034,
    orbitalPeriod: 3.551,
    rotationPeriod: 3.551,
    eccentricity: 0.009,
    inclination: 0.47,
    axialTilt: 0.1,
    parentId: 'jupiter',
  },
  ganymede: {
    name: 'Ganymede',
    radius: 2634.1,
    semiMajorAxis: 1070412,
    orbitalPeriod: 7.155,
    rotationPeriod: 7.155,
    eccentricity: 0.0013,
    inclination: 0.2,
    axialTilt: 0.33,
    parentId: 'jupiter',
  },
  callisto: {
    name: 'Callisto',
    radius: 2410.3,
    semiMajorAxis: 1882709,
    orbitalPeriod: 16.689,
    rotationPeriod: 16.689,
    eccentricity: 0.0074,
    inclination: 0.192,
    axialTilt: 0,
    parentId: 'jupiter',
  },
  // Saturn's major moon
  titan: {
    name: 'Titan',
    radius: 2574.73,
    semiMajorAxis: 1221870,
    orbitalPeriod: 15.945,
    rotationPeriod: 15.945,
    eccentricity: 0.0288,
    inclination: 0.34,
    axialTilt: 0,
    parentId: 'saturn',
  },
  // Neptune's major moon
  triton: {
    name: 'Triton',
    radius: 1353.4,
    semiMajorAxis: 354759,
    orbitalPeriod: -5.877,        // Retrograde orbit
    rotationPeriod: -5.877,       // Tidally locked: spin must match the retrograde orbit,
                                  // otherwise the moon rotates opposite to its revolution

    eccentricity: 0.000016,
    inclination: 156.885,
    axialTilt: 0,
    parentId: 'neptune',
  },
  // Uranus's major moons
  titania: {
    name: 'Titania',
    radius: 788.4,
    semiMajorAxis: 435910,
    orbitalPeriod: 8.706,
    rotationPeriod: 8.706,
    eccentricity: 0.0011,
    inclination: 0.34,
    axialTilt: 0,
    parentId: 'uranus',
  },
  oberon: {
    name: 'Oberon',
    radius: 761.4,
    semiMajorAxis: 583520,
    orbitalPeriod: 13.463,
    rotationPeriod: 13.463,
    eccentricity: 0.0014,
    inclination: 0.058,
    axialTilt: 0,
    parentId: 'uranus',
  },
  miranda: {
    name: 'Miranda',
    radius: 235.8,
    semiMajorAxis: 129390,
    orbitalPeriod: 1.413,
    rotationPeriod: 1.413,
    eccentricity: 0.0013,
    inclination: 4.232,
    axialTilt: 0,
    parentId: 'uranus',
  },
  ariel: {
    name: 'Ariel',
    radius: 578.9,
    semiMajorAxis: 190900,
    orbitalPeriod: 2.520,
    rotationPeriod: 2.520,
    eccentricity: 0.0012,
    inclination: 0.26,
    axialTilt: 0,
    parentId: 'uranus',
  },
  umbriel: {
    name: 'Umbriel',
    radius: 584.7,
    semiMajorAxis: 266000,
    orbitalPeriod: 4.144,
    rotationPeriod: 4.144,
    eccentricity: 0.0039,
    inclination: 0.128,
    axialTilt: 0,
    parentId: 'uranus',
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

function buildDwarfPlanet(
  id: string,
  data: typeof DWARF_PLANET_RAW_DATA[keyof typeof DWARF_PLANET_RAW_DATA]
): CelestialBody {
  const textureKey = id as keyof typeof TEXTURE_URLS;
  const hasTexture = TEXTURE_URLS[textureKey] !== undefined;

  return {
    id,
    name: data.name,
    type: 'dwarf',
    radius: data.radius,
    mass: 0,
    semiMajorAxis: data.semiMajorAxis,
    eccentricity: data.eccentricity,
    inclination: data.inclination,
    orbitalPeriod: data.orbitalPeriod,
    rotationPeriod: data.rotationPeriod,
    axialTilt: data.axialTilt,
    textureUrl: hasTexture ? TEXTURE_URLS[textureKey] : PLACEHOLDER_COLORS[id] || '#888888',
    renderRadius: scaleRadius(data.radius, false),
  };
}

function buildMoon(
  id: string,
  data: typeof MOON_RAW_DATA[keyof typeof MOON_RAW_DATA]
): CelestialBody {
  const textureKey = id as keyof typeof TEXTURE_URLS;
  const hasTexture = TEXTURE_URLS[textureKey] !== undefined;

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
    textureUrl: hasTexture ? TEXTURE_URLS[textureKey] : PLACEHOLDER_COLORS[id] || '#888888',
    renderRadius: scaleRadius(data.radius, false),
    parentId: data.parentId,
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

export const DWARF_PLANETS: CelestialBody[] = [
  buildDwarfPlanet('pluto', DWARF_PLANET_RAW_DATA.pluto),
  buildDwarfPlanet('ceres', DWARF_PLANET_RAW_DATA.ceres),
  buildDwarfPlanet('haumea', DWARF_PLANET_RAW_DATA.haumea),
  buildDwarfPlanet('makemake', DWARF_PLANET_RAW_DATA.makemake),
  buildDwarfPlanet('eris', DWARF_PLANET_RAW_DATA.eris),
];

export const MOONS: CelestialBody[] = [
  buildMoon('moon', MOON_RAW_DATA.moon),
  buildMoon('io', MOON_RAW_DATA.io),
  buildMoon('europa', MOON_RAW_DATA.europa),
  buildMoon('ganymede', MOON_RAW_DATA.ganymede),
  buildMoon('callisto', MOON_RAW_DATA.callisto),
  buildMoon('titan', MOON_RAW_DATA.titan),
  buildMoon('triton', MOON_RAW_DATA.triton),
  buildMoon('titania', MOON_RAW_DATA.titania),
  buildMoon('oberon', MOON_RAW_DATA.oberon),
  buildMoon('miranda', MOON_RAW_DATA.miranda),
  buildMoon('ariel', MOON_RAW_DATA.ariel),
  buildMoon('umbriel', MOON_RAW_DATA.umbriel),
];

// All celestial bodies indexed by ID
export const CELESTIAL_BODIES: Record<string, CelestialBody> = {
  [SUN.id]: SUN,
  ...Object.fromEntries(PLANETS.map(p => [p.id, p])),
  ...Object.fromEntries(DWARF_PLANETS.map(d => [d.id, d])),
  ...Object.fromEntries(MOONS.map(m => [m.id, m])),
};

// All bodies as array
export const ALL_BODIES = [SUN, ...PLANETS, ...DWARF_PLANETS, ...MOONS];

// Bodies that orbit the sun (for root-level rendering)
export const ROOT_BODIES = [SUN, ...PLANETS, ...DWARF_PLANETS];

// Saturn has rings - special case
export const SATURN_RING = {
  planetId: 'saturn',
  innerRadius: 1.5,
  outerRadius: 2.5,
  textureUrl: TEXTURE_URLS.saturnRing,
};