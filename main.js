import * as THREE from "three";
import { createViewer, handleResize } from "./src/core/createViewer.js";
import { setupCameraSwitching } from "./src/core/cameraControls.js";
import { addLights } from "./src/world/lights.js";
import { buildWorld } from "./src/world/buildWorld.js";
import { buildMissionZones } from "./src/world/missionZones.js";
import { buildDronePaths } from "./src/drones/dronePaths.js";
import { buildDroneFleet, updateDroneFleet } from "./src/drones/buildDroneFleet.js";

const viewer = createViewer();
const clock = new THREE.Clock();

addLights(viewer.scene);
buildWorld(viewer.scene);
buildMissionZones(viewer.scene);

const paths = buildDronePaths(viewer.scene);
const drones = buildDroneFleet(viewer.scene, paths);

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
  updateDroneFleet(drones, elapsedTime);

  viewer.renderer.render(viewer.scene, viewer.activeCamera);
}

animate();
