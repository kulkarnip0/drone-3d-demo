import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(45, 35, 55);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(40, 60, 30);
sunLight.castShadow = true;
scene.add(sunLight);

function addGround() {
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4f8a3d });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function addRoad(x, z, width, length, rotation = 0) {
  const geometry = new THREE.BoxGeometry(width, 0.08, length);
  const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(geometry, material);
  road.position.set(x, 0.05, z);
  road.rotation.y = rotation;
  scene.add(road);
}

function addBuilding(x, z, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0xb8b8b8 });
  const building = new THREE.Mesh(geometry, material);
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);
}

function addTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 3),
    new THREE.MeshStandardMaterial({ color: 0x7b4f28 })
  );
  trunk.position.set(x, 1.5, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(2, 5, 12),
    new THREE.MeshStandardMaterial({ color: 0x1f6b2a })
  );
  crown.position.set(x, 5, z);
  crown.castShadow = true;
  scene.add(crown);
}

function addMissionZone(x, z, radius, color) {
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

function createDrone(color) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.5, 1.2),
    new THREE.MeshStandardMaterial({ color })
  );
  group.add(body);

  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

  const arm1 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 0.15), armMaterial);
  group.add(arm1);

  const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 4), armMaterial);
  group.add(arm2);

  const rotorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const rotorPositions = [
    [2, 0, 2],
    [-2, 0, 2],
    [2, 0, -2],
    [-2, 0, -2]
  ];

  rotorPositions.forEach(([x, y, z]) => {
    const rotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.08, 24),
      rotorMaterial
    );
    rotor.position.set(x, y, z);
    rotor.rotation.x = Math.PI / 2;
    group.add(rotor);
  });

  return group;
}

function makePath(points, color) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(150));
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  return curve;
}

addGround();
addRoad(0, 0, 6, 90, Math.PI / 2);
addRoad(-10, 5, 5, 70, 0);

addBuilding(-25, -18, 8, 10, 8);
addBuilding(-10, -22, 6, 16, 6);
addBuilding(15, -18, 10, 8, 10);
addBuilding(28, 12, 7, 13, 7);
addBuilding(-30, 18, 9, 7, 9);

for (let i = 0; i < 18; i += 1) {
  addTree(
    THREE.MathUtils.randFloatSpread(80),
    THREE.MathUtils.randFloatSpread(80)
  );
}

addMissionZone(-25, 22, 8, 0x00ffff);
addMissionZone(22, 22, 10, 0xffcc00);
addMissionZone(0, -28, 9, 0xff4444);

const paths = [
  makePath([
    new THREE.Vector3(-40, 12, -35),
    new THREE.Vector3(-20, 16, 5),
    new THREE.Vector3(-25, 14, 25),
    new THREE.Vector3(5, 18, 35)
  ], 0x0000ff),

  makePath([
    new THREE.Vector3(35, 14, -35),
    new THREE.Vector3(15, 19, -10),
    new THREE.Vector3(20, 16, 25),
    new THREE.Vector3(-5, 20, 35)
  ], 0xffaa00),

  makePath([
    new THREE.Vector3(-35, 18, 5),
    new THREE.Vector3(-5, 22, -20),
    new THREE.Vector3(30, 18, -5),
    new THREE.Vector3(35, 20, 30)
  ], 0xff0000)
];

const drones = [
  { mesh: createDrone(0x0066ff), path: paths[0], speed: 0.05, offset: 0 },
  { mesh: createDrone(0xffaa00), path: paths[1], speed: 0.04, offset: 0.25 },
  { mesh: createDrone(0xff3333), path: paths[2], speed: 0.035, offset: 0.5 }
];

drones.forEach((drone) => scene.add(drone.mesh));

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  drones.forEach((drone) => {
    const u = (elapsedTime * drone.speed + drone.offset) % 1;
    const position = drone.path.getPointAt(u);
    const nextPosition = drone.path.getPointAt((u + 0.01) % 1);

    drone.mesh.position.copy(position);
    drone.mesh.lookAt(nextPosition);
  });

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
