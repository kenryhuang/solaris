import { describe, it, expect } from 'vitest';
import { SUN, PLANETS, MOONS, MOONS_BY_PARENT, ROOT_BODIES, ALL_BODIES, CELESTIAL_BODIES } from '../data/planets';
import { TEXTURE_URLS } from '../data/textures';

const EXPECTED_PLANETS = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
];

describe('planet data contract', () => {
  it('defines exactly the eight solar system planets', () => {
    expect(PLANETS.map((p) => p.name)).toEqual(EXPECTED_PLANETS);
  });

  it('has no duplicate planet entries', () => {
    const ids = PLANETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = PLANETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('contains no extraneous bodies (dwarf planets, moons, asteroids)', () => {
    const forbidden = ['pluto', 'ceres', 'haumea', 'makemake', 'eris', 'moon', 'io', 'europa', 'ganymede', 'callisto', 'titan', 'triton', 'titania', 'oberon', 'miranda', 'ariel', 'umbriel'];
    PLANETS.forEach((p) => {
      expect(forbidden).not.toContain(p.id);
    });
    expect(PLANETS.every((p) => p.type === 'planet')).toBe(true);
  });

  it('defines the major moons with real data and parent links', () => {
    expect(MOONS.map((m) => m.id)).toEqual([
      'moon', 'io', 'europa', 'ganymede', 'callisto', 'titan', 'triton',
    ]);
    MOONS.forEach((m) => {
      expect(m.type).toBe('moon');
      expect(m.parentId).toBeTruthy();
      expect(PLANETS.some((p) => p.id === m.parentId)).toBe(true);
      expect(m.radius).toBeGreaterThan(0);
      expect(m.semiMajorAxis).toBeGreaterThan(0);
      expect(m.renderRadius).toBeGreaterThan(0);
    });
  });

  it('uses the existing 2k_moon.jpg texture for the Moon', () => {
    const moon = MOONS.find((m) => m.id === 'moon')!;
    expect(moon.textureUrl).toBe(TEXTURE_URLS.moon);
    expect(moon.textureUrl).toContain('2k_moon.jpg');
  });

  it('groups moons by parent and wires up children links', () => {
    expect(MOONS_BY_PARENT['earth'].map((m) => m.id)).toEqual(['moon']);
    expect(MOONS_BY_PARENT['jupiter'].map((m) => m.id)).toEqual([
      'io', 'europa', 'ganymede', 'callisto',
    ]);
    expect(MOONS_BY_PARENT['saturn'].map((m) => m.id)).toEqual(['titan']);
    expect(MOONS_BY_PARENT['neptune'].map((m) => m.id)).toEqual(['triton']);
    const earth = PLANETS.find((p) => p.id === 'earth')!;
    expect(earth.children).toEqual(['moon']);
  });

  it('renders exactly the Sun plus the eight planets at the scene root', () => {
    // SolarSystem maps over ROOT_BODIES and renders one CelestialBody per
    // entry — nothing else. The rendered set must therefore be exactly
    // [SUN, ...PLANETS] with no additional sources of bodies.
    expect(ROOT_BODIES).toEqual([SUN, ...PLANETS]);
    expect(ROOT_BODIES).toHaveLength(9);
    expect(ROOT_BODIES[0].type).toBe('star');
    expect(ROOT_BODIES.slice(1).every((b) => b.type === 'planet')).toBe(true);
  });

  it('keeps every derived collection consistent with the planet data', () => {
    expect(ALL_BODIES).toEqual([...ROOT_BODIES, ...MOONS]);
    expect(Object.keys(CELESTIAL_BODIES).sort()).toEqual(
      [SUN.id, ...PLANETS.map((p) => p.id), ...MOONS.map((m) => m.id)].sort()
    );
    expect(Object.keys(CELESTIAL_BODIES)).toHaveLength(9 + MOONS.length);
  });
});
