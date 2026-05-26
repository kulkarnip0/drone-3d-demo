import * as THREE from "three";

export function addSea(scene) {
  const geometry = new THREE.PlaneGeometry(90, 120, 60, 80);
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const wave = Math.sin(y * 0.18) * 0.08 + Math.cos((x + y) * 0.12) * 0.05;
    positions.setZ(i, wave);
  }

  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x1d7fbf,
    transparent: true,
    opacity: 0.78,
    roughness: 0.28,
    metalness: 0.12
  });

  const sea = new THREE.Mesh(geometry, material);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(-72, -0.18, 0);
  sea.receiveShadow = true;
  scene.add(sea);

  return sea;
}
