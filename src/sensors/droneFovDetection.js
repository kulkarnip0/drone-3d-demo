import * as THREE from "three";

const MAX_DETECTION_RANGE = 55;
const TEMP_MATRIX = new THREE.Matrix4();
const TEMP_FRUSTUM = new THREE.Frustum();
const TEMP_POSITION = new THREE.Vector3();
const DRONE_POSITION = new THREE.Vector3();

function isAssetInDroneCameraView(drone, asset) {
  if (!drone.camera) return false;

  asset.getWorldPosition(TEMP_POSITION);
  TEMP_POSITION.y += 1.4;
  drone.mesh.getWorldPosition(DRONE_POSITION);

  const distance = TEMP_POSITION.distanceTo(DRONE_POSITION);
  if (distance > MAX_DETECTION_RANGE) return false;

  drone.camera.updateMatrixWorld(true);
  TEMP_MATRIX.multiplyMatrices(
    drone.camera.projectionMatrix,
    drone.camera.matrixWorldInverse
  );
  TEMP_FRUSTUM.setFromProjectionMatrix(TEMP_MATRIX);

  return TEMP_FRUSTUM.containsPoint(TEMP_POSITION);
}

function setDetectedVisual(asset, detected) {
  asset.traverse((child) => {
    if (!child.isMesh || !child.material || !child.material.emissive) return;

    if (!child.userData.originalEmissive) {
      child.userData.originalEmissive = child.material.emissive.clone();
    }

    if (detected) {
      child.material.emissive.setHex(0x144400);
    } else {
      child.material.emissive.copy(child.userData.originalEmissive);
    }
  });
}

export function detectPlacedAssetsInDroneFov(drones, placedAssets) {
  const detections = [];

  placedAssets.forEach((asset) => {
    const detectedBy = [];

    drones.forEach((drone, index) => {
      if (isAssetInDroneCameraView(drone, asset)) {
        detectedBy.push(`UAV-${index + 1}`);
      }
    });

    asset.userData.detectedBy = detectedBy;
    asset.userData.detectionStatus = detectedBy.length > 0 ? "DETECTED" : "NOT IN FOV";
    setDetectedVisual(asset, detectedBy.length > 0);

    if (detectedBy.length > 0) {
      detections.push({
        label: asset.name || "Placed Asset",
        detectedBy,
        x: Number(asset.position.x.toFixed(1)),
        z: Number(asset.position.z.toFixed(1))
      });
    }
  });

  return detections;
}
