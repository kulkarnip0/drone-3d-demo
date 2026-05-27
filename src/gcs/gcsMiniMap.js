const WORLD = {
  minX: -60,
  maxX: 60,
  minZ: -50,
  maxZ: 50,
  coastX: -32,
  beachEndX: -22
};

const REGION_FILLS = [
  "rgba(70,145,255,0.20)",
  "rgba(255,184,65,0.20)",
  "rgba(255,85,120,0.20)",
  "rgba(120,255,170,0.20)"
];

const REGION_LINES = ["#7fb3ff", "#ffc65c", "#ff7796", "#7dffb0"];
const observedCells = new Set();
const droneHeadings = new Map();

function worldToCanvas(canvas, x, z) {
  return {
    x: ((x - WORLD.minX) / (WORLD.maxX - WORLD.minX)) * canvas.width,
    y: ((z - WORLD.minZ) / (WORLD.maxZ - WORLD.minZ)) * canvas.height
  };
}

function nearestDroneIndex(x, z, drones) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  drones.forEach((drone, index) => {
    const dx = x - drone.x;
    const dz = z - drone.z;
    const distance = dx * dx + dz * dz;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function drawBaseMap(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const seaWidth = ((WORLD.coastX - WORLD.minX) / (WORLD.maxX - WORLD.minX)) * canvas.width;
  const beachWidth = ((WORLD.beachEndX - WORLD.coastX) / (WORLD.maxX - WORLD.minX)) * canvas.width;

  ctx.fillStyle = "#07111f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(30,120,185,0.55)";
  ctx.fillRect(0, 0, seaWidth, canvas.height);
  ctx.fillStyle = "rgba(209,187,122,0.55)";
  ctx.fillRect(seaWidth, 0, beachWidth, canvas.height);
  ctx.fillStyle = "rgba(45,120,65,0.32)";
  ctx.fillRect(seaWidth + beachWidth, 0, canvas.width - seaWidth - beachWidth, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawCoverageRegions(ctx, canvas, drones) {
  if (drones.length === 0) return;

  const step = 4;
  const cellW = (step / (WORLD.maxX - WORLD.minX)) * canvas.width;
  const cellH = (step / (WORLD.maxZ - WORLD.minZ)) * canvas.height;

  for (let x = WORLD.minX; x <= WORLD.maxX; x += step) {
    for (let z = WORLD.minZ; z <= WORLD.maxZ; z += step) {
      const owner = nearestDroneIndex(x, z, drones);
      const p = worldToCanvas(canvas, x, z);
      ctx.fillStyle = REGION_FILLS[owner % REGION_FILLS.length];
      ctx.fillRect(p.x - cellW / 2, p.y - cellH / 2, cellW, cellH);
    }
  }
}

function updateHeading(drone) {
  const previous = droneHeadings.get(drone.id);
  let angle = previous?.angle || 0;

  if (previous) {
    const dx = drone.x - previous.x;
    const dz = drone.z - previous.z;
    if (Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1) {
      angle = Math.atan2(dz, dx);
    }
  }

  droneHeadings.set(drone.id, { x: drone.x, z: drone.z, angle });
}

function markObserved(drones) {
  const radius = 14;
  const step = 4;

  drones.forEach((drone) => {
    for (let x = drone.x - radius; x <= drone.x + radius; x += step) {
      for (let z = drone.z - radius; z <= drone.z + radius; z += step) {
        const dx = x - drone.x;
        const dz = z - drone.z;
        if (Math.sqrt(dx * dx + dz * dz) <= radius) {
          const owner = nearestDroneIndex(x, z, drones);
          observedCells.add(`${Math.round(x / step) * step},${Math.round(z / step) * step},${owner}`);
        }
      }
    }
  });
}

function drawObserved(ctx, canvas) {
  const step = 4;
  const cellW = (step / (WORLD.maxX - WORLD.minX)) * canvas.width;
  const cellH = (step / (WORLD.maxZ - WORLD.minZ)) * canvas.height;

  observedCells.forEach((key) => {
    const [x, z, owner] = key.split(",").map(Number);
    const p = worldToCanvas(canvas, x, z);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = REGION_LINES[owner % REGION_LINES.length];
    ctx.fillRect(p.x - cellW / 2, p.y - cellH / 2, cellW, cellH);
    ctx.globalAlpha = 1;
  });
}

function drawDrone(ctx, canvas, drone, index) {
  const p = worldToCanvas(canvas, drone.x, drone.z);
  const angle = droneHeadings.get(drone.id)?.angle || 0;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fillStyle = REGION_LINES[index % REGION_LINES.length];
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(p.x, p.y, 48, 0, Math.PI * 2);
  ctx.strokeStyle = REGION_LINES[index % REGION_LINES.length];
  ctx.globalAlpha = 0.7;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "white";
  ctx.font = "bold 12px Arial";
  ctx.fillText(`${drone.id} / R${index + 1}`, p.x + 12, p.y - 12);
}

function drawPoint(ctx, canvas, item, color, label) {
  const p = worldToCanvas(canvas, item.x, item.z);
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.font = "11px Arial";
  ctx.fillText(label, p.x + 8, p.y - 8);
}

function drawLegend(ctx) {
  let y = 20;
  ctx.font = "12px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.fillText("Observed World Map with Per-UAV Coverage Regions", 14, y);
  y += 18;
  ctx.fillText("Background split: nearest UAV owns that cell, like K-means/Voronoi partitioning.", 14, y);
  y += 18;
  ctx.fillStyle = REGION_LINES[0];
  ctx.fillText("blue = UAV-1", 14, y);
  y += 18;
  ctx.fillStyle = REGION_LINES[1];
  ctx.fillText("orange = UAV-2", 14, y);
  y += 18;
  ctx.fillStyle = REGION_LINES[2];
  ctx.fillText("pink = UAV-3", 14, y);
}

export function createGCSMiniMap() {
  const panel = document.createElement("section");
  panel.className = "panel mission-panel";
  panel.style.marginBottom = "14px";

  const title = document.createElement("h2");
  title.textContent = "Observed World Map";

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 310;
  canvas.style.width = "100%";
  canvas.style.height = "310px";
  canvas.style.borderRadius = "12px";
  canvas.style.border = "1px solid rgba(255,255,255,0.12)";
  canvas.style.background = "rgba(0,0,0,0.25)";

  const hint = document.createElement("div");
  hint.className = "empty-state";
  hint.style.marginTop = "10px";
  hint.textContent = "Coverage is divided between UAVs by assigning each map cell to the nearest UAV. Colored cells show what each UAV has covered. Path trails are hidden for a cleaner map.";

  panel.appendChild(title);
  panel.appendChild(canvas);
  panel.appendChild(hint);

  const metrics = document.querySelector(".metrics");
  metrics.insertAdjacentElement("afterend", panel);

  const ctx = canvas.getContext("2d");

  function update(state) {
    const drones = state.drones || [];
    drones.forEach(updateHeading);
    markObserved(drones);

    drawBaseMap(ctx, canvas);
    drawCoverageRegions(ctx, canvas, drones);
    drawObserved(ctx, canvas);

    drones.forEach((drone, index) => drawDrone(ctx, canvas, drone, index));

    (state.dynamicObjects || []).forEach((object) => {
      drawPoint(ctx, canvas, object, "#ffd166", object.label);
    });

    (state.placedAssets || [])
      .filter((asset) => asset.status === "DETECTED")
      .forEach((asset) => {
        const isRed = asset.side && asset.side.includes("RED");
        drawPoint(ctx, canvas, asset, isRed ? "#ff4d4d" : "#4d8dff", asset.label);
      });

    drawLegend(ctx);
  }

  return { update };
}
