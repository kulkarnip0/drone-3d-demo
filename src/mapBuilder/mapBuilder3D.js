import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const WORLD = {
  minX: -60,
  maxX: 60,
  minZ: -50,
  maxZ: 50,
  coastX: -32,
  beachEndX: -22
};

const observedCells = new Map();
const assetMarkers = new Map();
const droneMarkers = new Map();
let scene;
let camera;
let renderer;
let controls;
let observedGroup;
let assetGroup;
let droneGroup;

function terrainColor(x) {
  if (x < WORLD.coastX) return 0x1e78b9;
  if (x < WORLD.beachEndX) return 0xd1bb7a;
  return 0x3f8f48;
}

function addCell(x, z) {
  const key = `${x},${z}`;
  if (observedCells.has(key)) return;

  const geometry = new THREE.BoxGeometry(3.8, 0.18, 3.8);
  const material = new THREE.MeshStandardMaterial({
    color: terrainColor(x),
    roughness: 0.9,
    transparent: true,
    opacity: 0.9
  });
  const cell = new THREE.Mesh(geometry, material);
  cell.position.set(x, 0, z);
  cell.receiveShadow = true;
  observedGroup.add(cell);
  observedCells.set(key, cell);
}

function revealAroundDrone(drone) {
  const radius = 14;
  const step = 4;

  for (let x = drone.x - radius; x <= drone.x + radius; x += step) {
    for (let z = drone.z - radius; z <= drone.z + radius; z += step) {
      const dx = x - drone.x;
      const dz = z - drone.z;
      if (Math.sqrt(dx * dx + dz * dz) <= radius) {
        addCell(Math.round(x / step) * step, Math.round(z / step) * step);
      }
    }
  }
}

function makeMarker(color, height = 2.4) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.25, 18),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  base.position.y = 0.25;
  group.add(base);

  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, height, 10),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
  );
  mast.position.y = height / 2 + 0.25;
  group.add(mast);

  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 18, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, emissive: color, emissiveIntensity: 0.25 })
  );
  top.position.y = height + 0.45;
  group.add(top);

  return group;
}

function updateDroneMarkers(drones) {
  drones.forEach((drone) => {
    if (!droneMarkers.has(drone.id)) {
      const marker = makeMarker(0xffffff, 1.8);
      droneGroup.add(marker);
      droneMarkers.set(drone.id, marker);
    }
    const marker = droneMarkers.get(drone.id);
    marker.position.set(drone.x, 1.2, drone.z);
  });
}

function updateAssetMarkers(assets) {
  assets
    .filter((asset) => asset.status === "DETECTED")
    .forEach((asset) => {
      if (!assetMarkers.has(asset.id)) {
        const isRed = asset.side && asset.side.includes("RED");
        const marker = makeMarker(isRed ? 0xff3030 : 0x2478ff, 2.8);
        assetGroup.add(marker);
        assetMarkers.set(asset.id, marker);
      }
      const marker = assetMarkers.get(asset.id);
      marker.position.set(asset.x, 0.5, asset.z);
    });
}

function updateStats(state) {
  document.getElementById("observed-count").textContent = observedCells.size;
  document.getElementById("detected-count").textContent = state.mission.detectedAssets || 0;
  document.getElementById("threat-level").textContent = state.mission.threatLevel;
  document.getElementById("last-update").textContent = state.timestamp;
}

function setupScene() {
  const root = document.getElementById("builder-root");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07111f);

  camera = new THREE.PerspectiveCamera(60, root.clientWidth / root.clientHeight, 0.1, 600);
  camera.position.set(35, 65, 75);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(root.clientWidth, root.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  root.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;

  const ambient = new THREE.HemisphereLight(0xffffff, 0x223344, 1.6);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 2.0);
  sun.position.set(30, 80, 40);
  sun.castShadow = true;
  scene.add(sun);

  const grid = new THREE.GridHelper(120, 24, 0x406080, 0x203040);
  scene.add(grid);

  observedGroup = new THREE.Group();
  assetGroup = new THREE.Group();
  droneGroup = new THREE.Group();
  scene.add(observedGroup, assetGroup, droneGroup);

  window.addEventListener("resize", () => {
    camera.aspect = root.clientWidth / root.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(root.clientWidth, root.clientHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

export function startMapBuilder3D() {
  setupScene();
  animate();

  const channel = new BroadcastChannel("uav-mission-state");
  const status = document.getElementById("connection-status");
  let lastMessageTime = 0;

  channel.onmessage = (event) => {
    const state = event.data;
    if (!state || state.type !== "SIMULATION_STATE") return;

    lastMessageTime = Date.now();
    status.textContent = "LIVE BUILD";
    status.className = "status-pill live";

    (state.drones || []).forEach(revealAroundDrone);
    updateDroneMarkers(state.drones || []);
    updateAssetMarkers(state.placedAssets || []);
    updateStats(state);
  };

  setInterval(() => {
    if (Date.now() - lastMessageTime > 1600) {
      status.textContent = "WAITING FOR SIM";
      status.className = "status-pill waiting";
    }
  }, 1000);
}
