import * as THREE from "three";
import { createViewer, handleResize } from "./src/core/createViewer.js";
import { setupCameraSwitching } from "./src/core/cameraControls.js";
import { addLights } from "./src/world/lights.js";
import { buildWorld } from "./src/world/buildWorld.js";
import { updateSea } from "./src/world/sea.js";
import { buildMissionZones } from "./src/world/missionZones.js";
import { buildDronePaths } from "./src/drones/dronePaths.js";
import { buildDroneFleet, updateDroneFleet } from "./src/drones/buildDroneFleet.js";
import { setupAssetPlacement } from "./src/placeables/assetPlacement.js";
import { buildDynamicObjects, updateDynamicObjects } from "./src/dynamicObjects/buildDynamicObjects.js";
import { trackPlacedAssetsInDroneView } from "./src/sensors/fovAssetTracker.js";
import { createSimulationStatePublisher } from "./src/state/simulationStatePublisher.js";

const viewer = createViewer();
const clock = new THREE.Clock();

addLights(viewer.scene);
const world = buildWorld(viewer.scene);
buildMissionZones(viewer.scene);
const assetPlacement = setupAssetPlacement(viewer, world);
const dynamicObjects = buildDynamicObjects(viewer.scene);
const detectionState = { detections: [], eventLog: [] };

const paths = buildDronePaths(viewer.scene);
const drones = buildDroneFleet(viewer.scene, paths);
const statePublisher = createSimulationStatePublisher({
  viewer,
  drones,
  dynamicObjects,
  assetPlacement,
  detectionState
});

setupCameraSwitching(
  viewer,
  drones,
  document.querySelector("#info h1"),
  document.querySelector("#info p")
);

handleResize(viewer);

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  updateSea(world.sea, elapsedTime);
  updateDroneFleet(drones, elapsedTime);
  updateDynamicObjects(dynamicObjects, elapsedTime);
  detectionState.detections = trackPlacedAssetsInDroneView(
    drones,
    assetPlacement.placedAssets,
    detectionState.eventLog,
    elapsedTime
  );
  statePublisher.publish(elapsedTime);

  viewer.renderer.render(viewer.scene, viewer.activeCamera);
}

animate();
