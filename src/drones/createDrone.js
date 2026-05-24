import * as THREE from "three";

export function createDrone(color) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.5, 1.2),
    new THREE.MeshStandardMaterial({ color })
  );
  group.add(body);

  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const arm1 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 0.15), armMaterial);
  const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 4), armMaterial);
  group.add(arm1);
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

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.8, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0, -0.9);
  group.add(nose);

  return group;
}

export function attachDroneCamera(droneMesh) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  // Camera is mounted below and slightly in front of the drone body.
  camera.position.set(0, -0.35, -1.2);

  // Look forward and slightly downward from the drone.
  camera.rotation.x = -0.35;

  droneMesh.add(camera);
  return camera;
}
