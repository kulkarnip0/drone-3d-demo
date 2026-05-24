import * as THREE from "three";

function makePath(scene, points, color) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(150));
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  return curve;
}

export function buildDronePaths(scene) {
  return [
    makePath(scene, [
      new THREE.Vector3(-40, 12, -35),
      new THREE.Vector3(-20, 16, 5),
      new THREE.Vector3(-25, 14, 25),
      new THREE.Vector3(5, 18, 35)
    ], 0x0000ff),

    makePath(scene, [
      new THREE.Vector3(35, 14, -35),
      new THREE.Vector3(15, 19, -10),
      new THREE.Vector3(20, 16, 25),
      new THREE.Vector3(-5, 20, 35)
    ], 0xffaa00),

    makePath(scene, [
      new THREE.Vector3(-35, 18, 5),
      new THREE.Vector3(-5, 22, -20),
      new THREE.Vector3(30, 18, -5),
      new THREE.Vector3(35, 20, 30)
    ], 0xff0000)
  ];
}
