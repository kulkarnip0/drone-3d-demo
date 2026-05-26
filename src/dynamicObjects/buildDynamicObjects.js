import * as THREE from "three";
import { getTerrainHeight } from "../world/terrainHeight.js";
import { createPatrolVehicle, createSupplyTruck, createWalkingPerson } from "./createLandObjects.js";
import { buildLandObjectPaths } from "./landObjectPaths.js";

function placeObjectOnPath(object, path, u, clearance) {
  const position = path.getPointAt(u);
  const nextPosition = path.getPointAt((u + 0.01) % 1);

  position.y = getTerrainHeight(position.x, position.z) + clearance;
  nextPosition.y = getTerrainHeight(nextPosition.x, nextPosition.z) + clearance;

  object.position.copy(position);
  object.lookAt(nextPosition);
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
      clearance: 0.12
    },
    {
      id: "supply_truck_01",
      label: "Supply Truck",
      mesh: createSupplyTruck(),
      path: paths.villagePatrolLoop,
      speed: 0.022,
      offset: 0.45,
      clearance: 0.12
    },
    {
      id: "person_01",
      label: "Moving Person",
      mesh: createWalkingPerson(),
      path: paths.footPatrolLoop,
      speed: 0.055,
      offset: 0.1,
      clearance: 0.03
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
    placeObjectOnPath(object.mesh, object.path, u, object.clearance);

    if (object.label === "Moving Person") {
      const bob = Math.sin(elapsedTime * 8) * 0.08;
      object.mesh.position.y += bob;
    }
  });
}
