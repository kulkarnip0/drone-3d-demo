import * as THREE from "three";

function findLatestDetectedAsset(assetPlacement, side) {
  const assets = assetPlacement.placedAssets.filter((asset) => {
    const sideMatches = side === "hostile"
      ? asset.userData.affiliation === "hostile"
      : asset.userData.affiliation === "friendly";
    return sideMatches && asset.userData.detectionStatus === "DETECTED";
  });

  return assets[assets.length - 1] || null;
}

function findNearestDrone(drones, target) {
  let bestDrone = drones[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  const targetPosition = new THREE.Vector3(target.position.x, target.position.y, target.position.z);

  drones.forEach((drone) => {
    const distance = drone.mesh.position.distanceToSquared(targetPosition);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestDrone = drone;
    }
  });

  return bestDrone;
}

function assignAssetInspection({ drones, assetPlacement, side, commandText }) {
  const targetAsset = findLatestDetectedAsset(assetPlacement, side);
  if (!targetAsset) {
    return {
      accepted: false,
      message: `No detected ${side === "hostile" ? "red-side" : "friendly"} asset is available yet. Place an asset and let a UAV observe it first.`
    };
  }

  const drone = findNearestDrone(drones, targetAsset);
  drone.assistTask = {
    type: "asset_inspection",
    label: side === "hostile" ? "Follow red-side asset" : "Inspect friendly asset",
    targetAsset,
    orbitAngle: 0,
    until: performance.now() + 90000,
    commandText
  };

  return {
    accepted: true,
    message: `${drone.name} assigned to repeatedly inspect ${targetAsset.name || "selected asset"}.`,
    droneName: drone.name
  };
}

function clearAssistTasks(drones) {
  drones.forEach((drone) => {
    drone.assistTask = null;
  });
}

export function setupSimulationCommandReceiver({ drones, assetPlacement, detectionState }) {
  const channel = new BroadcastChannel("uav-assist-command");
  const responseChannel = new BroadcastChannel("uav-assist-response");

  channel.onmessage = (event) => {
    const command = event.data;
    if (!command || command.type !== "AI_ASSIST_COMMAND") return;

    let response;

    if (command.intent === "follow_hostile_asset") {
      response = assignAssetInspection({
        drones,
        assetPlacement,
        side: "hostile",
        commandText: command.rawText
      });
    } else if (command.intent === "inspect_friendly_asset") {
      response = assignAssetInspection({
        drones,
        assetPlacement,
        side: "friendly",
        commandText: command.rawText
      });
    } else if (command.intent === "resume_region_patrol") {
      clearAssistTasks(drones);
      response = { accepted: true, message: "All UAVs returned to regional random coverage." };
    } else {
      response = {
        accepted: false,
        message: "Command not understood. Try: follow enemy asset, inspect friendly asset, or resume patrol."
      };
    }

    if (response.accepted) {
      detectionState.eventLog.unshift({
        time: new Date().toLocaleTimeString(),
        simTime: 0,
        label: "AI Assist Command",
        side: "system",
        seenBy: response.droneName || "GCS",
        x: 0,
        z: 0,
        priority: "TASK",
        message: response.message
      });
    }

    responseChannel.postMessage({
      type: "AI_ASSIST_RESPONSE",
      timestamp: new Date().toLocaleTimeString(),
      ...response
    });
  };
}
