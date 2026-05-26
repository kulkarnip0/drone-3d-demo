import * as THREE from "three";
import { getTerrainHeight } from "../world/terrainHeight.js";
import { createAssetByType } from "./createPlaceableAssets.js";
import { createAssetPalette } from "./assetPalette.js";

const FORCE_COLORS = {
  friendly: 0x0066ff,
  hostile: 0xff2222
};

function setObjectOpacity(object, opacity) {
  object.traverse((child) => {
    if (child.isMesh || child.isSprite) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = opacity;
      child.material.depthWrite = opacity > 0.7;
    }
  });
}

function setObjectColorTint(object, color, amount = 0.28) {
  object.traverse((child) => {
    if (child.isMesh && child.material.color) {
      child.material = child.material.clone();
      child.material.color.lerp(new THREE.Color(color), amount);
    }
  });
}

function addForceMarker(object, affiliation) {
  const color = FORCE_COLORS[affiliation] || FORCE_COLORS.friendly;

  const marker = new THREE.Mesh(
    new THREE.RingGeometry(2.9, 3.15, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    })
  );
  marker.name = "force_marker";
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.08;
  object.add(marker);
}

function getTerrainHit(event, viewer, terrain) {
  const rect = viewer.renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, viewer.activeCamera);

  const hits = raycaster.intersectObject(terrain, false);
  if (hits.length === 0) return null;

  return hits[0].point;
}

function placeOnTerrain(object, point) {
  const x = point.x;
  const z = point.z;
  const y = getTerrainHeight(x, z);
  object.position.set(x, y, z);
}

function createConfiguredAsset(assetType, affiliation) {
  const asset = createAssetByType(assetType);
  asset.userData.assetType = assetType;
  asset.userData.affiliation = affiliation;
  asset.userData.detectionStatus = "UNKNOWN";
  asset.userData.detectedBy = [];
  asset.userData.firstDetectedAt = null;
  asset.userData.detectionHistory = {};

  setObjectColorTint(asset, FORCE_COLORS[affiliation] || FORCE_COLORS.friendly, 0.2);
  addForceMarker(asset, affiliation);

  return asset;
}

export function setupAssetPlacement(viewer, world) {
  const placedAssets = [];
  let selectedType = null;
  let selectedAffiliation = "friendly";
  let ghost = null;

  const palette = createAssetPalette(({ assetType, affiliation }) => {
    selectedType = assetType;
    selectedAffiliation = affiliation;

    if (ghost) {
      viewer.scene.remove(ghost);
      ghost = null;
    }

    ghost = createConfiguredAsset(assetType, affiliation);
    setObjectOpacity(ghost, 0.45);
    setObjectColorTint(ghost, 0x00ffff, 0.16);
    viewer.scene.add(ghost);
  });

  function cancelSelection() {
    selectedType = null;
    palette.clearSelection();

    if (ghost) {
      viewer.scene.remove(ghost);
      ghost = null;
    }
  }

  viewer.renderer.domElement.addEventListener("pointermove", (event) => {
    if (!ghost || !world.terrain) return;

    const hitPoint = getTerrainHit(event, viewer, world.terrain);
    if (!hitPoint) return;

    placeOnTerrain(ghost, hitPoint);
  });

  viewer.renderer.domElement.addEventListener("click", (event) => {
    if (!selectedType || !world.terrain) return;

    const hitPoint = getTerrainHit(event, viewer, world.terrain);
    if (!hitPoint) return;

    const asset = createConfiguredAsset(selectedType, selectedAffiliation);
    placeOnTerrain(asset, hitPoint);
    asset.rotation.y = viewer.freeCamera.rotation.y;
    viewer.scene.add(asset);
    placedAssets.push(asset);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cancelSelection();
    }
  });

  return {
    placedAssets,
    cancelSelection
  };
}
