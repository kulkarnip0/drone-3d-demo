import * as THREE from "three";
import { BEACH_END_X, COASTLINE_X, WORLD_DEPTH, getTerrainHeight } from "./terrainHeight.js";

export function addBeach(scene) {
  const width = BEACH_END_X - COASTLINE_X;
  const geometry = new THREE.PlaneGeometry(width, WORLD_DEPTH, 12, 80);
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i += 1) {
    const localX = positions.getX(i);
    const z = positions.getY(i);
    const worldX = COASTLINE_X + width / 2 + localX;
    positions.setZ(i, getTerrainHeight(worldX, z) + 0.015);
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0xd9c28a,
    roughness: 0.9,
    metalness: 0.0
  });

  const beach = new THREE.Mesh(geometry, material);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(COASTLINE_X + width / 2, 0, 0);
  beach.receiveShadow = true;
  scene.add(beach);

  return beach;
}
