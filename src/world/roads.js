import * as THREE from "three";
import { getTerrainHeight } from "./terrainHeight.js";

function makeTerrainFollowingStrip(start, end, width, yOffset, samples) {
  const positions = [];
  const indices = [];

  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx * dx + dz * dz);

  // Unit vector perpendicular to the road direction in the x-z plane.
  const nx = -dz / length;
  const nz = dx / length;
  const halfWidth = width / 2;

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const cx = THREE.MathUtils.lerp(start.x, end.x, t);
    const cz = THREE.MathUtils.lerp(start.z, end.z, t);

    const leftX = cx + nx * halfWidth;
    const leftZ = cz + nz * halfWidth;
    const rightX = cx - nx * halfWidth;
    const rightZ = cz - nz * halfWidth;

    const leftY = getTerrainHeight(leftX, leftZ) + yOffset;
    const rightY = getTerrainHeight(rightX, rightZ) + yOffset;

    positions.push(leftX, leftY, leftZ);
    positions.push(rightX, rightY, rightZ);
  }

  for (let i = 0; i < samples; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;

    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function addRoadSegment(scene, start, end, width = 4.2) {
  const roadGeometry = makeTerrainFollowingStrip(start, end, width, 0.09, 80);
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.88,
    metalness: 0.0,
    side: THREE.DoubleSide
  });

  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.receiveShadow = true;
  scene.add(road);

  const lineGeometry = makeTerrainFollowingStrip(start, end, 0.22, 0.12, 80);
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2d45c,
    roughness: 0.8,
    side: THREE.DoubleSide
  });

  const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
  scene.add(centerLine);

  return { road, centerLine };
}

export function addRoadNetwork(scene) {
  return [
    addRoadSegment(scene, { x: -18, z: -42 }, { x: 42, z: 34 }, 4.8),
    addRoadSegment(scene, { x: -10, z: 10 }, { x: 45, z: 8 }, 4.0),
    addRoadSegment(scene, { x: 6, z: -35 }, { x: 2, z: 30 }, 3.7)
  ];
}
