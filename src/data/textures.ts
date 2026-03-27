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

  // Moons
  moon: 'https://www.solarsystemscope.com/textures/download/2k_moon.jpg',

  // Background
  starfield: 'https://www.solarsystemscope.com/textures/download/2k_stars_milky_way.jpg',
} as const;

export type TextureKey = keyof typeof TEXTURE_URLS;