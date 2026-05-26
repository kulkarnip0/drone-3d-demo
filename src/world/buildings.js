import * as THREE from "three";
import { getTerrainHeight } from "./terrainHeight.js";

function createWindow(x, y, z, side) {
  const windowMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.7, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x99d9ff, emissive: 0x102030 })
  );

  if (side === "front") {
    windowMesh.position.set(x, y, z);
  } else {
    windowMesh.rotation.y = Math.PI / 2;
    windowMesh.position.set(x, y, z);
  }

  return windowMesh;
}

function addBuilding(scene, x, z, width, height, depth, color = 0xb8b8b8) {
  const baseY = getTerrainHeight(x, z);
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color, roughness: 0.75 })
  );
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(width, depth) * 0.72, 2.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x8f3d25, roughness: 0.85 })
  );
  roof.position.y = height + 1.1;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.22, 1.7, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x4a2d18 })
  );
  door.position.set(0, 0.85, depth / 2 + 0.05);
  group.add(door);

  for (let floor = 0; floor < Math.max(1, Math.floor(height / 4)); floor += 1) {
    const y = 2.4 + floor * 3.2;
    if (y < height - 0.8) {
      group.add(createWindow(-width / 2 - 0.05, y, -depth * 0.18, "side"));
      group.add(createWindow(-width / 2 - 0.05, y, depth * 0.24, "side"));
      group.add(createWindow(-width * 0.25, y, depth / 2 + 0.05, "front"));
      group.add(createWindow(width * 0.25, y, depth / 2 + 0.05, "front"));
    }
  }

  group.position.set(x, baseY, z);
  scene.add(group);
  return group;
}

export function addBuildings(scene) {
  const buildings = [
    [-10, -24, 7, 9, 7, 0xb8b8b8],
    [4, -28, 6, 13, 6, 0xc8b28a],
    [18, -18, 9, 8, 8, 0xb7c1c7],
    [30, 9, 8, 12, 8, 0xc9b59b],
    [-5, 18, 6, 7, 6, 0xbfc9b8],
    [20, 24, 7, 10, 7, 0xb8b0a8]
  ];

  return buildings.map((building) => addBuilding(scene, ...building));
}
