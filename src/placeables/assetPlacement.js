import * as THREE from "three";
import { getTerrainHeight } from "../world/terrainHeight.js";
import { createAssetByType } from "./createPlaceableAssets.js";
import { createAssetPalette } from "./assetPalette.js";

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

function setObjectColorTint(object, color) {
  object.traverse((child) => {
    if (child.isMesh && child.material.color) {
      child.material = child.material.clone();
      child.material.color.lerp(new THREE.Color(color), 0.25);
    }
  });
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

export function setupAssetPlacement(viewer, world) {
  const placedAssets = [];
  let selectedType = null;
  let ghost = null;

  const palette = createAssetPalette((assetType) => {
    selectedType = assetType;

    if (ghost) {
      viewer.scene.remove(ghost);
      ghost = null;
    }

    ghost = createAssetByType(assetType);
    setObjectOpacity(ghost, 0.45);
    setObjectColorTint(ghost, 0x00ffff);
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

    const asset = createAssetByType(selectedType);
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
