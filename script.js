
/* easyPCS polished SPA
 * - MyFitnessPal-style carousel & sticky bars
 * - Bottom + action sheet (Add Task/Phase)
 * - Add Task sheet only on Phase Detail, with scroll lock and backdrop
 * - Circular checkboxes, date subline, completed collapsible
 * - Auto Day/Night themes (Auto/System/Light/Dark) persisted
 * - Master Timeline with month groups and filters
 * - LocalStorage persistence w/ seed data & reset
 */

const LSK = "pcsChecklist.v1";
const THEME_KEY = "easyPCS.themeMode"; // 'auto' | 'system' | 'light' | 'dark'

/* ---------------- Utilities ----------------- */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const rid = (p) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
const todayISO = ()=> new Date().toISOString().slice(0,10);
const byId = (arr, id) => arr.find(x=>x.id===id);
const deepClone = (o) => JSON.parse(JSON.stringify(o));

function debounce(fn, ms=120){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

/* ---------------- Seed Data ----------------- */
function seedData(){
  return {
    phases: [
      { id:"p1", title:"Pre‑Departure", suspense:"2025-09-23", tasks:[
        { id:"t1", title:"Complete Initial Assignment Briefing in vMPF (within 7 days of RIP)", due:"2025-08-15", desc:"", done:false },
        { id:"t2", title:"Fill out and upload Assignment Information Worksheet", due:"2025-09-23", desc:"", done:false },
        { id:"t3", title:"Verify dependents in DEERS / print DD 1172-2", due:"2025-09-23", desc:"", done:false },
        { id:"t4", title:"Complete SOES/SGLI update in milConnect; print certified copy", due:"2025-09-23", desc:"", done:false },
        { id:"t5", title:"Start FMTS and Initial Travel Screening Questionnaire (ITSQ)", due:"2025-09-23", desc:"", done:false },
        { id:"t6", title:"Schedule/complete Immunizations Memo (86 MDG Immunizations)", due:"2025-09-23", desc:"", done:false },
        { id:"t7", title:"Obtain Security Clearance Memorandum from unit Security Manager (SECRET; validate in DISS)", due:"2025-09-23", desc:"", done:false },
        { id:"t8", title:"Check retainability requirement; start with CSS; obtain signed Retention memo", due:"2025-09-23", desc:"", done:false },
        { id:"t9", title:"If dependents, complete DAF 965 Overseas Tour Election (only if required)", due:"2025-09-23", desc:"", done:false },
        { id:"t10", title:"If TDY enroute, attach RIP + funding info", due:"2025-09-23", desc:"", done:false },
        { id:"t11", title:"If carrying firearms, record POF details (Make/Model/Serial)", due:"2025-09-23", desc:"", done:false },
        { id:"t12", title:"(Optional) Sign AOI Acknowledgement Memo", due:"2025-09-01", desc:"", done:false },
        { id:"t13", title:"(Optional) Upload Assignment Worksheet, medical clearance initiation screenshot, DD1172-2", due:"2025-09-01", desc:"", done:false },
        { id:"t14", title:"(Optional) Use AOI orders for HHG/Passenger Travel scheduling — cannot depart without amendment validating FMTS/security clearance", due:"2025-09-10", desc:"", done:false },
      ]},
      { id:"p2", title:"Mid Prep", suspense:"2025-11-30", tasks:[
        { id:"t1", title:"VIPER Folder – upload all required docs; CSS marks 'In Person Final Out Ready – Submitted to MPF.'", due:"2025-11-15", desc:"", done:false },
        { id:"t2", title:"Relocation Processing Memorandum", due:"2025-11-10", desc:"", done:false },
        { id:"t3", title:"Weapons training current (AF 522 if required)", due:"2025-10-31", desc:"", done:false },
        { id:"t4", title:"Security debrief / badge turn‑in", due:"2025-11-30", desc:"", done:false },
        { id:"t5", title:"Family Care Plan (AF 357) if single parent/mil‑to‑mil", due:"2025-10-15", desc:"", done:false },
        { id:"t6", title:"GTC active / mission‑critical", due:"2025-10-01", desc:"", done:false },
        { id:"t7", title:"AT/FP Brief (not required CONUS)", due:"2025-11-10", desc:"", done:false },
        { id:"t8", title:"Fitness file closed/hand‑carried if applicable", due:"2025-11-20", desc:"", done:false },
        { id:"t9", title:"Route for CC/DO/CCF/First Sgt signature", due:"2025-11-25", desc:"", done:false },
        { id:"t10", title:"Virtual Outprocessing (vMPF) – complete all items except Outbound Assignments", due:"2025-11-20", desc:"", done:false },
        { id:"t11", title:"Physical Fitness valid through 2026‑01‑31 (retest if due)", due:"2025-11-15", desc:"", done:false },
        { id:"t12", title:"Orders Review – dependents, RNLTD, remarks", due:"2025-11-10", desc:"", done:false },
        { id:"t13", title:"Household Goods (TMO) – after orders/AOI, schedule pack‑out", due:"2025-11-05", desc:"", done:false },
        { id:"t14", title:"If traveling different routing: submit Circuitous Travel Memo", due:"2025-11-12", desc:"", done:false },
      ]},
      { id:"p3", title:"Final Out", suspense:"2025-12-19", tasks:[
        { id:"t1", title:"CSS Outprocessing – 1 duty day before MPF", due:"2025-12-18", desc:"", done:false },
        { id:"t2", title:"Final Out Appointment (MPF) – WaitWhile; bring all docs", due:"2025-12-19", desc:"Checklist: PCS Orders (verified), Certified SOES/SGLI, 2x Relocation Memos (signed), vOP Checklist (all cleared), Immunizations Memo, Security Clearance Memo", done:false },
        { id:"t3", title:"Port Call (Passenger Travel) – upload orders to PTA, confirm flight", due:"2025-12-10", desc:"", done:false },
        { id:"t4", title:"Finance Outprocessing (CPTS) – DLA, travel voucher, GTC usage", due:"2025-12-19", desc:"", done:false },
      ]},
      { id:"p4", title:"Arrival (Hill AFB)", suspense:"2026-01-31", tasks:[
        { id:"t1", title:"Report to unit CSS within 24 hrs", due:"2026-01-02", desc:"", done:false },
        { id:"t2", title:"In‑process Finance (update BAH, COLA, etc.)", due:"2026-01-05", desc:"", done:false },
        { id:"t3", title:"In‑process Medical at Hill AFB Clinic", due:"2026-01-05", desc:"", done:false },
        { id:"t4", title:"Update DEERS/Tricare with new address", due:"2026-01-06", desc:"", done:false },
        { id:"t5", title:"Secure housing (on/off base)", due:"2026-01-15", desc:"", done:false },
        { id:"t6", title:"School/childcare enrollment for dependents", due:"2026-01-10", desc:"", done:false },
      ]},
    ],
    timeline: [
      { date:"2025-07-15", title:"Assignment notification RIP issued", phase:null, done:true },
      { date:"2025-08-15", title:"Initial Assignment Briefing complete; begin medical/security/immunizations", phase:"Pre‑Departure", done:true },
      { date:"2025-09-23", title:"Document suspense — AW, DD1172‑2, FMTS/ITSQ, Immunizations, Security Memo, Retainability memo uploaded", phase:"Pre‑Departure", done:false },
      { date:"2025-10-15", title:"Follow up FMTS clearance; VIPER folder check", phase:"Mid Prep", done:false },
      { date:"2025-11-15", title:"Relocation Memo routing, vOP, fitness test if due. Schedule HHG. Circuitous Travel if needed.", phase:"Mid Prep", done:false },
      { date:"2025-12-05", title:"Confirm orders and port call", phase:"Final Out", done:false },
      { date:"2025-12-18", title:"CSS Outprocessing", phase:"Final Out", done:false },
      { date:"2025-12-19", title:"MPF Final Out appointment", phase:"Final Out", done:false },
      { date:"2025-12-22", title:"Projected Departure", phase:"Final Out", done:false },
      { date:"2026-01-31", title:"Report to Hill AFB by RNLTD 31 Jan; in‑process unit, finance, housing, medical", phase:"Arrival (Hill AFB)", done:false },
    ],
    ui:{
      selectedPhaseId: "p1",
      filters: {},
      themeMode: "auto"
    }
  };
}

/* ---------------- Persistence ----------------- */
let STATE = load() || seedData();
save(); // ensure stored

function load(){
  try{
    const raw = localStorage.getItem(LSK);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
const saveDebounced = debounce(save, 120);
function save(){ try{ localStorage.setItem(LSK, JSON.stringify(STATE)); }catch(e){} }

/* ---------------- Routing ----------------- */
function route(){
  const hash = location.hash || "#/home";
  if(hash.startsWith("#/phase/")){
    const id = hash.split("/")[2]; openPhase(id);
  }else if(hash.startsWith("#/timeline")){
    openTimeline();
  }else{
    openHome();
  }
}
window.addEventListener("hashchange", route);

/* ---------------- Theme Engine ----------------- */
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme(){
  const mode = STATE.ui?.themeMode || "auto";
  let theme = "light";
  if(mode==="system"){
    theme = prefersDark.matches ? "dark" : "light";
  }else if(mode==="light"){ theme="light";
  }else if(mode==="dark"){ theme="dark";
  }else{ // auto by local time 07-19
    const hr = new Date().getHours();
    theme = (hr>=7 && hr<19) ? "light" : "dark";
  }
  document.documentElement.setAttribute("data-theme", theme);
  // update theme-color meta
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta){ meta.setAttribute("content", theme==="dark" ? "#5B7CFF" : "#2F6BFF"); }
}
prefersDark.addEventListener?.("change", applyTheme);
setInterval(()=>{ if((STATE.ui?.themeMode||"auto")==="auto") applyTheme(); }, 60*1000); // re-eval hourly-ish
if(!STATE.ui) STATE.ui={};
if(!STATE.ui.themeMode) STATE.ui.themeMode="auto";
applyTheme();

/* ---------------- DOM REFS ----------------- */
const app = $("#app");
const views = { home: $("#homeView"), phase: $("#phaseView"), timeline: $("#timelineView") };
const carousel = $("#phaseCarousel");
const dots = $("#pagerDots");
const backHome = $("#backHome");
const phaseTitleInput = $("#phaseTitleInput");
const tasksList = $("#tasksList");
const completedBlock = $("#completedBlock");
const completedList = $("#completedList");
const completedCount = $("#completedCount");
const filterRow = $("#phaseFilterRow");

/* Top/Bottom bar buttons */
$("#homeTab").addEventListener("click", ()=> location.hash="#/home");
$("#timelineTab").addEventListener("click", ()=> location.hash="#/timeline");
$("#timelineBtn").addEventListener("click", ()=> location.hash="#/timeline");

/* Kebab app menu */
const appMenu = $("#appMenu");
$("#kebabBtn").addEventListener("click", (e)=> toggleMenu(appMenu, e.currentTarget));
document.addEventListener("click", (e)=>{
  if(!appMenu.hidden && !appMenu.contains(e.target) && e.target.id!=="kebabBtn"){ appMenu.hidden=true; }
});
appMenu.addEventListener("click", (e)=>{
  const t = e.target.closest(".menu-item");
  if(!t) return;
  if(t.id==="resetData"){
    confirmDialog("Reset data and reseed?", ()=>{
      STATE = seedData(); save(); route(); showToast("Data reset");
    });
    appMenu.hidden = true;
  }else if(t.dataset.theme){
    STATE.ui.themeMode = t.dataset.theme; save(); applyTheme(); appMenu.hidden=true; showToast(`Theme: ${t.dataset.theme}`);
  }
});

/* Action Sheet (Plus) */
const actionSheet = $("#actionSheet"); const actionScrim = $("#actionScrim");
$("#plusBtn").addEventListener("click", ()=> openSheet(actionSheet, actionScrim));
$("#actionCancel").addEventListener("click", ()=> closeSheet(actionSheet, actionScrim));
actionScrim.addEventListener("click", ()=> closeSheet(actionSheet, actionScrim));
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape"){ closeSheet(actionSheet, actionScrim); closeSheet(taskSheet, taskScrim); closeDialog(); }});
/* Action handlers */
$("#actionAddPhase").addEventListener("click", ()=>{
  closeSheet(actionSheet, actionScrim);
  const p = { id: rid("p"), title:"New Phase", suspense:null, tasks:[] };
  STATE.phases.push(p); STATE.ui.selectedPhaseId = p.id; save();
  location.hash = "#/phase/"+p.id;
  setTimeout(()=>{ phaseTitleInput.focus(); phaseTitleInput.select(); }, 0);
});
$("#actionAddTask").addEventListener("click", ()=>{
  // Only open Add Task sheet if currently on phase; else ask to choose phase then navigate and open.
  if(views.phase.classList.contains("active")){
    closeSheet(actionSheet, actionScrim);
    openTaskSheet();
  }else{
    // Phase picker inline: build a temporary menu
    actionSheet.hidden = true;
    const chooser = document.createElement("div");
    chooser.className = "menu";
    chooser.style.right = "12px"; chooser.style.bottom = "74px";
    chooser.id = "phaseChooseMenu";
    chooser.innerHTML = `<div class="menu-label">Add task to…</div>` + STATE.phases.map(p=>`<button class="menu-item" data-to="${p.id}">${p.title}</button>`).join("");
    document.body.appendChild(chooser);
    const onClick = (e)=>{
      const btn = e.target.closest(".menu-item"); if(!btn) return;
      const id = btn.dataset.to; document.body.removeChild(chooser);
      document.removeEventListener("click", onOuter);
      location.hash = "#/phase/"+id;
      setTimeout(()=> openTaskSheet(), 10);
    };
    const onOuter = (e)=>{ if(!chooser.contains(e.target)){ document.body.removeChild(chooser); document.removeEventListener("click", onOuter); } };
    chooser.addEventListener("click", onClick);
    setTimeout(()=> document.addEventListener("click", onOuter), 0);
  }
});

/* Phase options menu */
const phaseMenu = $("#phaseMenu");
$("#phaseOptionsBtn").addEventListener("click", (e)=> toggleMenu(phaseMenu, e.currentTarget));
$("#renamePhase").addEventListener("click", ()=>{ phaseMenu.hidden=true; phaseTitleInput.focus(); phaseTitleInput.select(); });
$("#deletePhase").addEventListener("click", ()=>{
  phaseMenu.hidden=true;
  confirmDialog("Delete phase and all tasks? This can’t be undone.", ()=>{
    const id = STATE.ui.selectedPhaseId;
    STATE.phases = STATE.phases.filter(p=>p.id!==id);
    if(STATE.ui.selectedPhaseId===id) STATE.ui.selectedPhaseId = null;
    save(); location.hash = "#/home"; showToast("Phase deleted");
  });
});

/* ---------------- Home (Carousel) ----------------- */
function nextDue(tasks){
  const upcoming = tasks.filter(t=>!t.done && t.due).map(t=>t.due).sort();
  return upcoming[0] || null;
}
function renderHome(){
  carousel.innerHTML = ""; dots.innerHTML = "";
  const phases = STATE.phases;
  if(phases.length===0){
    const empty = document.createElement("div");
    empty.className = "card"; empty.textContent = "No phases yet. Tap + to add one.";
    carousel.appendChild(empty);
    return;
  }
  phases.forEach((p, idx)=>{
    const total = p.tasks.length;
    const done = p.tasks.filter(t=>t.done).length;
    const next = nextDue(p.tasks);
    const card = document.createElement("button");
    card.className = "card"; card.setAttribute("aria-label", p.title);
    card.addEventListener("click", ()=> location.hash = "#/phase/"+p.id);
    card.innerHTML = `
      <div class="card-title">${p.title}</div>
      <div class="card-sub">${done}/${total} complete</div>
      <div class="progress"><div class="progress-bar"><div class="progress-fill" style="width:${total?Math.round(done/total*100):0}%"></div></div></div>
      <div class="card-sub">Next: ${next || "—"}</div>
    `;
    carousel.appendChild(card);
    const dot = document.createElement("button");
    dot.className = "dot" + (idx===0?" active":""); dot.setAttribute("aria-label", `Slide ${idx+1}`);
    dot.addEventListener("click", ()=>{
      const cardW = carousel.firstElementChild.getBoundingClientRect().width + 12;
      carousel.scrollTo({left: idx*cardW, behavior:"smooth"});
    });
    dots.appendChild(dot);
  });
  // Sync dots with scroll
  carousel.addEventListener("scroll", updateDots);
  function updateDots(){
    const cardW = carousel.firstElementChild.getBoundingClientRect().width + 12;
    const idx = Math.round(carousel.scrollLeft / cardW);
    $$(".dot", dots).forEach((d,i)=> d.classList.toggle("active", i===idx));
  }
}

/* ---------------- Phase Detail ----------------- */
let filter = "all";
filterRow.addEventListener("click", (e)=>{
  const chip = e.target.closest(".chip"); if(!chip) return;
  filter = chip.dataset.filter;
  $$(".chip", filterRow).forEach(c=> c.setAttribute("aria-selected", c===chip? "true":"false"));
  renderPhase(STATE.ui.selectedPhaseId);
});
backHome.addEventListener("click", ()=> location.hash = "#/home");

phaseTitleInput.addEventListener("keydown", (e)=>{
  if(e.key==="Enter"){ e.preventDefault(); phaseTitleInput.blur(); }
  if(e.key==="Escape"){ e.preventDefault(); phaseTitleInput.value = byId(STATE.phases, STATE.ui.selectedPhaseId)?.title || ""; phaseTitleInput.blur(); }
});
phaseTitleInput.addEventListener("blur", ()=>{
  const p = byId(STATE.phases, STATE.ui.selectedPhaseId); if(!p) return;
  const v = (phaseTitleInput.value||"").trim() || "Untitled";
  if(v!==p.title){ p.title = v; saveDebounced(); renderHome(); }
});

function renderPhase(id){
  const p = byId(STATE.phases, id); if(!p) return;
  $("#appMenu").hidden = true;
  $("#phaseMenu").hidden = true;
  phaseTitleInput.value = p.title;
  // build task lists
  const tasks = sortTasks(p.tasks);
  const main = []; const done = [];
  tasks.forEach(t=> (t.done ? done : main).push(t));
  const filteredMain = applyFilter(main, filter);
  tasksList.innerHTML = "";
  filteredMain.forEach(t=> tasksList.appendChild(taskItem(p, t)));
  // Completed block
  completedList.innerHTML = "";
  done.forEach(t=> completedList.appendChild(taskItem(p, t, true)));
  completedCount.textContent = String(done.length);
  completedBlock.open = false;
}

function applyFilter(list, f){
  const today = todayISO();
  if(f==="incomplete") return list.filter(t=>!t.done);
  if(f==="completed") return list.filter(t=>t.done);
  if(f==="overdue") return list.filter(t=>!t.done && t.due && t.due < today);
  return list;
}
function sortTasks(list){
  return list.slice().sort((a,b)=>{
    if(a.done!==b.done) return a.done?1:-1;
    const ad=a.due||"", bd=b.due||"";
    if(ad&&bd){ const c=ad.localeCompare(bd); if(c) return c; }
    if(ad&&!bd) return -1; if(!ad&&bd) return 1;
    return a.title.localeCompare(b.title);
  });
}
function taskItem(phase, task, inCompleted=false){
  const wrap = document.createElement("div");
  wrap.className = "task";
  wrap.dataset.taskId = task.id;

  const row = document.createElement("div"); row.className = "row";
  // Circular checkbox
  const box = document.createElement("button");
  box.className = "check" + (task.done?" done":"");
  box.setAttribute("aria-label", task.done? "Mark incomplete":"Mark complete");
  box.textContent = task.done ? "✓" : "";
  box.addEventListener("click", ()=>{ task.done = !task.done; saveDebounced(); renderPhase(phase.id); renderHome(); showToast(task.done?"Completed":"Reopened"); });

  // Title + subline (date)
  const mid = document.createElement("div");
  const titleLine = document.createElement("div"); titleLine.className = "title-line";
  const title = document.createElement("div"); title.className = "title"+(task.done?" strike":""); title.textContent = task.title;
  title.contentEditable = "true"; title.role="textbox"; title.spellcheck = false;
  title.addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ e.preventDefault(); title.blur(); } if(e.key==="Escape"){ title.textContent = task.title; title.blur(); } });
  title.addEventListener("blur", ()=>{ const v=(title.textContent||"").trim(); if(!v){ title.textContent = task.title; return; } if(v!==task.title){ task.title=v; saveDebounced(); renderHome(); } });
  titleLine.appendChild(title);
  const chev = document.createElement("button"); chev.className = "chev"; chev.setAttribute("aria-label","Expand"); chev.textContent = "⌄";
  titleLine.appendChild(chev);
  mid.appendChild(titleLine);

  const sub = document.createElement("div"); sub.className = "subline"; sub.textContent = task.due ? `Due ${task.due}` : "No date";
  mid.appendChild(sub);

  // Right actions are the chevron
  const details = document.createElement("div"); details.className = "details";
  const ta = document.createElement("textarea"); ta.className="textarea"; ta.rows=3; ta.placeholder="Description"; ta.value = task.desc || "";
  ta.addEventListener("input", ()=>{ task.desc = ta.value; saveDebounced(); });
  const meta = document.createElement("div"); meta.className="row-meta meta";
  const date = document.createElement("input"); date.type="date"; if(task.due) date.value = task.due;
  date.addEventListener("change", ()=>{ task.due = date.value || null; sub.textContent = task.due? `Due ${task.due}` : "No date"; saveDebounced(); renderHome(); });
  const clear = document.createElement("button"); clear.className="clear-x"; clear.textContent="×"; clear.addEventListener("click", ()=>{ task.due=null; date.value=""; sub.textContent="No date"; saveDebounced(); renderHome(); });
  const del = document.createElement("button"); del.className="btn"; del.textContent="Delete";
  del.addEventListener("click", ()=>{
    confirmDialog("Delete task?", ()=>{
      const idx = phase.tasks.findIndex(t=>t.id===task.id);
      const removed = phase.tasks.splice(idx,1)[0];
      saveDebounced(); renderPhase(phase.id); renderHome();
      showToast("Task deleted", true, ()=>{ phase.tasks.splice(idx,0,removed); save(); renderPhase(phase.id); renderHome(); });
    });
  });
  meta.appendChild(date); meta.appendChild(clear); meta.appendChild(del);
  details.appendChild(ta); details.appendChild(meta);

  chev.addEventListener("click", ()=> details.classList.toggle("open"));

  row.appendChild(box); row.appendChild(mid); row.appendChild(chev);
  wrap.appendChild(row);
  wrap.appendChild(details);
  return wrap;
}

/* ---------------- Add Task Sheet (Phase Detail only) ----------------- */
const taskSheet = $("#taskSheet"); const taskScrim = $("#taskScrim");
const taskForm = $("#taskForm");
$("#taskDateClear").addEventListener("click", ()=> $("#taskDateInput").value = "");

$("#taskCancel").addEventListener("click", ()=> closeSheet(taskSheet, taskScrim));
taskScrim.addEventListener("click", ()=> closeSheet(taskSheet, taskScrim));

function openTaskSheet(){
  // Only open on phase view to satisfy overlay bug acceptance
  if(!views.phase.classList.contains("active")) return;
  $("#taskTitle").textContent = "Add Task";
  $("#taskTitleInput").value = "";
  $("#taskDateInput").value = "";
  $("#taskDescInput").value = "";
  openSheet(taskSheet, taskScrim);
  $("#taskTitleInput").focus();
}
taskForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const title = $("#taskTitleInput").value.trim(); if(!title){ $("#taskTitleInput").focus(); return; }
  const due = $("#taskDateInput").value || null;
  const desc = $("#taskDescInput").value.trim();
  const pid = STATE.ui.selectedPhaseId;
  const p = byId(STATE.phases, pid); if(!p) return;
  p.tasks.push({ id: rid("t"), title, due, desc, done:false });
  save(); closeSheet(taskSheet, taskScrim); renderPhase(pid); renderHome(); showToast("Task added");
});

/* ---------------- Sheets / Dialog helpers (scroll lock + z-index) ----------------- */
function openSheet(sheet, scrim){
  document.documentElement.classList.add("modal-open");
  scrim.hidden = false; sheet.hidden = false;
}
function closeSheet(sheet, scrim){
  scrim.hidden = true; sheet.hidden = true;
  // if no other modal, release lock
  if([$("#actionSheet"), $("#taskSheet"), $("#confirmDlg")].every(x=> x.hidden)) document.documentElement.classList.remove("modal-open");
}

/* confirm dialog */
const confirmDlg = $("#confirmDlg"); const confirmScrim = $("#confirmScrim");
let confirmOkCb = null;
function confirmDialog(msg, onOk){
  $("#confirmMsg").textContent = msg;
  document.documentElement.classList.add("modal-open");
  confirmDlg.hidden = false; confirmScrim.hidden = false;
  confirmOkCb = onOk;
}
$("#confirmOk").addEventListener("click", ()=>{ if(confirmOkCb) confirmOkCb(); closeDialog(); });
$("#confirmCancel").addEventListener("click", closeDialog);
confirmScrim.addEventListener("click", closeDialog);
function closeDialog(){
  confirmDlg.hidden = true; confirmScrim.hidden = true; confirmOkCb = null;
  if([$("#actionSheet"), $("#taskSheet"), $("#confirmDlg")].every(x=> x.hidden)) document.documentElement.classList.remove("modal-open");
}

/* Menus */
function toggleMenu(menu, anchor){
  const rect = anchor.getBoundingClientRect();
  menu.style.top = (rect.bottom + 6) + "px";
  menu.style.right = "12px";
  menu.hidden = !menu.hidden;
}

/* ---------------- Timeline ----------------- */
let timelineFilter = "all";
$("#timelineView").addEventListener("click", (e)=>{
  const chip = e.target.closest(".chip");
  if(chip && chip.dataset.tf){
    timelineFilter = chip.dataset.tf;
    $$(".chip", $("#timelineView")).forEach(c=> c.setAttribute("aria-selected", String(c===chip)));
    renderTimeline();
  }
});

function renderTimeline(){
  const list = $("#timelineList"); list.innerHTML = "";
  // Gather all dated tasks plus milestones
  const items = [];
  STATE.phases.forEach(p=>{
    p.tasks.forEach(t=>{
      if(t.due){
        items.push({ type:"task", date:t.due, title:t.title, phaseId:p.id, taskId:t.id, phaseTitle:p.title, done: t.done });
      }
    });
  });
  STATE.timeline.forEach(m=>{
    items.push({ type:"milestone", date:m.date, title:m.title, phaseId:null, taskId:null, phaseTitle:m.phase, done:m.done });
  });
  items.sort((a,b)=> a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  // Filter
  const filterTitle = timelineFilter;
  const filtered = items.filter(it=> timelineFilter==="all" ? true : (it.phaseTitle === filterTitle));
  // Group by month
  const groups = {};
  filtered.forEach(it=>{
    const y = it.date.slice(0,7); (groups[y] = groups[y] || []).push(it);
  });
  Object.keys(groups).sort().forEach(ym=>{
    const box = document.createElement("div"); box.className="month-group";
    const h = document.createElement("div"); h.className="month-title"; h.textContent = new Date(ym+"-01").toLocaleString(undefined, {year:"numeric", month:"long"});
    box.appendChild(h);
    groups[ym].forEach(it=>{
      const row = document.createElement("div"); row.className="timeline-item";
      const title = document.createElement("div"); title.className="ti-title"; title.textContent = it.title;
      const sub = document.createElement("div"); sub.className="ti-sub";
      sub.innerHTML = `<span>${it.date}</span><span>${it.phaseTitle||""}</span>`;
      row.appendChild(title); row.appendChild(sub);
      // Tap to edit if task
      if(it.type==="task"){
        row.addEventListener("click", ()=>{
          location.hash = "#/phase/"+it.phaseId;
          setTimeout(()=>{
            // Open edit for that task (expand & focus title)
            const el = $(`[data-task-id="${it.taskId}"]`, $("#phaseView"));
            if(el){
              const details = el.querySelector(".details"); details?.classList.add("open");
              const titleEl = el.querySelector(".title"); titleEl?.focus();
            }
          }, 40);
        });
      }
      box.appendChild(row);
    });
    list.appendChild(box);
  });
}

/* ---------------- Views ----------------- */
function setActive(viewName){
  Object.entries(views).forEach(([k,el])=> el.classList.toggle("active", k===viewName));
}
function openHome(){
  setActive("home"); renderHome();
}
function openPhase(id){
  STATE.ui.selectedPhaseId = id; save();
  setActive("phase"); renderPhase(id);
}
function openTimeline(){
  setActive("timeline"); renderTimeline();
}

/* ---------------- Toast ----------------- */
const toast = $("#toast"); const toastMsg = $("#toastMsg"); const toastUndo = $("#toastUndo");
let toastTimer=null; let undoFn=null;
function showToast(msg, undoCb=null){
  toastMsg.textContent = msg; toast.hidden = false;
  undoFn = undoCb; toastUndo.hidden = !undoCb;
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>{ toast.hidden=true; toastUndo.hidden=true; }, 4000);
}
toastUndo.addEventListener("click", ()=>{ if(undoFn) undoFn(); toast.hidden=true; toastUndo.hidden=true; });

/* ---------------- Init ----------------- */
route(); // initial render
renderHome();
