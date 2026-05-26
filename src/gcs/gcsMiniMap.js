const WORLD = {
  minX: -60,
  maxX: 60,
  minZ: -50,
  maxZ: 50,
  coastX: -32,
  beachEndX: -22
};

const observedCells = new Set();
const droneTrails = new Map();

function worldToCanvas(canvas, x, z) {
  const px = ((x - WORLD.minX) / (WORLD.maxX - WORLD.minX)) * canvas.width;
  const py = ((z - WORLD.minZ) / (WORLD.maxZ - WORLD.minZ)) * canvas.height;
  return { x: px, y: py };
}

function drawCircle(ctx, x, y, radius, color, label) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  if (label) {
    ctx.fillStyle = "white";
    ctx.font = "11px Arial";
    ctx.fillText(label, x + 8, y - 8);
  }
}

function drawDroneIcon(ctx, canvas, drone) {
  const current = worldToCanvas(canvas, drone.x, drone.z);
  const trail = droneTrails.get(drone.id) || [];
  const previous = trail.length > 1 ? trail[trail.length - 2] : null;

  let angle = 0;
  if (previous) {
    const prev = worldToCanvas(canvas, previous.x, previous.z);
    angle = Math.atan2(current.y - prev.y, current.x - prev.x);
  }

  ctx.save();
  ctx.translate(current.x, current.y);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();

  ctx.beginPath();
  ctx.arc(current.x, current.y, 48, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "bold 12px Arial";
  ctx.fillText(drone.id, current.x + 12, current.y - 12);
}

function updateDroneTrail(drone) {
  if (!droneTrails.has(drone.id)) droneTrails.set(drone.id, []);
  const trail = droneTrails.get(drone.id);
  const last = trail[trail.length - 1];

  if (!last || Math.abs(last.x - drone.x) > 0.6 || Math.abs(last.z - drone.z) > 0.6) {
    trail.push({ x: drone.x, z: drone.z });
  }

  if (trail.length > 60) trail.shift();
}

function drawDroneTrails(ctx, canvas) {
  droneTrails.forEach((trail) => {
    if (trail.length < 2) return;

    ctx.beginPath();
    trail.forEach((point, index) => {
      const p = worldToCanvas(canvas, point.x, point.z);
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function markObservedFromUavs(drones) {
  drones.forEach((drone) => {
    const radius = 14;
    const cellSize = 4;

    for (let x = drone.x - radius; x <= drone.x + radius; x += cellSize) {
      for (let z = drone.z - radius; z <= drone.z + radius; z += cellSize) {
        const dx = x - drone.x;
        const dz = z - drone.z;
        if (Math.sqrt(dx * dx + dz * dz) <= radius) {
          const key = `${Math.round(x / cellSize) * cellSize},${Math.round(z / cellSize) * cellSize}`;
          observedCells.add(key);
        }
      }
    }
  });
}

function drawBaseMap(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const seaWidth = ((WORLD.coastX - WORLD.minX) / (WORLD.maxX - WORLD.minX)) * canvas.width;
  const beachWidth = ((WORLD.beachEndX - WORLD.coastX) / (WORLD.maxX - WORLD.minX)) * canvas.width;

  ctx.fillStyle = "#07111f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(30, 120, 185, 0.55)";
  ctx.fillRect(0, 0, seaWidth, canvas.height);

  ctx.fillStyle = "rgba(209, 187, 122, 0.55)";
  ctx.fillRect(seaWidth, 0, beachWidth, canvas.height);

  ctx.fillStyle = "rgba(45, 120, 65, 0.32)";
  ctx.fillRect(seaWidth + beachWidth, 0, canvas.width - seaWidth - beachWidth, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
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

function drawObservedCells(ctx, canvas) {
  const cellSizeWorld = 4;
  const cellW = (cellSizeWorld / (WORLD.maxX - WORLD.minX)) * canvas.width;
  const cellH = (cellSizeWorld / (WORLD.maxZ - WORLD.minZ)) * canvas.height;

  ctx.fillStyle = "rgba(90, 255, 150, 0.22)";
  observedCells.forEach((key) => {
    const [x, z] = key.split(",").map(Number);
    const point = worldToCanvas(canvas, x, z);
    ctx.fillRect(point.x - cellW / 2, point.y - cellH / 2, cellW, cellH);
  });
}

function drawLegend(ctx) {
  const x = 14;
  let y = 20;
  ctx.font = "12px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  ctx.fillText("Observed World Map", x, y);
  y += 18;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("white arrow + trail = moving UAV", x, y);
  y += 18;
  ctx.fillStyle = "rgba(90, 255, 150, 0.75)";
  ctx.fillText("green cells = observed by UAV camera/FOV", x, y);
  y += 18;
  ctx.fillStyle = "#4ba3ff";
  ctx.fillText("blue = friendly detected asset", x, y);
  y += 18;
  ctx.fillStyle = "#ff5b5b";
  ctx.fillText("red = enemy detected asset", x, y);
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
  hint.textContent = "UAV arrows move live. White trails show recent motion. Green cells show the observed world being built from UAV coverage.";

  panel.appendChild(title);
  panel.appendChild(canvas);
  panel.appendChild(hint);

  const metrics = document.querySelector(".metrics");
  metrics.insertAdjacentElement("afterend", panel);

  const ctx = canvas.getContext("2d");

  function update(state) {
    const drones = state.drones || [];
    drones.forEach(updateDroneTrail);
    markObservedFromUavs(drones);

    drawBaseMap(ctx, canvas);
    drawObservedCells(ctx, canvas);
    drawDroneTrails(ctx, canvas);

    drones.forEach((drone) => drawDroneIcon(ctx, canvas, drone));

    (state.dynamicObjects || []).forEach((object) => {
      const p = worldToCanvas(canvas, object.x, object.z);
      drawCircle(ctx, p.x, p.y, 4, "#ffd166", object.label);
    });

    (state.placedAssets || [])
      .filter((asset) => asset.status === "DETECTED")
      .forEach((asset) => {
        const p = worldToCanvas(canvas, asset.x, asset.z);
        const isRed = asset.side && asset.side.includes("RED");
        drawCircle(ctx, p.x, p.y, 7, isRed ? "#ff4d4d" : "#4d8dff", asset.label);
      });

    drawLegend(ctx);
  }

  return { update };
}
