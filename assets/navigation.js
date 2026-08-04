(() => {
  const mount = document.querySelector("#site-navigation");
  if (!mount) return;
  const root = document.body.dataset.root || "";
  const active = document.body.dataset.page || "home";
  const routes = [
    ["home", "index.html", "home"],
    ["armory", "armory/index.html", "armory"],
    ["attachments", "attachments/index.html", "attachment_index"],
    ["downloads", "downloads/index.html", "downloads"],
    ["documentation", "documentation/index.html", "documentation"],
    ["projects", "projects/index.html", "projects"],
    ["intel", "intel/index.html", "intel"],
    ["operators", "operators/index.html", "operators"],
    ["gallery", "gallery/index.html", "gallery"],
    ["changelog", "changelog/index.html", "changelog"],
    ["about", "about/index.html", "about"],
  ];
  const links = routes.map(([key,path,label]) => `<a href="${root}${path}"${key === active ? ' class="is-active" aria-current="page"' : ""}>${label}</a>`).join("");
  mount.innerHTML = `
    <div class="brand-block">
      <p class="eyebrow">field uplink</p>
      <h1>VEYRINDEX</h1>
      <p class="node-id">VEYR COLLECTIVE // PUBLIC DEV_NET</p>
    </div>
    <nav class="file-tree" aria-label="VEYRINDEX navigation">${links}</nav>
    <div class="status-stack" aria-label="Network status">
      <div><span>AUTH</span><strong>FIELD_OPERATOR</strong></div>
      <div><span>NODE</span><strong>ONLINE</strong></div>
      <div><span>MIRROR</span><strong>PUBLIC</strong></div>
      <div><span>LOCAL TIME</span><strong id="clock">--:--:--</strong></div>
    </div>`;
})();
