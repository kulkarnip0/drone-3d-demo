import * as THREE from "three";

function applyShadow(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function makeLabel(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  context.fillStyle = "rgba(0, 0, 0, 0.65)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.font = "22px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(7.5, 1.9, 1);
  sprite.position.set(0, 6.8, 0);

  return sprite;
}

export function createLauncherVehicle() {
  const group = new THREE.Group();
  group.name = "Launcher Vehicle";

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3f4a32, roughness: 0.85 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x1f241b, roughness: 0.9 });
  const launcherMaterial = new THREE.MeshStandardMaterial({ color: 0x555f4a, roughness: 0.8 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.2, 3), bodyMaterial);
  base.position.y = 0.9;
  group.add(base);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.4, 2.6), bodyMaterial);
  cabin.position.set(-1.9, 2.1, 0);
  group.add(cabin);

  const rack = new THREE.Group();
  rack.position.set(1.2, 2.3, 0);
  rack.rotation.z = -0.35;

  for (let i = 0; i < 4; i += 1) {
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 3.6, 16),
      launcherMaterial
    );
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0, 0.32 * (i - 1.5), 0.55);
    rack.add(tube);
  }

  const support = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), darkMaterial);
  support.position.set(0.4, -0.75, 0);
  rack.add(support);
  group.add(rack);

  for (let i = 0; i < 3; i += 1) {
    for (const side of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.5, 20), darkMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(-2 + i * 2, 0.45, side * 1.65);
      group.add(wheel);
    }
  }

  group.add(makeLabel("Launcher"));
  applyShadow(group);
  return group;
}

export function createRadarUnit() {
  const group = new THREE.Group();
  group.name = "Radar Unit";

  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.8 });
  const dishMaterial = new THREE.MeshStandardMaterial({ color: 0x8aa0ad, roughness: 0.6, metalness: 0.15 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 2.6), baseMaterial);
  base.position.y = 0.4;
  group.add(base);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 3.5, 12), baseMaterial);
  mast.position.y = 2.45;
  group.add(mast);

  const dish = new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 12, 0, Math.PI), dishMaterial);
  dish.scale.set(1, 0.35, 1);
  dish.rotation.x = Math.PI / 2;
  dish.position.set(0, 4.2, 0);
  group.add(dish);

  group.add(makeLabel("Radar"));
  applyShadow(group);
  return group;
}

export function createCommandPost() {
  const group = new THREE.Group();
  group.name = "Command Post";

  const tentMaterial = new THREE.MeshStandardMaterial({ color: 0x6f7350, roughness: 0.9 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2f24, roughness: 0.9 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 3.8), tentMaterial);
  base.position.y = 1.1;
  group.add(base);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 4), tentMaterial);
  roof.position.y = 3.1;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5, 8), darkMaterial);
  antenna.position.set(2.1, 4.2, 1.4);
  group.add(antenna);

  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.08), darkMaterial);
  door.position.set(0, 0.8, 1.94);
  group.add(door);

  group.add(makeLabel("Command"));
  applyShadow(group);
  return group;
}

export function createSangarPost() {
  const group = new THREE.Group();
  group.name = "Sangar Guard Post";

  const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x8b806f, roughness: 0.95 });
  const sandbagMaterial = new THREE.MeshStandardMaterial({ color: 0xb39b73, roughness: 0.92 });
  const shadowMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3328, roughness: 0.95 });

  const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.18, 24), shadowMaterial);
  floor.position.y = 0.09;
  group.add(floor);

  const wallRadius = 2.55;
  const sandbagCount = 18;

  for (let layer = 0; layer < 3; layer += 1) {
    for (let i = 0; i < sandbagCount; i += 1) {
      const gapStart = i > 1 && i < 5;
      if (gapStart && layer < 2) continue;

      const angle = (i / sandbagCount) * Math.PI * 2;
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.32, 0.42),
        sandbagMaterial
      );
      bag.position.set(
        Math.cos(angle) * wallRadius,
        0.38 + layer * 0.34,
        Math.sin(angle) * wallRadius
      );
      bag.rotation.y = -angle;
      group.add(bag);
    }
  }

  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2 + 0.15;
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.28 + (i % 3) * 0.05),
      stoneMaterial
    );
    stone.position.set(
      Math.cos(angle) * 1.9,
      0.25,
      Math.sin(angle) * 1.9
    );
    stone.rotation.set(i * 0.2, i * 0.4, i * 0.1);
    group.add(stone);
  }

  const lookout = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.5), shadowMaterial);
  lookout.position.set(0, 1.45, 2.55);
  group.add(lookout);

  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8), shadowMaterial);
  flagPole.position.set(-1.9, 2.0, -1.7);
  group.add(flagPole);

  group.add(makeLabel("Sangar"));
  applyShadow(group);
  return group;
}

export function createAssetByType(type) {
  if (type === "launcher") return createLauncherVehicle();
  if (type === "radar") return createRadarUnit();
  if (type === "command") return createCommandPost();
  if (type === "sangar") return createSangarPost();
  return createCommandPost();
}
