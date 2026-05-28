function parseAssistCommand(text) {
  const command = text.trim().toLowerCase();

  if (!command) {
    return { intent: "unknown", rawText: text };
  }

  if (
    command.includes("resume") ||
    command.includes("normal") ||
    command.includes("patrol") ||
    command.includes("regional")
  ) {
    return { intent: "resume_region_patrol", rawText: text };
  }

  if (
    command.includes("enemy") ||
    command.includes("red") ||
    command.includes("hostile") ||
    command.includes("follow") ||
    command.includes("track")
  ) {
    return { intent: "follow_hostile_asset", rawText: text };
  }

  if (command.includes("friendly") || command.includes("blue")) {
    return { intent: "inspect_friendly_asset", rawText: text };
  }

  return { intent: "unknown", rawText: text };
}

function addLog(container, text, kind = "info") {
  const item = document.createElement("div");
  item.className = "alert-item";
  item.style.borderLeftColor = kind === "ok" ? "#8fffc1" : kind === "error" ? "#ff7d7d" : "#3fd3ff";
  item.textContent = text;
  container.prepend(item);

  while (container.children.length > 5) {
    container.removeChild(container.lastChild);
  }
}

export function createAIAssistPanel() {
  const commandChannel = new BroadcastChannel("uav-assist-command");
  const responseChannel = new BroadcastChannel("uav-assist-response");

  const panel = document.createElement("section");
  panel.className = "panel mission-panel";
  panel.style.marginBottom = "14px";

  const title = document.createElement("h2");
  title.textContent = "AI Mission Assist";

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "10px";
  row.style.marginBottom = "10px";

  const input = document.createElement("input");
  input.placeholder = "Try: follow enemy asset | inspect friendly asset | resume patrol";
  input.style.flex = "1";
  input.style.padding = "11px 12px";
  input.style.borderRadius = "10px";
  input.style.border = "1px solid rgba(255,255,255,0.16)";
  input.style.background = "rgba(0,0,0,0.26)";
  input.style.color = "white";
  input.style.outline = "none";

  const button = document.createElement("button");
  button.textContent = "Send";
  button.style.padding = "11px 16px";
  button.style.borderRadius = "10px";
  button.style.border = "1px solid rgba(255,255,255,0.18)";
  button.style.background = "rgba(63,211,255,0.18)";
  button.style.color = "white";
  button.style.cursor = "pointer";

  row.appendChild(input);
  row.appendChild(button);

  const quick = document.createElement("div");
  quick.style.display = "flex";
  quick.style.flexWrap = "wrap";
  quick.style.gap = "8px";
  quick.style.marginBottom = "10px";

  ["follow enemy asset", "inspect friendly asset", "resume patrol"].forEach((text) => {
    const chip = document.createElement("button");
    chip.textContent = text;
    chip.style.padding = "7px 10px";
    chip.style.borderRadius = "999px";
    chip.style.border = "1px solid rgba(255,255,255,0.16)";
    chip.style.background = "rgba(255,255,255,0.08)";
    chip.style.color = "rgba(237,246,255,0.9)";
    chip.style.cursor = "pointer";
    chip.onclick = () => {
      input.value = text;
      sendCommand();
    };
    quick.appendChild(chip);
  });

  const log = document.createElement("div");
  log.className = "panel-list";
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = "AI Assist converts simple natural-language commands into UAV tasking. It is rule-based for this browser demo.";
  log.appendChild(empty);

  function sendCommand() {
    const parsed = parseAssistCommand(input.value);
    commandChannel.postMessage({ type: "AI_ASSIST_COMMAND", ...parsed });
    log.replaceChildren();
    addLog(log, `Command sent: ${input.value || "empty command"}`);
  }

  button.onclick = sendCommand;
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendCommand();
  });

  responseChannel.onmessage = (event) => {
    const response = event.data;
    if (!response || response.type !== "AI_ASSIST_RESPONSE") return;
    addLog(log, `${response.timestamp} | ${response.message}`, response.accepted ? "ok" : "error");
  };

  panel.appendChild(title);
  panel.appendChild(row);
  panel.appendChild(quick);
  panel.appendChild(log);

  const metrics = document.querySelector(".metrics");
  metrics.insertAdjacentElement("afterend", panel);
}
