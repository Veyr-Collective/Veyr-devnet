(() => {
  "use strict";
  const REPO = "Veyr-Collective/Veyr-devnet";
  const BRANCH = "main";
  const API = `https://api.github.com/repos/${REPO}`;
  const AUTH_URL = "https://veyr-auth.tempus-armory.workers.dev";
  const state = { token:"", collection:"weapons", selected:0, documents:{}, shas:{}, dirty:new Set() };

  const schemas = {
    weapons: {
      title:"Weapons", make:()=>({slug:"new-weapon",name:"New weapon",record:"VEYRFRAME-00",status:"Planned",statusTone:"planned",class:"Platform",currentPhase:"Planning",release:"Not staged",progress:0,featured:false,path:"armory/new-weapon.html",previewPath:"",image:"assets/media/",imageAlt:"",captureLabel:"Development capture",overview:"",specifications:[],features:[],attachmentSupport:[],knownIssues:[]}),
      fields:[
        ["slug","Slug"],["name","Name"],["record","Record ID"],["status","Status"],["statusTone","Status tone","select",["complete","development","planned","experimental"]],["class","Class"],["currentPhase","Current phase"],["release","Release state"],["progress","Progress","number"],["featured","Featured","checkbox"],["path","Record page"],["previewPath","Preview page"],["image","Image path"],["imageAlt","Image description"],["captureLabel","Capture label"],["overview","Overview","textarea","wide"],["specifications","Specifications","objectArray","wide"],["features","Features","array","wide"],["attachmentSupport","Attachment support","array","wide"],["knownIssues","Known issues","array","wide"]
      ]
    },
    attachments: {
      title:"Attachments", make:()=>({slug:"new-attachment",name:"New attachment",type:"Optics",mount:"Picatinny",calibers:["Universal"],summary:"",compatibility:{"xcr-l":"planned","m4":"planned","1911":"incompatible"},effects:[],tradeoffs:[]}),
      fields:[["slug","Slug"],["name","Name"],["type","Type"],["mount","Mount"],["calibers","Calibers","array","wide"],["summary","Summary","textarea","wide"],["compatibility","Compatibility","compatibility","wide"],["effects","Effects","array","wide"],["tradeoffs","Tradeoffs","array","wide"]]
    },
    projects: {
      title:"Projects", make:()=>({slug:"new-project",name:"New project",group:"Armory",status:"Planned",progress:0,phase:"Research",visibility:"PUBLIC RECORD"}),
      fields:[["slug","Slug"],["name","Name"],["group","Group"],["status","Status"],["progress","Progress","number"],["phase","Phase"],["visibility","Visibility"]]
    },
    intel: {
      title:"Intel", make:()=>{const d=new Date().toISOString().slice(0,10);return {date:d,displayDate:d.replaceAll("-","."),title:"New intelligence record",category:"Development",summary:""}},
      fields:[["date","Date","date"],["displayDate","Display date"],["title","Title"],["category","Category"],["summary","Summary","textarea","wide"]]
    }
  };

  const $ = (s) => document.querySelector(s);
  const esc = (v="") => String(v).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const message = (text,error=false) => { const el=$("#editor-message"); el.textContent=text; el.classList.toggle("error",error); };
  const setBusy = (busy) => ["#reload-button","#add-button","#publish-button"].forEach((s)=>$(s).disabled=busy);

  async function github(path, options={}) {
    const response = await fetch(`${API}${path}`, { ...options, headers:{"Accept":"application/vnd.github+json","Authorization":`Bearer ${state.token}`,"X-GitHub-Api-Version":"2022-11-28",...(options.headers||{})} });
    if (!response.ok) { const data=await response.json().catch(()=>({})); throw new Error(data.message || `GitHub returned ${response.status}`); }
    return response.status===204 ? null : response.json();
  }

  async function connect(token) {
    state.token=token.trim();
    const repo=await github("");
    if (!repo.permissions?.push) throw new Error("This token does not have write access to the repository.");
    sessionStorage.setItem("veyrGithubToken",state.token);
    $("#login-panel").hidden=true; $("#editor").hidden=false;
    $("#connection-state").classList.add("online"); $("#connection-state").innerHTML="<span></span>CONNECTED";
    await loadAll();
  }

  function randomState() {
    const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
  }

  function beginGithubLogin() {
    const oauthState=randomState();
    sessionStorage.setItem("veyrOAuthState",oauthState);
    location.assign(`${AUTH_URL}/login?state=${encodeURIComponent(oauthState)}`);
  }

  async function finishGithubLogin() {
    const params=new URLSearchParams(location.hash.slice(1));
    if(!params.has("access_token") && !params.has("error")) return false;
    history.replaceState(null,"",location.pathname+location.search);
    const expected=sessionStorage.getItem("veyrOAuthState");
    sessionStorage.removeItem("veyrOAuthState");
    if(!expected || params.get("state")!==expected) throw new Error("GitHub login state did not match. Please try again.");
    if(params.has("error")) throw new Error(`GitHub login was not completed: ${params.get("error")}`);
    await connect(params.get("access_token"));
    return true;
  }

  async function loadAll() {
    setBusy(true); message("Loading current records…");
    try {
      for (const name of Object.keys(schemas)) {
        const file=await github(`/contents/data/${name}.json?ref=${BRANCH}`);
        state.documents[name]=JSON.parse(decodeURIComponent(escape(atob(file.content.replace(/\n/g,"")))));
        state.shas[name]=file.sha;
      }
      state.dirty.clear(); state.selected=0; render(); message("Records synchronized with GitHub.");
    } catch(e) { message(e.message,true); throw e; }
    finally { setBusy(false); }
  }

  function render() {
    const schema=schemas[state.collection], items=state.documents[state.collection].items;
    $("#collection-title").textContent=schema.title;
    document.querySelectorAll("[data-collection]").forEach((b)=>b.classList.toggle("active",b.dataset.collection===state.collection));
    $("#record-list").innerHTML=items.map((item,i)=>`<button type="button" data-index="${i}" class="${i===state.selected?"active":""}">${esc(item.name||item.title||item.slug)}<small>${esc(item.status||item.category||item.type||item.slug||"")}</small></button>`).join("");
    $("#record-list").querySelectorAll("button").forEach((b)=>b.addEventListener("click",()=>{saveForm(false);state.selected=Number(b.dataset.index);render()}));
    renderForm(items[state.selected]);
    $("#publish-button").textContent=state.dirty.size ? `Publish ${state.dirty.size} change${state.dirty.size===1?"":"s"}` : "Publish to site";
  }

  function renderForm(item) {
    const form=$("#record-form"), schema=schemas[state.collection];
    if (!item) { form.innerHTML='<div class="wide">No records in this collection.</div>'; return; }
    form.innerHTML=schema.fields.map(([key,label,type="text",extra])=>fieldMarkup(key,label,type,extra,item[key])).join("") + `<div class="wide toolbar-actions"><button class="admin-button" id="move-up" type="button">↑ Move up</button><button class="admin-button" id="move-down" type="button">↓ Move down</button><button class="admin-button" id="delete-record" type="button">Delete record</button></div>`;
    form.oninput=()=>{state.dirty.add(state.collection);saveForm(false)};
    form.onchange=()=>{state.dirty.add(state.collection);saveForm(false)};
    form.querySelectorAll("[data-remove]").forEach((b)=>b.addEventListener("click",()=>{b.closest(".array-row,.array-object").remove();state.dirty.add(state.collection);saveForm(false)}));
    form.querySelectorAll("[data-add-array]").forEach((b)=>b.addEventListener("click",()=>addArrayRow(b.dataset.addArray,b.dataset.arrayType)));
    $("#delete-record").addEventListener("click",deleteRecord); $("#move-up").addEventListener("click",()=>move(-1)); $("#move-down").addEventListener("click",()=>move(1));
  }

  function fieldMarkup(key,label,type,extra,value) {
    const wide=extra==="wide" || ["textarea","array","objectArray","compatibility"].includes(type) ? "wide" : "";
    if(type==="checkbox") return `<label class="${wide}">${esc(label)}<input name="${key}" type="checkbox" ${value?"checked":""}></label>`;
    if(type==="textarea") return `<label class="${wide}">${esc(label)}<textarea name="${key}">${esc(value)}</textarea></label>`;
    if(type==="select") return `<label class="${wide}">${esc(label)}<select name="${key}">${extra.map((x)=>`<option ${x===value?"selected":""}>${esc(x)}</option>`).join("")}</select></label>`;
    if(type==="array") return `<div class="array-field ${wide}" data-field="${key}"><label>${esc(label)}</label><div class="array-rows">${(value||[]).map((x)=>arrayRow(x)).join("")}</div><button class="admin-button" type="button" data-add-array="${key}" data-array-type="text">+ Add item</button></div>`;
    if(type==="objectArray") return `<div class="array-field ${wide}" data-field="${key}"><label>${esc(label)}</label><div class="array-rows">${(value||[]).map((x)=>objectRow(x)).join("")}</div><button class="admin-button" type="button" data-add-array="${key}" data-array-type="object">+ Add specification</button></div>`;
    if(type==="compatibility") return `<div class="array-field ${wide}" data-field="${key}"><label>${esc(label)}</label><div class="array-rows">${Object.entries(value||{}).map(([platform,status])=>`<div class="array-object"><input data-key value="${esc(platform)}" aria-label="Platform"><select data-value>${["verified","planned","incompatible"].map((x)=>`<option ${x===status?"selected":""}>${x}</option>`).join("")}</select><button class="icon-button" data-remove type="button">×</button></div>`).join("")}</div><button class="admin-button" type="button" data-add-array="${key}" data-array-type="compatibility">+ Add platform</button></div>`;
    return `<label class="${wide}">${esc(label)}<input name="${key}" type="${type}" ${type==="number"?'min="0" max="100"':''} value="${esc(value)}"></label>`;
  }
  const arrayRow=(value="")=>`<div class="array-row"><input data-value value="${esc(value)}"><button class="icon-button" data-remove type="button">×</button></div>`;
  const objectRow=(value={label:"",value:""})=>`<div class="array-object"><input data-key value="${esc(value.label)}" placeholder="Label"><input data-value value="${esc(value.value)}" placeholder="Value"><button class="icon-button" data-remove type="button">×</button></div>`;
  function addArrayRow(key,type) { const rows=document.querySelector(`[data-field="${key}"] .array-rows`); rows.insertAdjacentHTML("beforeend",type==="object"?objectRow():type==="compatibility"?`<div class="array-object"><input data-key value="platform"><select data-value><option>verified</option><option selected>planned</option><option>incompatible</option></select><button class="icon-button" data-remove type="button">×</button></div>`:arrayRow()); renderFormBindings(rows.lastElementChild); state.dirty.add(state.collection); saveForm(false); }
  function renderFormBindings(root) { root.querySelector("[data-remove]")?.addEventListener("click",()=>{root.remove();state.dirty.add(state.collection);saveForm(false)}); }

  function saveForm(refresh=true) {
    const item=state.documents[state.collection]?.items[state.selected], form=$("#record-form"); if(!item||!form)return;
    schemas[state.collection].fields.forEach(([key,,type="text"])=>{
      const field=form.elements[key];
      if(type==="checkbox") item[key]=field.checked;
      else if(type==="number") item[key]=Number(field.value);
      else if(type==="array") item[key]=[...form.querySelectorAll(`[data-field="${key}"] [data-value]`)].map((x)=>x.value).filter(Boolean);
      else if(type==="objectArray") item[key]=[...form.querySelectorAll(`[data-field="${key}"] .array-object`)].map((r)=>({label:r.querySelector("[data-key]").value,value:r.querySelector("[data-value]").value})).filter((x)=>x.label||x.value);
      else if(type==="compatibility") item[key]=Object.fromEntries([...form.querySelectorAll(`[data-field="${key}"] .array-object`)].map((r)=>[r.querySelector("[data-key]").value,r.querySelector("[data-value]").value]).filter(([k])=>k));
      else item[key]=field.value;
    });
    if(refresh)render(); else $("#publish-button").textContent=`Publish ${state.dirty.size} change${state.dirty.size===1?"":"s"}`;
  }
  function move(delta) { saveForm(false); const items=state.documents[state.collection].items, next=state.selected+delta; if(next<0||next>=items.length)return; [items[state.selected],items[next]]=[items[next],items[state.selected]]; state.selected=next;state.dirty.add(state.collection);render(); }
  function deleteRecord() { const items=state.documents[state.collection].items,item=items[state.selected];if(!confirm(`Delete ${item.name||item.title}?`))return;items.splice(state.selected,1);state.selected=Math.max(0,state.selected-1);state.dirty.add(state.collection);render(); }
  function addRecord() { saveForm(false);const items=state.documents[state.collection].items;items.push(schemas[state.collection].make());state.selected=items.length-1;state.dirty.add(state.collection);render(); }

  async function publish(note) {
    saveForm(false); if(!state.dirty.size){message("There are no unpublished changes.");return}
    setBusy(true); message("Publishing records…");
    try {
      for(const name of [...state.dirty]) {
        const doc=state.documents[name];doc.updated=new Date().toISOString().slice(0,10);
        const content=unescape(encodeURIComponent(JSON.stringify(doc,null,2)+"\n"));
        const result=await github(`/contents/data/${name}.json`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:`${note} (${name})`,content:btoa(content),sha:state.shas[name],branch:BRANCH})});
        state.shas[name]=result.content.sha;state.dirty.delete(name);
      }
      render();message("Published. GitHub Pages should reflect the changes shortly.");
    } catch(e){message(e.message,true)} finally{setBusy(false)}
  }

  $("#github-login").addEventListener("click",beginGithubLogin);
  document.querySelectorAll("[data-collection]").forEach((b)=>b.addEventListener("click",()=>{saveForm(false);state.collection=b.dataset.collection;state.selected=0;render()}));
  $("#add-button").addEventListener("click",addRecord);$("#reload-button").addEventListener("click",()=>{if(!state.dirty.size||confirm("Discard all unpublished changes?"))loadAll()});
  $("#publish-button").addEventListener("click",()=>$("#confirm-dialog").showModal());
  $("#confirm-dialog").addEventListener("close",()=>{if($("#confirm-dialog").returnValue==="confirm")publish($("#commit-note").value.trim()||"Update site content")});
  addEventListener("beforeunload",(event)=>{if(state.dirty.size)event.preventDefault()});
  finishGithubLogin().then((handled)=>{if(!handled){const saved=sessionStorage.getItem("veyrGithubToken");if(saved)connect(saved).catch(()=>sessionStorage.removeItem("veyrGithubToken"));}}).catch((err)=>{const m=$("#login-message");m.textContent=err.message;m.classList.add("error")});
})();
