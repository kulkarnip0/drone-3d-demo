import { addBeach } from "./beach.js";
import { addBuildings } from "./buildings.js";
import { addForestAreas } from "./forest.js";
import { addRoadNetwork } from "./roads.js";
import { addSea } from "./sea.js";
import { addTerrain } from "./terrain.js";

export function buildWorld(scene) {
  const sea = addSea(scene);
  const terrain = addTerrain(scene);
  const beach = addBeach(scene);
  const roads = addRoadNetwork(scene);
  const buildings = addBuildings(scene);
  const forest = addForestAreas(scene);

  return {
    sea,
    terrain,
    beach,
    roads,
    buildings,
    forest
  };
}
