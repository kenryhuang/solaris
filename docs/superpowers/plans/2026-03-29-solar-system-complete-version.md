# Solar System Simulator - Complete Version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Solar System Simulator with dwarf planets, major satellites, and an asteroid belt particle system.

**Architecture:** Follow existing patterns from core version. Add dwarf planets as a new category following the planet pattern. Add moons as children of their parent planets. Create AsteroidBelt using Three.js InstancedMesh for performance with thousands of small bodies.

**Tech Stack:** React 18, TypeScript, React Three Fiber, Three.js InstancedMesh, Zustand

---

## File Structure

```
src/
├── data/
│   ├── planets.ts          # MODIFY: Add dwarf planets + more moons
│   └── textures.ts         # MODIFY: Add new texture URLs
├── components/
│   └── scene/
│       ├── SolarSystem.tsx # MODIFY: Render dwarf planets + asteroid belt
│       ├── AsteroidBelt.tsx # CREATE: Instanced mesh particle system
│       └── CelestialBody.tsx # NO CHANGE: Already handles all types
│   └── ui/
│       └── CelestialSelector.tsx # MODIFY: Add 'Dwarf Planets' category
├── utils/
│   └── asteroid.test.ts    # CREATE: Tests for asteroid distribution
│   └── asteroid.ts         # CREATE: Asteroid belt position generator
```

---

### Task 1: Add Dwarf Planet and Moon Texture URLs

**Files:**
- Modify: `src/data/textures.ts`

- [ ] **Step 1: Add new texture URLs for dwarf planets and moons**

Update `src/data/textures.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/data/textures.ts
git commit -m "feat: add texture URLs for dwarf planets and major satellites"
```

---

### Task 2: Create Asteroid Belt Utilities with Tests

**Files:**
- Create: `src/utils/asteroid.ts`
- Create: `src/utils/asteroid.test.ts`

- [ ] **Step 1: Write failing asteroid distribution tests**

Create `src/utils/asteroid.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateAsteroidPositions, ASTEROID_BELT_CONFIG } from './asteroid';

describe('generateAsteroidPositions', () => {
  it('generates correct number of positions', () => {
    const positions = generateAsteroidPositions(100);
    expect(positions.length).toBe(100);
  });

  it('positions are within asteroid belt range', () => {
    const positions = generateAsteroidPositions(50);
    const scaledInner = ASTEROID_BELT_CONFIG.innerRadius * 1e-9;
    const scaledOuter = ASTEROID_BELT_CONFIG.outerRadius * 1e-9;

    positions.forEach(([x, y, z]) => {
      const distance = Math.sqrt(x * x + y * y + z * z);
      expect(distance).toBeGreaterThanOrEqual(scaledInner * 0.8); // Allow some spread
      expect(distance).toBeLessThanOrEqual(scaledOuter * 1.2);
    });
  });

  it('positions are randomly distributed (not all same)', () => {
    const positions = generateAsteroidPositions(100);
    const uniquePositions = new Set(positions.map(p => p.join(',')));
    expect(uniquePositions.size).toBeGreaterThan(90); // Most should be unique
  });

  it('returns empty array for zero count', () => {
    const positions = generateAsteroidPositions(0);
    expect(positions).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test src/utils/asteroid.test.ts`
Expected: Tests fail with "Cannot find module './asteroid'"

- [ ] **Step 3: Implement asteroid belt utilities**

Create `src/utils/asteroid.ts`:

```typescript
import { scaleDistance } from './scale';

// Asteroid belt configuration (between Mars and Jupiter)
export const ASTEROID_BELT_CONFIG = {
  innerRadius: 329115000,    // ~2.2 AU (km)
  outerRadius: 478710000,    // ~3.2 AU (km)
  count: 2000,               // Number of asteroids to render
  sizeRange: [0.01, 0.05],   // Render size range
  inclinationSpread: 20,     // Degrees of inclination spread
};

/**
 * Generate random positions for asteroids in the belt
 * Uses simplified circular distribution with inclination variation
 */
export function generateAsteroidPositions(count: number): [number, number, number][] {
  if (count <= 0) return [];

  const positions: [number, number, number][] = [];
  const { innerRadius, outerRadius, inclinationSpread } = ASTEROID_BELT_CONFIG;

  for (let i = 0; i < count; i++) {
    // Random distance within belt
    const distance = innerRadius + Math.random() * (outerRadius - innerRadius);

    // Random angle
    const angle = Math.random() * 2 * Math.PI;

    // Random inclination
    const inclination = (Math.random() - 0.5) * inclinationSpread;
    const inclinationRad = (inclination * Math.PI) / 180;

    // Calculate position
    const scaledDistance = scaleDistance(distance);
    const x = scaledDistance * Math.cos(angle);
    const y = scaledDistance * Math.sin(angle) * Math.cos(inclinationRad);
    const z = scaledDistance * Math.sin(angle) * Math.sin(inclinationRad);

    positions.push([x, z, y]); // Swap y and z for Three.js coordinate system
  }

  return positions;
}

/**
 * Generate random sizes for asteroids
 */
export function generateAsteroidSizes(count: number): number[] {
  if (count <= 0) return [];

  const { sizeRange } = ASTEROID_BELT_CONFIG;
  const sizes: number[] = [];

  for (let i = 0; i < count; i++) {
    const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    sizes.push(size);
  }

  return sizes;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/utils/asteroid.test.ts`
Expected: All asteroid tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/asteroid.ts src/utils/asteroid.test.ts
git commit -m "feat: add asteroid belt position generator with tests"
```

---

### Task 3: Add Dwarf Planet and Satellite Data

**Files:**
- Modify: `src/data/planets.ts`

- [ ] **Step 1: Add dwarf planet raw data and moon data**

Update `src/data/planets.ts`, adding after the existing MOON_RAW_DATA:

```typescript
import type { CelestialBody } from '../types/celestial';
import { TEXTURE_URLS, PLACEHOLDER_COLORS } from './textures';
import { scaleRadius } from '../utils/scale';

// Real astronomical data (distances in km, radii in km)
const PLANET_RAW_DATA = {
  // ... existing planet data unchanged ...
  sun: {
    name: 'Sun',
    radius: 696340,
    semiMajorAxis: 0,
    orbitalPeriod: 0,
    rotationPeriod: 25.05,
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
    rotationPeriod: -243.025,
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
    rotationPeriod: -0.718,
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
    radius: 780,                  // Approximate (elongated shape)
    semiMajorAxis: 6484000000,    // ~43.2 AU
    orbitalPeriod: 103774,
    rotationPeriod: 0.163,        // Very fast rotation
    eccentricity: 0.195,
    inclination: 28.19,
    axialTilt: 126,
  },
  makemake: {
    name: 'Makemake',
    radius: 715,
    semiMajorAxis: 6850000000,    // ~45.7 AU
    orbitalPeriod: 111767,
    rotationPeriod: 0.95,         // Unknown, estimated
    eccentricity: 0.159,
    inclination: 28.96,
    axialTilt: 30,
  },
  eris: {
    name: 'Eris',
    radius: 1163,
    semiMajorAxis: 10122000000,   // ~67.7 AU
    orbitalPeriod: 203830,
    rotationPeriod: 1.08,         // Estimated
    eccentricity: 0.441,
    inclination: 44.04,
    axialTilt: 78,
  },
};

// Moon data - extended with major satellites
const MOON_RAW_DATA = {
  // Earth's Moon
  moon: {
    name: 'Moon',
    radius: 1737.4,
    semiMajorAxis: 384400,
    orbitalPeriod: 27.322,
    rotationPeriod: 27.322,
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
    rotationPeriod: 5.877,
    eccentricity: 0.000016,
    inclination: 156.885,         // Highly inclined retrograde
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
  type: 'star' | 'planet' | 'dwarf' | 'moon',
  textureKey: keyof typeof TEXTURE_URLS
): CelestialBody {
  return {
    id,
    name: data.name,
    type,
    radius: data.radius,
    mass: 0,
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

// Build dwarf planet (handles placeholder colors for bodies without textures)
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

// Build moon (handles placeholder colors)
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
```

- [ ] **Step 2: Commit**

```bash
git add src/data/planets.ts
git commit -m "feat: add dwarf planets and major satellites data"
```

---

### Task 4: Create AsteroidBelt Component

**Files:**
- Create: `src/components/scene/AsteroidBelt.tsx`

- [ ] **Step 1: Create AsteroidBelt component using InstancedMesh**

Create `src/components/scene/AsteroidBelt.tsx`:

```tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateAsteroidPositions, generateAsteroidSizes, ASTEROID_BELT_CONFIG } from '../../utils/asteroid';
import { useSimulationStore } from '../../stores/simulationStore';
import { calculateMeanAnomaly } from '../../utils/orbital';

export function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { isPaused, elapsedTime, orbitMultiplier, timeScale } = useSimulationStore();

  // Generate asteroid positions and sizes
  const { positions, sizes, initialAngles } = useMemo(() => {
    const count = ASTEROID_BELT_CONFIG.count;
    const pos = generateAsteroidPositions(count);
    const sz = generateAsteroidSizes(count);
    const angles = pos.map(([x, z]) => Math.atan2(z, x));
    return { positions: pos, sizes: sz, initialAngles: angles };
  }, []);

  // Initialize instanced mesh matrices
  useMemo(() => {
    if (!meshRef.current) return;

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    for (let i = 0; i < positions.length; i++) {
      const [x, y, z] = positions[i];
      position.set(x, y, z);
      matrix.setPosition(position);
      matrix.scale(new THREE.Vector3(sizes[i], sizes[i], sizes[i]));
      meshRef.current.setMatrixAt(i, matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, sizes]);

  // Animate asteroids (slow orbital motion)
  useFrame((_, delta) => {
    if (!meshRef.current || isPaused) return;

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    // Asteroids orbit very slowly (typical period ~3-5 years)
    const typicalOrbitalPeriod = 1500; // ~4 years in days

    for (let i = 0; i < positions.length; i++) {
      const [baseX, baseY, baseZ] = positions[i];
      const baseDistance = Math.sqrt(baseX * baseX + baseZ * baseZ);
      const initialAngle = initialAngles[i];

      // Calculate new angle based on elapsed time
      const time = elapsedTime + delta * timeScale * orbitMultiplier;
      const angleOffset = calculateMeanAnomaly(time, typicalOrbitalPeriod + Math.random() * 500);
      const newAngle = initialAngle + angleOffset * 0.001; // Very slow rotation

      const x = baseDistance * Math.cos(newAngle);
      const z = baseDistance * Math.sin(newAngle);

      position.set(x, baseY, z);
      matrix.setPosition(position);
      matrix.scale(new THREE.Vector3(sizes[i], sizes[i], sizes[i]));
      meshRef.current.setMatrixAt(i, matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Gray/brown color for asteroids
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#4A4A4A',
      roughness: 0.9,
      metalness: 0.1,
    });
  }, []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[new THREE.IcosahedronGeometry(1, 0), material, ASTEROID_BELT_CONFIG.count]}
      frustumCulled={false}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/scene/AsteroidBelt.tsx
git commit -m "feat: add AsteroidBelt component with InstancedMesh for performance"
```

---

### Task 5: Update SolarSystem to Render New Bodies

**Files:**
- Modify: `src/components/scene/SolarSystem.tsx`

- [ ] **Step 1: Update SolarSystem to include dwarf planets, moons, and asteroid belt**

Update `src/components/scene/SolarSystem.tsx`:

```tsx
import { Suspense } from 'react';
import { CelestialBody } from './CelestialBody';
import { OrbitLine } from './OrbitLine';
import { StarField } from './StarField';
import { AsteroidBelt } from './AsteroidBelt';
import { ROOT_BODIES, MOONS, DWARF_PLANETS, CELESTIAL_BODIES } from '../../data/planets';
import { useSelectionStore } from '../../stores/selectionStore';
import { useSimulationStore } from '../../stores/simulationStore';
import { useFrame } from '@react-three/fiber';

export function SolarSystem() {
  const { select, focus } = useSelectionStore();
  const advanceTime = useSimulationStore((state) => state.advanceTime);

  // Advance simulation time each frame
  useFrame((_, delta) => {
    advanceTime(delta);
  });

  const handleBodyClick = (id: string) => {
    select(id);
    focus(id);
  };

  return (
    <Suspense fallback={null}>
      {/* Background */}
      <StarField />

      {/* Ambient light for non-sun bodies */}
      <ambientLight intensity={0.1} />

      {/* Sun, planets, and dwarf planets */}
      {ROOT_BODIES.map((body) => (
        <group key={body.id}>
          <CelestialBody
            body={body}
            onClick={() => handleBodyClick(body.id)}
          />
          {body.semiMajorAxis > 0 && <OrbitLine body={body} />}
        </group>
      ))}

      {/* Dwarf planets with distinct orbit color */}
      {DWARF_PLANETS.map((body) => (
        <group key={`dwarf-${body.id}`}>
          <CelestialBody
            body={body}
            onClick={() => handleBodyClick(body.id)}
          />
          <OrbitLine body={body} color="#666666" />
        </group>
      ))}

      {/* Asteroid belt */}
      <AsteroidBelt />

      {/* Moons */}
      {MOONS.map((moon) => {
        const parent = CELESTIAL_BODIES[moon.parentId!];
        if (!parent) return null;

        return (
          <group key={moon.id}>
            <CelestialBody
              body={moon}
              onClick={() => handleBodyClick(moon.id)}
            />
            <OrbitLine body={moon} color="#333333" />
          </group>
        );
      })}
    </Suspense>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/scene/SolarSystem.tsx
git commit -m "feat: integrate dwarf planets, major satellites, and asteroid belt into scene"
```

---

### Task 6: Update CelestialSelector for New Categories

**Files:**
- Modify: `src/components/ui/CelestialSelector.tsx`

- [ ] **Step 1: Add 'Dwarf Planets' category to selector**

Update `src/components/ui/CelestialSelector.tsx`:

```tsx
import { useState } from 'react';
import { useSelectionStore } from '../../stores/selectionStore';
import { ALL_BODIES } from '../../data/planets';

export function CelestialSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { select, focus, selectedId } = useSelectionStore();

  const selectedBody = selectedId ? ALL_BODIES.find((b) => b.id === selectedId) : null;

  const handleSelect = (id: string) => {
    select(id);
    focus(id);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 left-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800/90"
      >
        <span>{selectedBody?.name || 'Select Body'}</span>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="mt-1 bg-gray-900/95 text-white rounded-lg shadow-lg overflow-hidden w-48 max-h-96 overflow-y-auto">
          {['star', 'planet', 'dwarf', 'moon'].map((type) => (
            <div key={type}>
              <div className="px-3 py-1 bg-gray-800 text-xs uppercase text-gray-400 font-semibold sticky top-0">
                {type === 'star' ? 'Stars' : type === 'planet' ? 'Planets' : type === 'dwarf' ? 'Dwarf Planets' : 'Moons'}
              </div>
              {ALL_BODIES.filter((b) => b.type === type).map((body) => (
                <button
                  key={body.id}
                  onClick={() => handleSelect(body.id)}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-600 ${
                    selectedId === body.id ? 'bg-blue-700' : ''
                  }`}
                >
                  {body.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/CelestialSelector.tsx
git commit -m "feat: add Dwarf Planets category to celestial selector"
```

---

### Task 7: Handle Placeholder Color Bodies in CelestialBody Component

**Files:**
- Modify: `src/components/scene/CelestialBody.tsx`

- [ ] **Step 1: Update CelestialBody to handle placeholder colors for bodies without textures**

Update `src/components/scene/CelestialBody.tsx`:

```tsx
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody as CelestialBodyType } from '../../types/celestial';
import { useSimulationStore } from '../../stores/simulationStore';
import { calculateOrbitalPosition, calculateMeanAnomaly } from '../../utils/orbital';
import { scaleDistance } from '../../utils/scale';

interface CelestialBodyProps {
  body: CelestialBodyType;
  onClick?: () => void;
}

// Check if textureUrl is actually a color (for placeholder bodies)
function isColorUrl(url: string): boolean {
  return url.startsWith('#') || url.length === 7 || url.length === 9;
}

export function CelestialBody({ body, onClick }: CelestialBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { isPaused, elapsedTime, rotationMultiplier, orbitMultiplier, timeScale } = useSimulationStore();

  // Load texture if available, otherwise use placeholder color
  const isPlaceholder = isColorUrl(body.textureUrl);
  const texture = isPlaceholder ? null : useTexture(body.textureUrl);

  // Create material based on whether we have texture or placeholder color
  const material = useMemo(() => {
    if (isPlaceholder) {
      return new THREE.MeshStandardMaterial({
        color: body.textureUrl,
        roughness: 0.8,
        metalness: 0.1,
      });
    }
    return null; // Will use inline material with texture
  }, [isPlaceholder, body.textureUrl]);

  // Animation frame
  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current) return;

    // Rotation
    if (!isPaused && body.rotationPeriod !== 0) {
      const rotationSpeed = (2 * Math.PI) / (body.rotationPeriod * 86400);
      meshRef.current.rotation.y += rotationSpeed * delta * 1000 * rotationMultiplier;
    }

    // Orbital motion
    if (!isPaused && body.semiMajorAxis > 0 && body.orbitalPeriod > 0) {
      const time = elapsedTime + delta * timeScale * orbitMultiplier;
      const meanAnomaly = calculateMeanAnomaly(time, Math.abs(body.orbitalPeriod));
      const [x, y, z] = calculateOrbitalPosition({
        semiMajorAxis: scaleDistance(body.semiMajorAxis),
        eccentricity: body.eccentricity,
        inclination: body.inclination,
        meanAnomaly,
      });
      groupRef.current.position.set(x, z, y);
    }
  });

  // Initial position
  useEffect(() => {
    if (groupRef.current && body.semiMajorAxis > 0 && body.orbitalPeriod > 0) {
      const meanAnomaly = calculateMeanAnomaly(elapsedTime, Math.abs(body.orbitalPeriod));
      const [x, y, z] = calculateOrbitalPosition({
        semiMajorAxis: scaleDistance(body.semiMajorAxis),
        eccentricity: body.eccentricity,
        inclination: body.inclination,
        meanAnomaly,
      });
      groupRef.current.position.set(x, z, y);
    }
  }, [body, elapsedTime]);

  const isSun = body.type === 'star';

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[body.renderRadius, 64, 64]} />
        {isSun ? (
          <meshBasicMaterial map={texture} />
        ) : isPlaceholder ? (
          <primitive object={material} attach="material" />
        ) : (
          <meshStandardMaterial map={texture} />
        )}
      </mesh>
      {isSun && (
        <pointLight intensity={2} distance={0} decay={0} />
      )}
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/scene/CelestialBody.tsx
git commit -m "feat: handle placeholder color bodies without textures"
```

---

### Task 8: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass (orbital, scale, asteroid, stores)

- [ ] **Step 2: Run build verification**

Run: `npm run build`
Expected: Build succeeds without TypeScript errors

- [ ] **Step 3: Run dev server for manual testing**

Run: `npm run dev`
Expected: App renders with:
- Sun + 8 planets
- 5 dwarf planets (Pluto, Ceres, Haumea, Makemake, Eris)
- 12 moons (Moon + Galilean moons + Titan + Triton + Uranus moons)
- Asteroid belt between Mars and Jupiter

- [ ] **Step 4: Verify selector shows all categories**

Manually test:
- Click celestial selector dropdown
- Verify 4 categories: Stars, Planets, Dwarf Planets, Moons
- Verify each category has correct bodies listed

- [ ] **Step 5: Verify dwarf planets and moons render**

Manually test:
- Select Pluto, verify it appears in outer solar system
- Select Ceres, verify it appears in asteroid belt region
- Select Io/Europa/Ganymede/Callisto, verify they appear near Jupiter
- Select Titan, verify it appears near Saturn

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete version with dwarf planets, major satellites, and asteroid belt"
```

---

## Self-Review Checklist

### Spec Coverage
- [x] Dwarf planets (Pluto, Ceres, Haumea, Makemake, Eris) - Task 3
- [x] Major satellites (Galilean moons, Titan, Triton, Uranus moons) - Task 3
- [x] Asteroid belt particle system - Task 4
- [x] InstancedMesh for performance - Task 4
- [x] UI update for new categories - Task 6
- [x] Placeholder handling for bodies without textures - Task 7

### Placeholder Scan
- No TBD, TODO, or placeholder text in code blocks
- All code blocks contain complete implementations
- Texture placeholders use actual color values (#RRGGBB format)

### Type Consistency
- `CelestialBody.type` includes 'dwarf' (already in types/celestial.ts)
- `buildDwarfPlanet` returns `CelestialBody` with `type: 'dwarf'`
- `buildMoon` returns `CelestialBody` with `type: 'moon'` and `parentId`
- `DWARF_PLANETS` array typed as `CelestialBody[]`
- `MOONS` array typed as `CelestialBody[]` with expanded data

### Performance Considerations
- Asteroid belt uses InstancedMesh (2000 instances)
- Asteroid orbital motion is simplified (uniform slow rotation)
- Bodies without textures use simple colored materials
- No additional heavy computations per frame