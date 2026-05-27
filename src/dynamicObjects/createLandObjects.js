import * as THREE from "three";

function applyShadow(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

export function createPatrolVehicle(color = 0x2f5f7f) {
  const group = new THREE.Group();
  group.name = "Patrol Vehicle";

  const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.75 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
  const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x88c8ff, roughness: 0.35, metalness: 0.05 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.9, 1.8), bodyMaterial);
  body.position.y = 0.75;
  group.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.85, 1.45), glassMaterial);
  cabin.position.set(-0.35, 1.45, 0);
  group.add(cabin);

  for (const x of [-1.15, 1.15]) {
    for (const z of [-1.0, 1.0]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.32, 16), darkMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.35, z);
      group.add(wheel);
    }
  }

  applyShadow(group);
  return group;
}

export function createWalkingPerson(color = 0xffcc88) {
  const group = new THREE.Group();
  group.name = "Moving Person";

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2b5f9e, roughness: 0.8 });
  const headMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.75 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.1, 12), bodyMaterial);
  body.position.y = 0.95;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), headMaterial);
  head.position.y = 1.7;
  group.add(head);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.7, 8), darkMaterial);
  leftLeg.position.set(-0.12, 0.35, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.7, 8), darkMaterial);
  rightLeg.position.set(0.12, 0.35, 0);
  group.add(rightLeg);

  applyShadow(group);
  return group;
}

export function createSupplyTruck() {
  const group = new THREE.Group();
  group.name = "Supply Truck";

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x6c704a, roughness: 0.85 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });

  const rear = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.45, 2.0), bodyMaterial);
  rear.position.set(0.65, 1.1, 0);
  group.add(rear);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.15, 1.8), bodyMaterial);
  cabin.position.set(-1.55, 0.95, 0);
  group.add(cabin);

  for (const x of [-1.5, 0.2, 1.55]) {
    for (const z of [-1.12, 1.12]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.36, 16), darkMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.35, z);
      group.add(wheel);
    }
  }

  applyShadow(group);
  return group;
}

export function createBoat() {
  const group = new THREE.Group();
  group.name = "Coastal Boat";

  const hullMaterial = new THREE.MeshStandardMaterial({ color: 0xd96b3b, roughness: 0.62, metalness: 0.05 });
  const deckMaterial = new THREE.MeshStandardMaterial({ color: 0xf4e2b8, roughness: 0.75 });
  const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xe8f4ff, roughness: 0.35, metalness: 0.05 });
  const mastMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.7, 1.8), hullMaterial);
  hull.position.y = 0.35;
  group.add(hull);

  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.4, 4), hullMaterial);
  bow.rotation.z = -Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  bow.position.set(3.3, 0.35, 0);
  group.add(bow);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.18, 1.45), deckMaterial);
  deck.position.y = 0.82;
  group.add(deck);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.9, 1.15), cabinMaterial);
  cabin.position.set(-0.8, 1.35, 0);
  group.add(cabin);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 10), mastMaterial);
  mast.position.set(0.7, 1.85, 0);
  group.add(mast);

  applyShadow(group);
  return group;
}
