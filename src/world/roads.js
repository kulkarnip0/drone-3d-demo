import * as THREE from "three";
import { getTerrainHeight } from "./terrainHeight.js";

function addRoadSegment(scene, start, end, width = 4.2) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  const midX = (start.x + end.x) / 2;
  const midZ = (start.z + end.z) / 2;
  const y = getTerrainHeight(midX, midZ) + 0.08;

  const geometry = new THREE.BoxGeometry(width, 0.08, length);
  const material = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.85 });
  const road = new THREE.Mesh(geometry, material);

  road.position.set(midX, y, midZ);
  road.rotation.y = angle;
  road.receiveShadow = true;
  scene.add(road);

  const lineGeometry = new THREE.BoxGeometry(0.18, 0.09, length * 0.9);
  const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xf2d45c });
  const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
  centerLine.position.set(midX, y + 0.05, midZ);
  centerLine.rotation.y = angle;
  scene.add(centerLine);
}

export function addRoadNetwork(scene) {
  addRoadSegment(scene, { x: -18, z: -42 }, { x: 42, z: 34 }, 4.8);
  addRoadSegment(scene, { x: -10, z: 10 }, { x: 45, z: 8 }, 4.0);
  addRoadSegment(scene, { x: 6, z: -35 }, { x: 2, z: 30 }, 3.7);
}
