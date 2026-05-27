import * as THREE from "three";
import { getTerrainHeight } from "../world/terrainHeight.js";
import { createBoat, createPatrolVehicle, createSupplyTruck, createWalkingPerson } from "./createLandObjects.js";
import { buildLandObjectPaths } from "./landObjectPaths.js";

function placeObjectOnPath(object, path, u, clearance) {
  const position = path.getPointAt(u);
  const nextPosition = path.getPointAt((u + 0.01) % 1);

  position.y = getTerrainHeight(position.x, position.z) + clearance;
  nextPosition.y = getTerrainHeight(nextPosition.x, nextPosition.z) + clearance;

  object.position.copy(position);
  object.lookAt(nextPosition);
}

function createSeaPath() {
  return new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-52, 0.12, -38),
      new THREE.Vector3(-44, 0.12, -18),
      new THREE.Vector3(-51, 0.12, 6),
      new THREE.Vector3(-39, 0.12, 30),
      new THREE.Vector3(-55, 0.12, 42),
      new THREE.Vector3(-58, 0.12, 0)
    ],
    true,
    "catmullrom",
    0.5
  );
}

function placeBoatOnSea(object, path, u, elapsedTime) {
  const position = path.getPointAt(u);
  const nextPosition = path.getPointAt((u + 0.01) % 1);
  const bob = Math.sin(elapsedTime * 1.7 + u * Math.PI * 2) * 0.12;

  object.position.set(position.x, 0.18 + bob, position.z);
  object.lookAt(nextPosition.x, object.position.y, nextPosition.z);
}

export function buildDynamicObjects(scene) {
  const paths = buildLandObjectPaths();

  const dynamicObjects = [
    {
      id: "patrol_vehicle_01",
      label: "Patrol Vehicle",
      mesh: createPatrolVehicle(0x2f5f7f),
      path: paths.coastalRoadLoop,
      speed: 0.035,
      offset: 0.05,
      clearance: 0.12,
      surface: "land"
    },
    {
      id: "supply_truck_01",
      label: "Supply Truck",
      mesh: createSupplyTruck(),
      path: paths.villagePatrolLoop,
      speed: 0.022,
      offset: 0.45,
      clearance: 0.12,
      surface: "land"
    },
    {
      id: "person_01",
      label: "Moving Person",
      mesh: createWalkingPerson(),
      path: paths.footPatrolLoop,
      speed: 0.055,
      offset: 0.1,
      clearance: 0.03,
      surface: "land"
    },
    {
      id: "boat_01",
      label: "Coastal Boat",
      mesh: createBoat(),
      path: createSeaPath(),
      speed: 0.018,
      offset: 0.2,
      clearance: 0,
      surface: "sea"
    }
  ];

  dynamicObjects.forEach((object) => {
    scene.add(object.mesh);
  });

  return dynamicObjects;
}

export function updateDynamicObjects(dynamicObjects, elapsedTime) {
  dynamicObjects.forEach((object) => {
    const u = (elapsedTime * object.speed + object.offset) % 1;

    if (object.surface === "sea") {
      placeBoatOnSea(object.mesh, object.path, u, elapsedTime);
      return;
    }

    placeObjectOnPath(object.mesh, object.path, u, object.clearance);

    if (object.label === "Moving Person") {
      const bob = Math.sin(elapsedTime * 8) * 0.08;
      object.mesh.position.y += bob;
    }
  });
}
