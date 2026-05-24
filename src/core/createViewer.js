import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createViewer() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  const freeCamera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  freeCamera.position.set(45, 35, 55);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(freeCamera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  return {
    scene,
    freeCamera,
    activeCamera: freeCamera,
    renderer,
    controls
  };
}

export function handleResize(viewer) {
  window.addEventListener("resize", () => {
    viewer.freeCamera.aspect = window.innerWidth / window.innerHeight;
    viewer.freeCamera.updateProjectionMatrix();

    viewer.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
