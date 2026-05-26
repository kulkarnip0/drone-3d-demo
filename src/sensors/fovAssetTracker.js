import * as THREE from "three";

const MAX_VIEW_RANGE = 55;
const PROJECTION = new THREE.Matrix4();
const FRUSTUM = new THREE.Frustum();
const ASSET_POS = new THREE.Vector3();
const UAV_POS = new THREE.Vector3();

function inDroneView(drone, asset) {
  if (!drone.camera) return false;

  asset.getWorldPosition(ASSET_POS);
  ASSET_POS.y += 1.4;
  drone.mesh.getWorldPosition(UAV_POS);

  if (ASSET_POS.distanceTo(UAV_POS) > MAX_VIEW_RANGE) return false;

  drone.camera.updateMatrixWorld(true);
  PROJECTION.multiplyMatrices(drone.camera.projectionMatrix, drone.camera.matrixWorldInverse);
  FRUSTUM.setFromProjectionMatrix(PROJECTION);

  return FRUSTUM.containsPoint(ASSET_POS);
}

function highlightAsset(asset, visibleNow) {
  asset.traverse((child) => {
    if (!child.isMesh || !child.material || !child.material.emissive) return;

    if (!child.userData.originalEmissive) {
      child.userData.originalEmissive = child.material.emissive.clone();
    }

    if (visibleNow) {
      const redSide = asset.userData.affiliation === "hostile";
      child.material.emissive.setHex(redSide ? 0x440000 : 0x001944);
    } else {
      child.material.emissive.copy(child.userData.originalEmissive);
    }
  });
}

function recordFirstSeen(asset, droneId, eventLog, elapsedTime) {
  if (!asset.userData.seenHistory) asset.userData.seenHistory = {};
  if (asset.userData.seenHistory[droneId]) return;

  const event = {
    time: new Date().toLocaleTimeString(),
    simTime: Number(elapsedTime.toFixed(1)),
    label: asset.name || "Placed Asset",
    side: asset.userData.affiliation || "unknown",
    seenBy: droneId,
    x: Number(asset.position.x.toFixed(1)),
    z: Number(asset.position.z.toFixed(1)),
    priority: asset.userData.affiliation === "hostile" ? "HIGH" : "INFO"
  };

  asset.userData.seenHistory[droneId] = event;
  asset.userData.firstSeenAt = asset.userData.firstSeenAt || event.time;
  eventLog.unshift(event);
}

export function trackPlacedAssetsInDroneView(drones, placedAssets, eventLog, elapsedTime) {
  const currentlyVisible = [];

  placedAssets.forEach((asset) => {
    const seenBy = [];

    drones.forEach((drone, index) => {
      const droneId = `UAV-${index + 1}`;
      if (inDroneView(drone, asset)) {
        seenBy.push(droneId);
        recordFirstSeen(asset, droneId, eventLog, elapsedTime);
      }
    });

    asset.userData.detectedBy = seenBy;
    asset.userData.detectionStatus = seenBy.length > 0 ? "DETECTED" : "NOT IN FOV";
    asset.userData.eventCount = Object.keys(asset.userData.seenHistory || {}).length;
    highlightAsset(asset, seenBy.length > 0);

    if (seenBy.length > 0) {
      currentlyVisible.push({
        label: asset.name || "Placed Asset",
        side: asset.userData.affiliation || "unknown",
        seenBy,
        x: Number(asset.position.x.toFixed(1)),
        z: Number(asset.position.z.toFixed(1))
      });
    }
  });

  return currentlyVisible;
}
