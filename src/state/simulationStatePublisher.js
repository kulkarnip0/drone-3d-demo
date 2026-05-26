function round(value, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function getDroneState(drones) {
  return drones.map((drone, index) => ({
    id: `UAV-${index + 1}`,
    x: round(drone.mesh.position.x),
    y: round(drone.mesh.position.y),
    z: round(drone.mesh.position.z),
    altitude: round(drone.mesh.position.y),
    status: "ACTIVE",
    mode: index === 0 ? "ISR Scan" : index === 1 ? "Route Patrol" : "Overwatch",
    battery: Math.max(45, round(96 - index * 7 - performance.now() * 0.00035, 0))
  }));
}

function getDynamicObjectState(dynamicObjects) {
  return dynamicObjects.map((object) => ({
    id: object.id,
    label: object.label,
    x: round(object.mesh.position.x),
    y: round(object.mesh.position.y),
    z: round(object.mesh.position.z),
    status: "MOVING"
  }));
}

function getPlacedAssetState(assetPlacement) {
  return assetPlacement.placedAssets.map((asset, index) => ({
    id: `ASSET-${index + 1}`,
    label: asset.name || "Placed Asset",
    x: round(asset.position.x),
    y: round(asset.position.y),
    z: round(asset.position.z),
    status: asset.userData.detectionStatus || "NOT IN FOV",
    detectedBy: asset.userData.detectedBy?.join(", ") || "-"
  }));
}

export function createSimulationStatePublisher({ viewer, drones, dynamicObjects, assetPlacement, detectionState }) {
  const channel = new BroadcastChannel("uav-mission-state");
  let lastPublishTime = 0;

  function publish(elapsedTime) {
    if (elapsedTime - lastPublishTime < 0.25) return;
    lastPublishTime = elapsedTime;

    const detections = detectionState?.detections || [];
    const state = {
      type: "SIMULATION_STATE",
      timestamp: new Date().toLocaleTimeString(),
      elapsedTime: round(elapsedTime),
      cameraMode: viewer.activeCamera === viewer.freeCamera ? "Free Mission View" : "Drone Camera View",
      drones: getDroneState(drones),
      dynamicObjects: getDynamicObjectState(dynamicObjects),
      placedAssets: getPlacedAssetState(assetPlacement),
      detections,
      mission: {
        name: "Coastal ISR Mission Sandbox",
        status: "RUNNING",
        threatLevel: detections.length > 0 ? "DETECTED CONTACT" : assetPlacement.placedAssets.length > 0 ? "ELEVATED" : "NORMAL",
        trackedObjects: dynamicObjects.length,
        deployedAssets: assetPlacement.placedAssets.length,
        detectedAssets: detections.length
      }
    };

    channel.postMessage(state);
  }

  return { publish };
}
