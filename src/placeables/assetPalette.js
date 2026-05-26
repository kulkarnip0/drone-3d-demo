export function createAssetPalette(onSelectAsset) {
  const panel = document.createElement("div");
  panel.id = "asset-palette";
  panel.innerHTML = `
    <div class="palette-title">Place Assets</div>
    <div class="palette-subtitle">Affiliation</div>
    <div class="force-row">
      <button class="force-button active" data-force="friendly">Friendly / Blue</button>
      <button class="force-button" data-force="hostile">Enemy / Red</button>
    </div>
    <div class="palette-subtitle">Asset Type</div>
    <button data-asset="launcher">Launcher Vehicle</button>
    <button data-asset="radar">Radar Unit</button>
    <button data-asset="command">Command Post</button>
    <button data-asset="sangar">Sangar Guard Post</button>
    <div class="palette-hint">Choose blue/red side, select asset, then click terrain to place. Press Esc to cancel.</div>
  `;

  document.body.appendChild(panel);

  let selectedForce = "friendly";
  const assetButtons = [...panel.querySelectorAll("button[data-asset]")];
  const forceButtons = [...panel.querySelectorAll("button[data-force]")];

  forceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedForce = button.dataset.force;
      forceButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  assetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      assetButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      onSelectAsset({ assetType: button.dataset.asset, affiliation: selectedForce });
    });
  });

  function clearSelection() {
    assetButtons.forEach((item) => item.classList.remove("active"));
  }

  return {
    panel,
    clearSelection
  };
}
