import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getTerrainHeight } from "../world/terrainHeight.js";

const WORLD = {
  minX: -60,
  maxX: 60,
  minZ: -50,
  maxZ: 50,
  coastX: -32,
  beachEndX: -22
};

const CELL_SIZE = 4;
const OBSERVE_RADIUS = 16;

const BUILDING_BLUEPRINTS = [
  { id: "BLDG-1", x: -10, z: -24, width: 7, height: 9, depth: 7, color: 0xb8b8b8 },
  { id: "BLDG-2", x: 4, z: -28, width: 6, height: 13, depth: 6, color: 0xc8b28a },
  { id: "BLDG-3", x: 18, z: -18, width: 9, height: 8, depth: 8, color: 0xb7c1c7 },
  { id: "BLDG-4", x: 30, z: 9, width: 8, height: 12, depth: 8, color: 0xc9b59b },
  { id: "BLDG-5", x: -5, z: 18, width: 6, height: 7, depth: 6, color: 0xbfc9b8 },
  { id: "BLDG-6", x: 20, z: 24, width: 7, height: 10, depth: 7, color: 0xb8b0a8 }
];

const observedCells = new Map();
const reconstructedBuildings = new Map();
const assetMarkers = new Map();
const droneMarkers = new Map();
const selectableObjects = [];

let scene;
let camera;
let renderer;
let controls;
let observedGroup;
let buildingGroup;
let assetGroup;
let droneGroup;
let raycaster;
let pointer;
let selectedBox;

function terrainColor(x, z, height) {
  if (x < WORLD.coastX) return 0x1e78b9;
  if (x < WORLD.beachEndX) return 0xd1bb7a;
  if (height > 10.5) return 0xe8f1f1;
  if (height > 6) return 0x8b7d63;
  if (height > 3) return 0x5f7f3a;
  return 0x3f8f48;
}

function addObservedTerrainPatch(x, z) {
  const key = `${x},${z}`;
  if (observedCells.has(key)) return;

  const h1 = getTerrainHeight(x - CELL_SIZE / 2, z - CELL_SIZE / 2);
  const h2 = getTerrainHeight(x + CELL_SIZE / 2, z - CELL_SIZE / 2);
  const h3 = getTerrainHeight(x + CELL_SIZE / 2, z + CELL_SIZE / 2);
  const h4 = getTerrainHeight(x - CELL_SIZE / 2, z + CELL_SIZE / 2);
  const avgHeight = (h1 + h2 + h3 + h4) / 4;

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -CELL_SIZE / 2, h1, -CELL_SIZE / 2,
    CELL_SIZE / 2, h2, -CELL_SIZE / 2,
    CELL_SIZE / 2, h3, CELL_SIZE / 2,
    -CELL_SIZE / 2, h4, CELL_SIZE / 2
  ]);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();

  const patch = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: terrainColor(x, z, avgHeight),
      roughness: 0.9,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    })
  );
  patch.position.set(x, 0, z);
  patch.receiveShadow = true;
  patch.userData.info = {
    kind: "Terrain Patch",
    name: key,
    width: CELL_SIZE,
    depth: CELL_SIZE,
    height: Number(avgHeight.toFixed(1)),
    x,
    z
  };

  observedGroup.add(patch);
  selectableObjects.push(patch);
  observedCells.set(key, patch);
}

function createBuildingModel(blueprint) {
  const group = new THREE.Group();
  const baseY = getTerrainHeight(blueprint.x, blueprint.z);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(blueprint.width, blueprint.height, blueprint.depth),
    new THREE.MeshStandardMaterial({ color: blueprint.color, roughness: 0.75 })
  );
  body.position.y = blueprint.height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData.parentSelectable = group;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(blueprint.width, blueprint.depth) * 0.72, 2.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x8f3d25, roughness: 0.85 })
  );
  roof.position.y = blueprint.height + 1.1;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  roof.userData.parentSelectable = group;
  group.add(roof);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(blueprint.width * 0.22, 1.7, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x4a2d18 })
  );
  door.position.set(0, 0.85, blueprint.depth / 2 + 0.05);
  door.userData.parentSelectable = group;
  group.add(door);

  group.position.set(blueprint.x, baseY, blueprint.z);
  group.name = blueprint.id;
  group.userData.info = {
    kind: "Reconstructed Building",
    name: blueprint.id,
    width: blueprint.width,
    depth: blueprint.depth,
    height: blueprint.height + 2.2,
    x: blueprint.x,
    z: blueprint.z
  };

  buildingGroup.add(group);
  selectableObjects.push(group);
  return group;
}

function revealBuildingsNearDrone(drone) {
  BUILDING_BLUEPRINTS.forEach((building) => {
    if (reconstructedBuildings.has(building.id)) return;

    const dx = building.x - drone.x;
    const dz = building.z - drone.z;
    if (Math.sqrt(dx * dx + dz * dz) < OBSERVE_RADIUS + 8) {
      reconstructedBuildings.set(building.id, createBuildingModel(building));
    }
  });
}

function revealAroundDrone(drone) {
  for (let x = drone.x - OBSERVE_RADIUS; x <= drone.x + OBSERVE_RADIUS; x += CELL_SIZE) {
    for (let z = drone.z - OBSERVE_RADIUS; z <= drone.z + OBSERVE_RADIUS; z += CELL_SIZE) {
      const dx = x - drone.x;
      const dz = z - drone.z;
      if (Math.sqrt(dx * dx + dz * dz) <= OBSERVE_RADIUS) {
        addObservedTerrainPatch(Math.round(x / CELL_SIZE) * CELL_SIZE, Math.round(z / CELL_SIZE) * CELL_SIZE);
      }
    }
  }
  revealBuildingsNearDrone(drone);
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
    marker.position.set(drone.x, drone.y || 14, drone.z);
  });
}

function makeAssetModel(asset) {
  const redSide = asset.side && asset.side.includes("RED");
  const color = redSide ? 0xff3030 : 0x2478ff;
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.2, 2.2),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, emissive: color, emissiveIntensity: 0.12 })
  );
  base.position.y = 0.7;
  group.add(base);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  antenna.position.y = 2.7;
  group.add(antenna);

  group.userData.info = {
    kind: asset.side || "Detected Asset",
    name: asset.label || asset.id,
    width: 3.6,
    depth: 2.2,
    height: 3.2,
    x: asset.x,
    z: asset.z
  };
  selectableObjects.push(group);
  return group;
}

function updateAssetMarkers(assets) {
  assets
    .filter((asset) => asset.status === "DETECTED")
    .forEach((asset) => {
      if (!assetMarkers.has(asset.id)) {
        const marker = makeAssetModel(asset);
        assetGroup.add(marker);
        assetMarkers.set(asset.id, marker);
      }
      const marker = assetMarkers.get(asset.id);
      marker.position.set(asset.x, getTerrainHeight(asset.x, asset.z), asset.z);
    });
}

function updateStats(state) {
  document.getElementById("observed-count").textContent = observedCells.size;
  document.getElementById("detected-count").textContent = state.mission.detectedAssets || 0;
  document.getElementById("threat-level").textContent = state.mission.threatLevel;
  document.getElementById("last-update").textContent = state.timestamp;
}

function showMeasurement(info) {
  const panel = document.getElementById("measurement-panel");
  if (!panel || !info) return;

  panel.innerHTML = `
    <strong>${info.name}</strong><br />
    Type: ${info.kind}<br />
    Width: ${info.width} m<br />
    Depth: ${info.depth} m<br />
    Height: ${info.height} m<br />
    Position: X ${Number(info.x).toFixed(1)}, Z ${Number(info.z).toFixed(1)}
  `;
}

function selectObject(object) {
  const selected = object.userData.parentSelectable || object;
  const info = selected.userData.info || object.userData.info;
  showMeasurement(info);

  if (selectedBox) scene.remove(selectedBox);
  selectedBox = new THREE.BoxHelper(selected, 0xffff00);
  scene.add(selectedBox);
}

function setupPicking(root) {
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  renderer.domElement.addEventListener("click", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(selectableObjects, true);
    if (hits.length > 0) selectObject(hits[0].object);
  });
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
  controls.target.set(0, 3, 0);
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
  buildingGroup = new THREE.Group();
  assetGroup = new THREE.Group();
  droneGroup = new THREE.Group();
  scene.add(observedGroup, buildingGroup, assetGroup, droneGroup);

  setupPicking(root);

  window.addEventListener("resize", () => {
    camera.aspect = root.clientWidth / root.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(root.clientWidth, root.clientHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (selectedBox) selectedBox.update();
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
