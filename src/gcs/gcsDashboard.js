import { createGCSMiniMap } from "./gcsMiniMap.js";

function createRow(label, value) {
  const row = document.createElement("div");
  row.className = "kv-row";

  const key = document.createElement("span");
  key.textContent = label;

  const val = document.createElement("strong");
  val.textContent = value;

  row.appendChild(key);
  row.appendChild(val);
  return row;
}

function renderTable(container, items, emptyText, columns) {
  container.replaceChildren();

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = item.status === "DETECTED" ? "data-card detected" : "data-card";

    const title = document.createElement("div");
    title.className = "data-card-title";
    title.textContent = item.id || item.label;
    card.appendChild(title);

    columns.forEach(([label, key]) => {
      card.appendChild(createRow(label, item[key] ?? "-"));
    });

    container.appendChild(card);
  });
}

function updateMetric(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

export function startGCSDashboard() {
  const miniMap = createGCSMiniMap();
  const channel = new BroadcastChannel("uav-mission-state");
  const connection = document.getElementById("connection-status");
  const droneList = document.getElementById("drone-list");
  const objectList = document.getElementById("object-list");
  const assetList = document.getElementById("asset-list");
  const alerts = document.getElementById("alerts");

  let lastMessageTime = 0;

  channel.onmessage = (event) => {
    const state = event.data;
    if (!state || state.type !== "SIMULATION_STATE") return;

    miniMap.update(state);
    lastMessageTime = Date.now();
    connection.textContent = "LIVE";
    connection.className = "status-pill live";

    updateMetric("mission-name", state.mission.name);
    updateMetric("mission-status", state.mission.status);
    updateMetric("camera-mode", state.cameraMode);
    updateMetric("sim-time", `${state.elapsedTime}s`);
    updateMetric("uav-count", state.drones.length);
    updateMetric("tracked-count", state.dynamicObjects.length);
    updateMetric("asset-count", state.placedAssets.length);
    updateMetric("threat-level", state.mission.threatLevel);
    updateMetric("detected-count", state.mission.detectedAssets || 0);
    updateMetric("last-update", state.timestamp);

    renderTable(droneList, state.drones, "No UAV telemetry yet.", [
      ["Mode", "mode"],
      ["Battery", "battery"],
      ["Altitude", "altitude"],
      ["X", "x"],
      ["Z", "z"]
    ]);

    renderTable(objectList, state.dynamicObjects, "No moving objects reported.", [
      ["Type", "label"],
      ["Status", "status"],
      ["X", "x"],
      ["Z", "z"]
    ]);

    renderTable(assetList, state.placedAssets, "No assets placed yet.", [
      ["Type", "label"],
      ["Side", "side"],
      ["Status", "status"],
      ["Seen By", "detectedBy"],
      ["First Seen", "firstSeenAt"],
      ["X", "x"],
      ["Z", "z"]
    ]);

    alerts.replaceChildren();
    const alertItems = [
      `Mission clock ${state.elapsedTime}s`,
      `${state.drones.length} UAVs active`,
      `${state.dynamicObjects.length} moving ground objects tracked`
    ];

    if (state.placedAssets.length > 0) {
      alertItems.push(`${state.placedAssets.length} field assets deployed. Blue/Red side is being tracked.`);
    }

    if (state.detectionLog && state.detectionLog.length > 0) {
      state.detectionLog.slice(0, 8).forEach((entry) => {
        const side = entry.side === "hostile" ? "RED/ENEMY" : "BLUE/FRIENDLY";
        alertItems.push(`${entry.time} | ${entry.seenBy} first saw ${side} ${entry.label} at X ${entry.x}, Z ${entry.z}. Priority ${entry.priority}.`);
      });
    }

    alertItems.forEach((text) => {
      const item = document.createElement("div");
      item.className = text.includes("RED/ENEMY") ? "alert-item detection" : "alert-item";
      item.textContent = text;
      alerts.appendChild(item);
    });
  };

  setInterval(() => {
    if (Date.now() - lastMessageTime > 1600) {
      connection.textContent = "WAITING FOR SIM";
      connection.className = "status-pill waiting";
    }
  }, 1000);
}
