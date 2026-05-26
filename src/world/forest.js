import * as THREE from "three";
import { getTerrainHeight } from "./terrainHeight.js";

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function addTree(scene, x, z, scale = 1) {
  const groundY = getTerrainHeight(x, z);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.32 * scale, 2.4 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x7b4f28, roughness: 0.9 })
  );
  trunk.position.set(x, groundY + 1.2 * scale, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(1.25 * scale, 3.2 * scale, 10),
    new THREE.MeshStandardMaterial({ color: 0x1f6b2a, roughness: 0.85 })
  );
  crown.position.set(x, groundY + 3.25 * scale, z);
  crown.castShadow = true;
  scene.add(crown);
}

function addForestZone(scene, centerX, centerZ, radiusX, radiusZ, count, seedOffset) {
  const trees = [];

  for (let i = 0; i < count; i += 1) {
    const angle = seededRandom(seedOffset + i * 9.1) * Math.PI * 2;
    const radius = Math.sqrt(seededRandom(seedOffset + i * 3.7));
    const x = centerX + Math.cos(angle) * radius * radiusX;
    const z = centerZ + Math.sin(angle) * radius * radiusZ;
    const scale = 0.75 + seededRandom(seedOffset + i * 5.3) * 0.8;

    addTree(scene, x, z, scale);
    trees.push({ x, z, scale });
  }

  const marker = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(radiusX, radiusZ), 64),
    new THREE.MeshBasicMaterial({ color: 0x0b5d1e, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.set(centerX, getTerrainHeight(centerX, centerZ) + 0.05, centerZ);
  scene.add(marker);

  return trees;
}

export function addForestAreas(scene) {
  return [
    ...addForestZone(scene, -8, 28, 16, 10, 35, 10),
    ...addForestZone(scene, 34, -4, 14, 18, 42, 100),
    ...addForestZone(scene, 18, 34, 12, 8, 24, 200)
  ];
}
