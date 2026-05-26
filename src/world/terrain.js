import * as THREE from "three";
import { WORLD_DEPTH, WORLD_WIDTH, getTerrainHeight } from "./terrainHeight.js";

function colorForHeight(height) {
  if (height < 0.2) return new THREE.Color(0xd9c28a);
  if (height < 3.0) return new THREE.Color(0x4f8a3d);
  if (height < 6.0) return new THREE.Color(0x5f7f3a);
  return new THREE.Color(0x8b7d63);
}

export function addTerrain(scene) {
  const geometry = new THREE.PlaneGeometry(WORLD_WIDTH, WORLD_DEPTH, 120, 100);
  const positions = geometry.attributes.position;
  const colors = [];

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const z = positions.getY(i);
    const height = getTerrainHeight(x, z);

    positions.setZ(i, height);

    const color = colorForHeight(height);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0.0
  });

  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  scene.add(terrain);

  return terrain;
}
