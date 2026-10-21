// Textures served locally from public/textures/
// Source: Solar System Scope (https://www.solarsystemscope.com/textures/) — CC BY 4.0
// Note: SSS only provides the Sun, the 8 planets, the Moon, and starfields.
// Dwarf planets and other moons fall back to PLACEHOLDER_COLORS below.
const BASE = '/textures';

export const TEXTURE_URLS = {
  // Sun
  sun: `${BASE}/2k_sun.jpg`,

  // Planets
  mercury: `${BASE}/2k_mercury.jpg`,
  venus: `${BASE}/2k_venus_surface.jpg`,
  earth: `${BASE}/2k_earth_daymap.jpg`,
  mars: `${BASE}/2k_mars.jpg`,
  jupiter: `${BASE}/2k_jupiter.jpg`,
  saturn: `${BASE}/2k_saturn.jpg`,
  saturnRing: `${BASE}/2k_saturn_ring_alpha.png`,
  uranus: `${BASE}/2k_uranus.jpg`,
  neptune: `${BASE}/2k_neptune.jpg`,

  // Moons
  moon: `${BASE}/2k_moon.jpg`,

  // Background
  starfield: `${BASE}/2k_stars_milky_way.jpg`,
} as const;

export type TextureKey = keyof typeof TEXTURE_URLS;

// Placeholder colors for bodies without available textures
export const PLACEHOLDER_COLORS: Record<string, string> = {
  // Dwarf planets
  pluto: '#B8A99A',       // Pale brown
  ceres: '#9E9E9E',       // Gray
  haumea: '#8B7D6B',      // Brownish-gray
  makemake: '#CD853F',    // Peru (reddish-brown)
  eris: '#D3D3D3',        // Light gray

  // Jupiter moons
  io: '#E8D44D',          // Sulfur yellow
  europa: '#D8C9B8',      // Icy beige
  ganymede: '#A09383',    // Grayish brown
  callisto: '#6B5D4F',    // Dark brown

  // Saturn moons
  titan: '#DDA000',       // Hazy orange

  // Neptune moons
  triton: '#E8D8D8',      // Pinkish ice

  // Uranus moons
  titania: '#A9A9A9',     // Dark gray
  oberon: '#696969',      // Dim gray
  miranda: '#808080',     // Gray
  ariel: '#C0C0C0',       // Silver
  umbriel: '#2F4F4F',     // Dark slate gray
};
