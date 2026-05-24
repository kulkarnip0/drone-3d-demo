import * as THREE from "three";

export function addLights(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
  sunLight.position.set(40, 60, 30);
  sunLight.castShadow = true;
  scene.add(sunLight);
}
