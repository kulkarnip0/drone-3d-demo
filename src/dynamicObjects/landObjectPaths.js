import * as THREE from "three";
import { getTerrainHeight } from "../world/terrainHeight.js";

function terrainPoint(x, z, clearance = 0.05) {
  return new THREE.Vector3(x, getTerrainHeight(x, z) + clearance, z);
}

function makeClosedPath(points) {
  const curve = new THREE.CatmullRomCurve3(points, true);
  return curve;
}

export function buildLandObjectPaths() {
  return {
    coastalRoadLoop: makeClosedPath([
      terrainPoint(-12, -38),
      terrainPoint(6, -30),
      terrainPoint(24, -16),
      terrainPoint(34, 8),
      terrainPoint(22, 24),
      terrainPoint(0, 18),
      terrainPoint(-14, 2)
    ]),

    villagePatrolLoop: makeClosedPath([
      terrainPoint(-8, -28),
      terrainPoint(14, -24),
      terrainPoint(28, -8),
      terrainPoint(26, 12),
      terrainPoint(8, 18),
      terrainPoint(-8, 8)
    ]),

    footPatrolLoop: makeClosedPath([
      terrainPoint(15, 25),
      terrainPoint(26, 28),
      terrainPoint(32, 18),
      terrainPoint(22, 10),
      terrainPoint(12, 14)
    ])
  };
}
