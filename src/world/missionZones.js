import * as THREE from "three";

export function addMissionZone(scene, x, z, radius, color) {
  const zoneGeometry = new THREE.CircleGeometry(radius, 64);
  const zoneMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  });

  const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
  zone.rotation.x = -Math.PI / 2;
  zone.position.set(x, 0.12, z);
  scene.add(zone);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.08, 8, 80),
    new THREE.MeshBasicMaterial({ color })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(x, 0.18, z);
  scene.add(ring);
}

export function buildMissionZones(scene) {
  addMissionZone(scene, -25, 22, 8, 0x00ffff);
  addMissionZone(scene, 22, 22, 10, 0xffcc00);
  addMissionZone(scene, 0, -28, 9, 0xff4444);
}
