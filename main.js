import * as THREE from "three";
import { createViewer, handleResize } from "./src/core/createViewer.js";
import { setupCameraSwitching } from "./src/core/cameraControls.js";
import { addLights } from "./src/world/lights.js";
import { buildWorld } from "./src/world/buildWorld.js";
import { updateSea } from "./src/world/sea.js";
import { buildMissionZones } from "./src/world/missionZones.js";
import { buildDroneFleet, updateDroneFleet } from "./src/drones/buildDroneFleet.js";
import { setupAssetPlacement } from "./src/placeables/assetPlacement.js";
import { buildDynamicObjects, updateDynamicObjects } from "./src/dynamicObjects/buildDynamicObjects.js";
import { trackPlacedAssetsInDroneView } from "./src/sensors/fovAssetTracker.js";
import { createSimulationStatePublisher } from "./src/state/simulationStatePublisher.js";
import { setupSimulationCommandReceiver } from "./src/state/simulationCommandReceiver.js";

const viewer = createViewer();
const clock = new THREE.Clock();
const resetChannel = new BroadcastChannel("uav-reset-command");

function resetAllMissionViews() {
  resetChannel.postMessage({ type: "RESET_ALL", source: "simulation", at: Date.now() });
  window.location.reload();
}

window.resetAllMissionViews = resetAllMissionViews;

resetChannel.onmessage = (event) => {
  const message = event.data;
  if (!message || message.type !== "RESET_ALL") return;
  window.location.reload();
};

window.addEventListener("keydown", (event) => {
  const tagName = document.activeElement?.tagName?.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || document.activeElement?.isContentEditable) return;

  if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    resetAllMissionViews();
  }
});

addLights(viewer.scene);
const world = buildWorld(viewer.scene);
buildMissionZones(viewer.scene);
const assetPlacement = setupAssetPlacement(viewer, world);
const dynamicObjects = buildDynamicObjects(viewer.scene);
const detectionState = { detections: [], eventLog: [] };

const drones = buildDroneFleet(viewer.scene);
const statePublisher = createSimulationStatePublisher({
  viewer,
  drones,
  dynamicObjects,
  assetPlacement,
  detectionState
});
setupSimulationCommandReceiver({ drones, assetPlacement, detectionState });

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
