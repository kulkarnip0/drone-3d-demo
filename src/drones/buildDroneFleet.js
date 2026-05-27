import * as THREE from "three";
import { createDrone, attachDroneCamera } from "./createDrone.js";

const REGIONS = [
  { name: "Region 1", minX: -55, maxX: -15, minZ: -44, maxZ: 44, altitude: 19 },
  { name: "Region 2", minX: -12, maxX: 24, minZ: -44, maxZ: 44, altitude: 22 },
  { name: "Region 3", minX: 27, maxX: 56, minZ: -44, maxZ: 44, altitude: 25 }
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomPointInRegion(region) {
  return new THREE.Vector3(
    randomBetween(region.minX + 5, region.maxX - 5),
    region.altitude + randomBetween(-2, 2),
    randomBetween(region.minZ + 5, region.maxZ - 5)
  );
}

function makeDroneConfig(index, color, speed) {
  const region = REGIONS[index];
  const start = randomPointInRegion(region);

  return {
    name: `Drone ${index + 1}`,
    mesh: createDrone(color),
    speed,
    region,
    target: randomPointInRegion(region),
    dwellUntil: 0,
    previousPosition: start.clone()
  };
}

function clampToRegion(position, region) {
  position.x = Math.max(region.minX, Math.min(region.maxX, position.x));
  position.z = Math.max(region.minZ, Math.min(region.maxZ, position.z));
  position.y = Math.max(region.altitude - 3, Math.min(region.altitude + 3, position.y));
}

function chooseNewTarget(drone, elapsedTime) {
  drone.target = randomPointInRegion(drone.region);
  drone.dwellUntil = elapsedTime + randomBetween(0.8, 2.2);
}

export function buildDroneFleet(scene, paths) {
  const drones = [
    makeDroneConfig(0, 0x0066ff, 9.0),
    makeDroneConfig(1, 0xffaa00, 8.0),
    makeDroneConfig(2, 0xff3333, 7.2)
  ];

  drones.forEach((drone) => {
    drone.mesh.position.copy(drone.previousPosition);
    drone.camera = attachDroneCamera(drone.mesh);
    scene.add(drone.mesh);
  });

  return drones;
}

export function updateDroneFleet(drones, elapsedTime) {
  drones.forEach((drone) => {
    const position = drone.mesh.position;
    const distanceToTarget = position.distanceTo(drone.target);

    if (distanceToTarget < 2.0 && elapsedTime > drone.dwellUntil) {
      chooseNewTarget(drone, elapsedTime);
    }

    const direction = drone.target.clone().sub(position);
    const distance = direction.length();

    if (distance > 0.001) {
      direction.normalize();
      const step = Math.min(distance, drone.speed * 0.016);
      drone.previousPosition.copy(position);
      position.addScaledVector(direction, step);
      clampToRegion(position, drone.region);
    }

    const lookAhead = position.clone().add(direction.length() > 0 ? direction : new THREE.Vector3(1, 0, 0));
    drone.mesh.lookAt(lookAhead);
  });
}
