import * as THREE from "three";
import { WORLD_DEPTH, WORLD_WIDTH, getTerrainHeight } from "./terrainHeight.js";

function colorForHeight(height, x, z) {
  if (height < 0.2) return new THREE.Color(0xd9c28a);
  if (height < 3.0) return new THREE.Color(0x4f8a3d);
  if (height < 6.0) return new THREE.Color(0x5f7f3a);

  const rock = new THREE.Color(0x8b7d63);
  const snow = new THREE.Color(0xf2f7f7);

  // Light snow only on higher far-inland hill/ridge areas.
  // The noise term makes the snow look patchy rather than a flat white band.
  const snowNoise = Math.sin(x * 0.38) * 0.18 + Math.cos(z * 0.31) * 0.16;
  const snowAmount = THREE.MathUtils.clamp((height - 10.5) / 4.2 + snowNoise, 0, 0.72);

  return rock.lerp(snow, snowAmount);
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

    const color = colorForHeight(height, x, z);
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
