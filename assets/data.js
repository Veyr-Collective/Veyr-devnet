(() => {
  const root = document.body.dataset.root || "";
  const cache = new Map();
  const load = (name) => {
    if (!cache.has(name)) cache.set(name, fetch(`${root}data/${name}.json`).then((r) => { if (!r.ok) throw new Error(`${name}.json returned ${r.status}`); return r.json(); }));
    return cache.get(name);
  };
  const tone = (v="") => v.toLowerCase().replace(/[^a-z]+/g,"-").replace(/^-|-$/g,"");
  const fail = (mount,error) => mount.innerHTML = `<div class="data-error">DATA LINK FAILURE // ${error.message}</div>`;

  const weaponCard = (w) => `<article class="record-card">
    <div class="record-header"><span>${w.record}</span><strong>${w.name}</strong></div>
    <figure class="record-media"><a href="${root}${w.previewPath || w.image}"><img src="${root}${w.image}" alt="${w.imageAlt}" loading="lazy" decoding="async"></a><figcaption>${w.captureLabel}</figcaption></figure>
    <dl><div><dt>Status</dt><dd>${w.status}</dd></div><div><dt>Class</dt><dd>${w.class}</dd></div><div><dt>Current phase</dt><dd>${w.currentPhase}</dd></div></dl>
    <div class="card-footer"><span class="status-chip ${tone(w.statusTone)}">${w.statusTone}</span><a class="card-link" href="${root}${w.path}">Open record →</a></div></article>`;

  const variantCard = (v) => `<article class="record-card variant-card">
    <div class="record-header"><span>${v.record}</span><strong>${v.name}</strong></div>
    <figure class="record-media"><a href="${root}${v.previewImage || v.image}"><img src="${root}${v.image}" alt="${v.imageAlt}" loading="lazy" decoding="async"></a><figcaption>${v.captureLabel}</figcaption></figure>
    <dl><div><dt>Status</dt><dd>${v.status}</dd></div><div><dt>Class</dt><dd>${v.class}</dd></div><div><dt>Current phase</dt><dd>${v.currentPhase}</dd></div></dl>
    <div class="card-footer"><span class="status-chip ${tone(v.statusTone)}">${v.statusTone}</span><a class="card-link" href="${root}${v.previewImage || v.image}">Open capture →</a></div></article>`;

  async function renderWeapons() {
    const mounts = [...document.querySelectorAll("[data-weapon-grid]")]; if (!mounts.length) return;
    try { const data = await load("weapons"); mounts.forEach((m) => m.innerHTML = data.items.map(weaponCard).join("")); }
    catch (e) { mounts.forEach((m) => fail(m,e)); }
  }
  async function renderFeatured() {
    const mount = document.querySelector("[data-featured-weapon]"); if (!mount) return;
    try { const data = await load("weapons"); const slug = mount.dataset.featuredWeapon; const w = data.items.find((x)=>x.slug===slug) || data.items[0];
      mount.innerHTML = `<div class="weapon-hero"><figure><img src="${root}${w.image}" alt="${w.imageAlt}"></figure><div class="weapon-copy"><p class="eyebrow">${w.record} // featured platform</p><h3>${w.name}</h3><p>${w.overview}</p><dl><div><dt>Status</dt><dd>${w.status}</dd></div><div><dt>Current phase</dt><dd>${w.currentPhase}</dd></div><div><dt>Release channel</dt><dd>${w.release}</dd></div></dl><div class="action-row"><a class="action-link primary" href="${root}${w.path}">Open platform record</a></div></div></div>`;
    } catch (e) { fail(mount,e); }
  }
  async function renderDetail() {
    const mount = document.querySelector("[data-weapon-detail]"); if (!mount) return;
    try { const data = await load("weapons"); const w = data.items.find((x)=>x.slug===mount.dataset.weaponDetail); if (!w) throw new Error("weapon record not found");
      const specs = w.specifications.map((x)=>`<div><dt>${x.label}</dt><dd>${x.value}</dd></div>`).join("");
      const list = (items) => items.map((x)=>`<li>${x}</li>`).join("");
      const previewAction = w.previewPath ? `<a class="action-link" href="${root}${w.previewPath}">Full preview</a>` : "";
      const variants = Array.isArray(w.variants) && w.variants.length ? `<div class="weapon-variants"><div class="section-heading"><div><p class="eyebrow">/platform_variants</p><h2>1911 Configurations</h2></div><p>Classic, Compact, and Kimber captures share the same VEYRFRAME sidearm record.</p></div><div class="record-grid weapon-variant-grid">${w.variants.map(variantCard).join("")}</div></div>` : "";
      mount.innerHTML = `<div class="weapon-hero"><figure><a class="weapon-preview-link" href="${root}${w.previewPath || w.image}"><img src="${root}${w.image}" alt="${w.imageAlt}"></a></figure><div class="weapon-copy"><p class="eyebrow">${w.record}</p><h2>${w.name}</h2><p>${w.overview}</p><div class="page-meta"><span class="status-chip ${tone(w.statusTone)}">${w.status}</span><span class="meta-chip">${w.class}</span><span class="meta-chip">${w.progress}% development pulse</span></div><div class="action-row">${previewAction}<a class="action-link" href="${root}attachments/compatibility.html">Check compatibility</a><a class="action-link primary" href="${root}downloads/index.html">Release channel</a></div></div></div>
      ${variants}<div class="detail-grid"><section class="detail-panel"><p class="eyebrow">specifications</p><h3>Platform Record</h3><dl>${specs}</dl></section><section class="detail-panel"><p class="eyebrow">features</p><h3>Framework Integration</h3><ul>${list(w.features)}</ul></section><section class="detail-panel"><p class="eyebrow">supported attachments</p><h3>Interface Classes</h3><ul>${list(w.attachmentSupport)}</ul></section><section class="detail-panel"><p class="eyebrow">current restrictions</p><h3>Known Issues</h3><ul>${list(w.knownIssues)}</ul></section></div>`;
    } catch (e) { fail(mount,e); }
  }

  const projectRow = (p) => `<article class="project-row"><header><h3>${p.name}</h3><p>${p.group} // ${p.status}</p></header><div><div class="progress-track" aria-label="${p.progress}% complete"><span style="--progress:${p.progress}%"></span></div><div class="progress-meta"><span>DEVELOPMENT PULSE</span><strong>${p.progress}%</strong></div></div><div class="project-phase"><strong>${p.phase}</strong><span>${p.visibility}</span></div></article>`;
  async function renderProjects() {
    const mounts = [...document.querySelectorAll("[data-project-board]")]; if (!mounts.length) return;
    try { const data = await load("projects"); mounts.forEach((m)=>{ const scope=(m.dataset.projectScope||"").split(",").filter(Boolean); const items=scope.length?data.items.filter((x)=>scope.includes(x.slug)):data.items; m.innerHTML=items.map(projectRow).join(""); }); }
    catch(e){ mounts.forEach((m)=>fail(m,e)); }
  }

  const compatibility = (a) => Object.entries(a.compatibility).map(([p,s])=>`<span class="status-chip ${tone(s)}">${p.toUpperCase()}: ${s}</span>`).join("");
  const attachmentCard = (a) => `<article class="attachment-card"><header><div><h3>${a.name}</h3><p>${a.type} // ${a.mount}</p></div><span class="category-chip">${a.calibers.join(" / ")}</span></header><p>${a.summary}</p><div class="compatibility-list">${compatibility(a)}</div><div class="stats-split"><div><strong>Effects</strong><ul>${a.effects.map((x)=>`<li>${x}</li>`).join("")}</ul></div><div><strong>Tradeoffs</strong><ul>${a.tradeoffs.map((x)=>`<li>${x}</li>`).join("")}</ul></div></div></article>`;
  async function renderAttachments() {
    const results = document.querySelector("[data-attachment-results]"); if (!results) return;
    const platform=document.querySelector("#attachment-platform"), caliber=document.querySelector("#attachment-caliber"), type=document.querySelector("#attachment-type"), reset=document.querySelector("#attachment-reset");
    try { const data=await load("attachments"); [...new Set(data.items.map((x)=>x.type))].sort().forEach((x)=>type?.insertAdjacentHTML("beforeend",`<option value="${x}">${x}</option>`)); [...new Set(data.items.flatMap((x)=>x.calibers))].sort().forEach((x)=>caliber?.insertAdjacentHTML("beforeend",`<option value="${x}">${x}</option>`));
      const render=()=>{ const p=platform?.value||"all", c=caliber?.value||"all", t=type?.value||"all"; const items=data.items.filter((x)=>(p==="all"||x.compatibility[p]!=="incompatible")&&(c==="all"||x.calibers.includes(c))&&(t==="all"||x.type===t)); results.innerHTML=items.length?items.map(attachmentCard).join(""):'<div class="empty-state">NO MATCHING RECORDS // Adjust filters.</div>'; };
      [platform,caliber,type].forEach((x)=>x?.addEventListener("change",render)); reset?.addEventListener("click",()=>{[platform,caliber,type].forEach((x)=>{if(x)x.value="all"});render();}); render();
    } catch(e){ fail(results,e); }
  }
  async function renderMatrix() {
    const mount=document.querySelector("[data-compatibility-matrix]"); if(!mount)return;
    try { const [a,w]=await Promise.all([load("attachments"),load("weapons")]); const platforms=w.items.map((x)=>x.slug), names=Object.fromEntries(w.items.map((x)=>[x.slug,x.name])); const head=platforms.map((p)=>`<th>${names[p]}</th>`).join(""); const rows=a.items.map((x)=>`<tr><td><strong>${x.name}</strong><br><span>${x.type}</span></td>${platforms.map((p)=>{const s=x.compatibility[p]||"incompatible";return`<td><span class="status-chip ${tone(s)}">${s}</span></td>`}).join("")}</tr>`).join(""); mount.innerHTML=`<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Attachment</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>`; }
    catch(e){fail(mount,e)}
  }
  async function renderIntel() {
    const mounts=[...document.querySelectorAll("[data-intel-list]")]; if(!mounts.length)return;
    try { const data=await load("intel"); mounts.forEach((m)=>{const n=parseInt(m.dataset.limit||"0",10);const items=n?data.items.slice(0,n):data.items;m.innerHTML=items.map((x)=>`<article class="log-card"><time datetime="${x.date}">${x.displayDate}</time><h3>${x.title}</h3><p>${x.summary}</p><span class="category-chip">${x.category}</span></article>`).join("")}); }
    catch(e){mounts.forEach((m)=>fail(m,e))}
  }
  async function renderStats() {
    const mounts=[...document.querySelectorAll("[data-stat]")]; if(!mounts.length)return;
    try { const [w,a,p]=await Promise.all([load("weapons"),load("attachments"),load("projects")]); const values={weapons:w.items.length,attachments:a.items.length,projects:p.items.length,operators:0}; mounts.forEach((m)=>m.textContent=String(values[m.dataset.stat]??"--").padStart(2,"0")); }
    catch{mounts.forEach((m)=>m.textContent="--")}
  }
  renderWeapons(); renderFeatured(); renderDetail(); renderProjects(); renderAttachments(); renderMatrix(); renderIntel(); renderStats();
})();
