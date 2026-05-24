export function setupCameraSwitching(viewer, drones, titleElement, statusElement) {
  function setOverlay(title, status) {
    if (titleElement) titleElement.textContent = title;
    if (statusElement) statusElement.textContent = status;
  }

  function useFreeCamera() {
    viewer.activeCamera = viewer.freeCamera;
    viewer.controls.enabled = true;
    setOverlay(
      "Drone 3D Mission World",
      "Free camera view. Press 1, 2, or 3 for drone camera views. Press 0 for free view."
    );
  }

  function useDroneCamera(index) {
    const drone = drones[index];
    if (!drone) return;

    viewer.activeCamera = drone.camera;
    viewer.controls.enabled = false;
    setOverlay(
      `${drone.name} Camera`,
      "Onboard drone camera view. Press 0 to return to free view."
    );
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "0") useFreeCamera();
    if (event.key === "1") useDroneCamera(0);
    if (event.key === "2") useDroneCamera(1);
    if (event.key === "3") useDroneCamera(2);
  });

  useFreeCamera();
}
