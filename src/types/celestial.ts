export type CelestialType = 'star' | 'planet' | 'dwarf' | 'moon';

export interface CelestialBody {
  id: string;
  name: string;
  type: CelestialType;

  // Physical properties
  radius: number;           // Real radius in km
  mass: number;             // Mass in kg (optional for display)

  // Orbital properties
  semiMajorAxis: number;    // Semi-major axis in km (0 for Sun)
  eccentricity: number;      // Orbital eccentricity (0-1)
  inclination: number;      // Orbital inclination in degrees
  orbitalPeriod: number;    // Orbital period in Earth days
  rotationPeriod: number;   // Rotation period in Earth days (negative for retrograde)
  axialTilt: number;        // Axial tilt in degrees

  // Rendering
  textureUrl: string;       // NASA texture URL
  renderRadius: number;     // Scaled radius for rendering

  // Hierarchy
  parentId?: string;        // Parent body ID (for moons)
  children?: string[];      // Child body IDs
}

export interface SimulationState {
  timeScale: number;        // Days per second
  rotationMultiplier: number;
  orbitMultiplier: number;
  isPaused: boolean;
  elapsedTime: number;      // Total simulated time in days (drives orbital revolution)
  rotationTime: number;     // Total simulated time in days (drives self-rotation)
}

export interface SelectionState {
  selectedId: string | null;
  focusedId: string | null;
}

export interface CameraState {
  target: [number, number, number];
  distance: number;
}