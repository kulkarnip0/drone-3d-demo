import * as THREE from "three";

function computeWaveHeight(x, y, time) {
  const offshoreStrength = THREE.MathUtils.clamp((-x + 20) / 80, 0.35, 1.0);

  const longWave = Math.sin(y * 0.13 + time * 1.15) * 0.28;
  const crossWave = Math.cos((x + y) * 0.11 + time * 0.85) * 0.18;
  const ripple = Math.sin((x * 0.42 - y * 0.22) + time * 2.6) * 0.06;

  return (longWave + crossWave + ripple) * offshoreStrength;
}

export function addSea(scene) {
  const geometry = new THREE.PlaneGeometry(90, 120, 90, 120);
  const positions = geometry.attributes.position;
  const basePositions = [];

  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = computeWaveHeight(x, y, 0);

    positions.setZ(i, z);
    basePositions.push({ x, y });
  }

  geometry.userData.basePositions = basePositions;
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x1d7fbf,
    transparent: true,
    opacity: 0.78,
    roughness: 0.2,
    metalness: 0.18
  });

  const sea = new THREE.Mesh(geometry, material);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(-72, -0.18, 0);
  sea.receiveShadow = true;
  scene.add(sea);

  return sea;
}

export function updateSea(sea, elapsedTime) {
  if (!sea) return;

  const positions = sea.geometry.attributes.position;
  const basePositions = sea.geometry.userData.basePositions;

  for (let i = 0; i < positions.count; i += 1) {
    const { x, y } = basePositions[i];
    positions.setZ(i, computeWaveHeight(x, y, elapsedTime));
  }

  positions.needsUpdate = true;
  sea.geometry.computeVertexNormals();
}
