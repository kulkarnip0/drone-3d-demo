import * as THREE from "three";
import { getTerrainHeight } from "./terrainHeight.js";

export function addMissionZone(scene, x, z, radius, color) {
  const y = getTerrainHeight(x, z) + 0.16;

  const zoneGeometry = new THREE.CircleGeometry(radius, 64);
  const zoneMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
  zone.rotation.x = -Math.PI / 2;
  zone.position.set(x, y, z);
  scene.add(zone);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.08, 8, 80),
    new THREE.MeshBasicMaterial({ color })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(x, y + 0.05, z);
  scene.add(ring);
}

export function buildMissionZones(scene) {
  addMissionZone(scene, -26, 16, 9, 0x00ffff);
  addMissionZone(scene, 24, 26, 10, 0xffcc00);
  addMissionZone(scene, 8, -30, 8, 0xff4444);
}
