// NASA/Solar System Scope texture URLs
export const TEXTURE_URLS = {
  // Sun
  sun: 'https://www.solarsystemscope.com/textures/download/2k_sun.jpg',

  // Planets
  mercury: 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
  venus: 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
  earth: 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
  mars: 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
  jupiter: 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
  saturn: 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
  saturnRing: 'https://www.solarsystemscope.com/textures/download/2k_saturn_ring.png',
  uranus: 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
  neptune: 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg',

  // Dwarf Planets
  pluto: 'https://www.solarsystemscope.com/textures/download/2k_pluto.jpg',
  ceres: 'https://www.solarsystemscope.com/textures/download/2k_ceres.jpg',
  // Note: Haumea, Makemake, Eris don't have standard textures available
  // Using placeholder colors/materials for these

  // Moons
  moon: 'https://www.solarsystemscope.com/textures/download/2k_moon.jpg',
  io: 'https://www.solarsystemscope.com/textures/download/2k_io.jpg',
  europa: 'https://www.solarsystemscope.com/textures/download/2k_europa.jpg',
  ganymede: 'https://www.solarsystemscope.com/textures/download/2k_ganymede.jpg',
  callisto: 'https://www.solarsystemscope.com/textures/download/2k_callisto.jpg',
  titan: 'https://www.solarsystemscope.com/textures/download/2k_titan.jpg',
  triton: 'https://www.solarsystemscope.com/textures/download/2k_triton.jpg',
  // Note: Uranus moons use placeholder colors

  // Background
  starfield: 'https://www.solarsystemscope.com/textures/download/2k_stars_milky_way.jpg',
} as const;

export type TextureKey = keyof typeof TEXTURE_URLS;

// Placeholder colors for bodies without available textures
export const PLACEHOLDER_COLORS: Record<string, string> = {
  haumea: '#8B7D6B',    // Brownish-gray
  makemake: '#CD853F',  // Peru (reddish-brown)
  eris: '#D3D3D3',      // Light gray
  titania: '#A9A9A9',   // Dark gray
  oberon: '#696969',    // Dim gray
  miranda: '#808080',   // Gray
  ariel: '#C0C0C0',     // Silver
  umbriel: '#2F4F4F',   // Dark slate gray
};