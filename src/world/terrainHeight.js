export const WORLD_WIDTH = 120;
export const WORLD_DEPTH = 100;
export const COASTLINE_X = -32;
export const BEACH_END_X = -22;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getTerrainHeight(x, z) {
  if (x < COASTLINE_X) {
    return -0.35;
  }

  if (x < BEACH_END_X) {
    return 0.04 + Math.sin(z * 0.12) * 0.08;
  }

  const inland = clamp((x - BEACH_END_X) / 70, 0, 1);
  const farInland = clamp((x - 28) / 26, 0, 1);

  const rollingHills =
    Math.sin(x * 0.12) * 2.0 +
    Math.cos(z * 0.1) * 1.6 +
    Math.sin((x + z) * 0.06) * 1.2 +
    Math.cos((x - z) * 0.04) * 1.0;

  const ridgeA = Math.exp(-((x - 18) ** 2 + (z + 8) ** 2) / 550) * 6.5;
  const ridgeB = Math.exp(-((x - 34) ** 2 + (z - 22) ** 2) / 420) * 5.0;

  // Mountain wall on the opposite side of the sea, near the far inland edge.
  // This makes the green land end with a visible hill/ridge instead of fading flat.
  const farRidgeProfile = Math.exp(-((x - 50) ** 2) / 180);
  const farRidgeVariation = 0.75 + 0.25 * Math.sin(z * 0.11) + 0.18 * Math.cos(z * 0.21);
  const farInlandRidge = farRidgeProfile * farRidgeVariation * 12.0;

  const backHill = Math.exp(-((x - 44) ** 2 + (z + 30) ** 2) / 260) * 5.5;
  const frontHill = Math.exp(-((x - 46) ** 2 + (z - 32) ** 2) / 280) * 5.0;

  const height =
    0.25 +
    inland * 1.8 +
    rollingHills * inland +
    ridgeA +
    ridgeB +
    farInland * farInlandRidge +
    backHill +
    frontHill;

  return Math.max(0.06, height);
}

export function getTerrainSlope(x, z) {
  const step = 1.5;
  const hx1 = getTerrainHeight(x + step, z);
  const hx0 = getTerrainHeight(x - step, z);
  const hz1 = getTerrainHeight(x, z + step);
  const hz0 = getTerrainHeight(x, z - step);

  const dx = (hx1 - hx0) / (2 * step);
  const dz = (hz1 - hz0) / (2 * step);

  return Math.atan(Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI;
}

export function getTerrainRisk(x, z) {
  const slope = getTerrainSlope(x, z);

  if (x < COASTLINE_X) return "water";
  if (x < BEACH_END_X) return "beach";
  if (slope > 24) return "high";
  if (slope > 13) return "medium";
  return "low";
}
