import * as THREE from "three";

function addGround(scene) {
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4f8a3d });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function addRoad(scene, x, z, width, length, rotation = 0) {
  const geometry = new THREE.BoxGeometry(width, 0.08, length);
  const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(geometry, material);
  road.position.set(x, 0.05, z);
  road.rotation.y = rotation;
  scene.add(road);
}

function addBuilding(scene, x, z, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0xb8b8b8 });
  const building = new THREE.Mesh(geometry, material);
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);
}

function addTree(scene, x, z) {
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

export function buildWorld(scene) {
  addGround(scene);

  addRoad(scene, 0, 0, 6, 90, Math.PI / 2);
  addRoad(scene, -10, 5, 5, 70, 0);

  addBuilding(scene, -25, -18, 8, 10, 8);
  addBuilding(scene, -10, -22, 6, 16, 6);
  addBuilding(scene, 15, -18, 10, 8, 10);
  addBuilding(scene, 28, 12, 7, 13, 7);
  addBuilding(scene, -30, 18, 9, 7, 9);

  for (let i = 0; i < 18; i += 1) {
    addTree(
      scene,
      THREE.MathUtils.randFloatSpread(80),
      THREE.MathUtils.randFloatSpread(80)
    );
  }
}
