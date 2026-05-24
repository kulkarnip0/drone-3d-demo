import { createDrone, attachDroneCamera } from "./createDrone.js";

export function buildDroneFleet(scene, paths) {
  const drones = [
    {
      name: "Drone 1",
      mesh: createDrone(0x0066ff),
      path: paths[0],
      speed: 0.05,
      offset: 0
    },
    {
      name: "Drone 2",
      mesh: createDrone(0xffaa00),
      path: paths[1],
      speed: 0.04,
      offset: 0.25
    },
    {
      name: "Drone 3",
      mesh: createDrone(0xff3333),
      path: paths[2],
      speed: 0.035,
      offset: 0.5
    }
  ];

  drones.forEach((drone) => {
    drone.camera = attachDroneCamera(drone.mesh);
    scene.add(drone.mesh);
  });

  return drones;
}

export function updateDroneFleet(drones, elapsedTime) {
  drones.forEach((drone) => {
    const u = (elapsedTime * drone.speed + drone.offset) % 1;
    const position = drone.path.getPointAt(u);
    const nextPosition = drone.path.getPointAt((u + 0.01) % 1);

    drone.mesh.position.copy(position);
    drone.mesh.lookAt(nextPosition);
  });
}
