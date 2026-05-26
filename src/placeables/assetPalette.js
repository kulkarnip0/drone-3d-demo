export function createAssetPalette(onSelectAsset) {
  const panel = document.createElement("div");
  panel.id = "asset-palette";
  panel.innerHTML = `
    <div class="palette-title">Place Assets</div>
    <button data-asset="launcher">Launcher Vehicle</button>
    <button data-asset="radar">Radar Unit</button>
    <button data-asset="command">Command Post</button>
    <button data-asset="sangar">Sangar Guard Post</button>
    <div class="palette-hint">Select asset, then click terrain to place. Press Esc to cancel.</div>
  `;

  document.body.appendChild(panel);

  const buttons = [...panel.querySelectorAll("button")];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      onSelectAsset(button.dataset.asset);
    });
  });

  function clearSelection() {
    buttons.forEach((item) => item.classList.remove("active"));
  }

  return {
    panel,
    clearSelection
  };
}
