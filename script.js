/* easyPCS – mobile-first checklist PWA
 * - Vanilla JS, localStorage persistence
 * - Views: Home (bins), Phase Detail (tasks), Master Timeline
 * - Inline editing, circular checkboxes, undo toast
 * - Hash router: #/home | #/phase/<id> | #/timeline
 * - Seed data injected via seedData() if storage empty; Reset Data dev option included
 */

// -------------------------- Storage / State --------------------------
const STORAGE_KEY = "pcsChecklist.v1"; // as requested
let state = null;
let saveTimer = null;

function saveStateDebounced(){ clearTimeout(saveTimer); saveTimer = setTimeout(saveState, 120); }
function saveState(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ console.warn("save failed", e);} }

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

// Seed data per spec
function seedData(){
  const seeded = {
    phases: [
      {
        id: "p1",
        title: "Pre‑Departure",
        suspense: "2025-09-23",
        tasks: [
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
          { id:"t14", title:"(Optional) Use AOI orders for HHG/Passenger Travel scheduling — cannot depart without amendment validating FMTS/security clearance", due:"2025-09-10", desc:"", done:false }
        ]
      },
      {
        id: "p2",
        title: "Mid Prep",
        suspense: "2025-11-30",
        tasks: [
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
          { id:"t14", title:"If traveling different routing: submit Circuitous Travel Memo", due:"2025-11-12", desc:"", done:false }
        ]
      },
      {
        id: "p3",
        title: "Final Out",
        suspense: "2025-12-19",
        tasks: [
          { id:"t1", title:"CSS Outprocessing – 1 duty day before MPF", due:"2025-12-18", desc:"", done:false },
          { id:"t2", title:"Final Out Appointment (MPF) – WaitWhile; bring all docs", due:"2025-12-19", desc:"Checklist: PCS Orders (verified), Certified SOES/SGLI, 2x Relocation Memos (signed), vOP Checklist (all cleared), Immunizations Memo, Security Clearance Memo", done:false },
          { id:"t3", title:"Port Call (Passenger Travel) – upload orders to PTA, confirm flight", due:"2025-12-10", desc:"", done:false },
          { id:"t4", title:"Finance Outprocessing (CPTS) – DLA, travel voucher, GTC usage", due:"2025-12-19", desc:"", done:false }
        ]
      },
      {
        id: "p4",
        title: "Arrival (Hill AFB)",
        suspense: "2026-01-31",
        tasks: [
          { id:"t1", title:"Report to unit CSS within 24 hrs", due:"2026-01-02", desc:"", done:false },
          { id:"t2", title:"In‑process Finance (update BAH, COLA, etc.)", due:"2026-01-05", desc:"", done:false },
          { id:"t3", title:"In‑process Medical at Hill AFB Clinic", due:"2026-01-05", desc:"", done:false },
          { id:"t4", title:"Update DEERS/Tricare with new address", due:"2026-01-06", desc:"", done:false },
          { id:"t5", title:"Secure housing (on/off base)", due:"2026-01-15", desc:"", done:false },
          { id:"t6", title:"School/childcare enrollment for dependents", due:"2026-01-10", desc:"", done:false }
        ]
      }
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
      { date:"2026-01-31", title:"Report to Hill AFB by RNLTD 31 Jan; in‑process unit, finance, housing, medical", phase:"Arrival (Hill AFB)", done:false }
    ],
    ui: { selectedPhaseId: null, completedCollapsed: {}, timelineFilter:"all" },
    version: 1
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function ensureState(){
  state = loadState();
  if(!state) state = seedData();
}
ensureState();

// -------------------------- Helpers --------------------------
const $ = (sel, root=document)=> root.querySelector(sel);
const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));
const byId = (id)=> state.phases.find(p=>p.id===id);
const todayISO = ()=> new Date().toISOString().slice(0,10);

function newId(prefix){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`; }
function nearestDue(tasks){
  const today = todayISO();
  const dates = tasks.filter(t=>!t.done && t.due).map(t=>t.due);
  if(dates.length===0) return null;
  dates.sort(); // ISO sorts naturally
  for(const d of dates){ if(d >= today) return d; }
  return dates[dates.length-1]; // only past due dates
}

function sortTasks(tasks){
  // Incomplete first → due asc → title
  return [...tasks].sort((a,b)=>{
    if(a.done !== b.done) return a.done ? 1 : -1;
    const ad = a.due || ""; const bd = b.due || "";
    if(ad && bd){ const c = ad.localeCompare(bd); if(c) return c; }
    if(ad && !bd) return -1;
    if(!ad && bd) return 1;
    return a.title.localeCompare(b.title);
  });
}

// -------------------------- Router --------------------------
let view = "home"; // home | phase | timeline
let currentPhaseId = null;
let homeScroll = 0;

function setView(v, arg){
  view = v;
  $("#homeView").classList.toggle("active", v==="home");
  $("#phaseView").classList.toggle("active", v==="phase");
  $("#timelineView").classList.toggle("active", v==="timeline");

  // Header controls
  $("#backBtn").hidden = (v==="home");
  $("#homeAddPhaseBtn").hidden = (v!=="home");
  $("#timelineBtn").hidden = false; // always visible to jump
  $("#appTitle").textContent = v==="timeline" ? "easyPCS — Master Timeline" : "easyPCS";

  // Render appropriate view
  if(v==="home"){
    renderHome();
    requestAnimationFrame(()=> window.scrollTo(0, homeScroll));
  }else if(v==="phase"){
    currentPhaseId = arg;
    renderPhase(arg);
  }else{
    renderTimeline();
  }
}

function navigateHash(){
  const h = location.hash || "#/home";
  if(h.startsWith("#/phase/")){
    const id = h.split("/")[2];
    setView("phase", id);
  }else if(h==="#/timeline"){
    setView("timeline");
  }else{
    setView("home");
  }
}
window.addEventListener("hashchange", navigateHash);

// Header actions
$("#timelineBtn").addEventListener("click", ()=> location.hash = "#/timeline");
$("#homeAddPhaseBtn").addEventListener("click", addPhase);
$("#emptyAddPhase").addEventListener("click", addPhase);
$("#backBtn").addEventListener("click", ()=> { homeScroll = window.scrollY; location.hash = "#/home"; });

// Overflow menu (dev)
const overflowBtn = $("#overflowBtn");
const overflowMenu = $("#overflowMenu");
overflowBtn.addEventListener("click", (e)=>{
  overflowMenu.hidden = !overflowMenu.hidden;
  const r = e.target.getBoundingClientRect();
  overflowMenu.style.top = (r.bottom) + "px";
  overflowMenu.style.right = "12px";
});
document.addEventListener("click", (e)=>{
  if(!overflowMenu.hidden && !overflowMenu.contains(e.target) && e.target!==overflowBtn){
    overflowMenu.hidden = true;
  }
});
$("#resetDataBtn").addEventListener("click", ()=>{
  if(confirm("Reset data to the seeded set? This will erase current progress.")){
    state = seedData();
    renderHome();
    if(view==="timeline") renderTimeline();
    if(view==="phase" && currentPhaseId) renderPhase(currentPhaseId);
    showToast("Data reset");
  }
});

// -------------------------- Toast --------------------------
const toast = $("#toast");
const toastMsg = $("#toastMsg");
const toastUndo = $("#toastUndo");
let undoFn = null;
let toastTimer = null;
function showToast(msg, undo=null){
  toastMsg.textContent = msg;
  undoFn = undo;
  toastUndo.hidden = !undo;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 5000);
}
function hideToast(){ toast.classList.add("hidden"); toastMsg.textContent=""; toastUndo.hidden=true; undoFn=null; }
toastUndo.addEventListener("click", ()=>{ if(undoFn) undoFn(); hideToast(); });

// -------------------------- Home (Phases) --------------------------
function renderHome(){
  const grid = $("#phaseGrid");
  grid.innerHTML = "";
  $("#homeEmpty").hidden = state.phases.length !== 0;

  state.phases.forEach(p=>{
    const total = p.tasks.length;
    const done = p.tasks.filter(t=>t.done).length;
    const due = nearestDue(p.tasks);
    const pct = total ? Math.round(done/total*100) : 0;

    const card = document.createElement("button");
    card.className = "card phase-card";
    card.setAttribute("aria-label", `Open ${p.title}`);
    card.addEventListener("click", ()=>{
      homeScroll = window.scrollY;
      location.hash = "#/phase/" + p.id;
    });

    const title = document.createElement("div");
    title.className = "p-title";
    title.textContent = p.title;

    const row = document.createElement("div");
    row.className = "p-row";
    const count = document.createElement("div");
    count.className = "p-count";
    count.textContent = `${done}/${total}`;
    const next = document.createElement("div");
    next.className = "p-due";
    next.textContent = due ? `Next: ${due}` : "No dates";

    const prog = document.createElement("div");
    prog.className = "progress";
    const bar = document.createElement("div"); bar.className = "progress-bar";
    const fill = document.createElement("div"); fill.className = "progress-fill"; fill.style.width = pct + "%";
    bar.appendChild(fill); prog.appendChild(bar);

    row.appendChild(count); row.appendChild(next);
    card.appendChild(title);
    card.appendChild(row);
    card.appendChild(prog);

    grid.appendChild(card);
  });
}

function addPhase(){
  const p = { id: newId("p"), title:"New Phase", suspense:null, tasks:[] };
  state.phases.push(p);
  saveState(); renderHome();
  // Jump in and focus title for rename
  setTimeout(()=>{
    location.hash = "#/phase/" + p.id;
    setTimeout(()=>{ const inp=$("#phaseTitleInput"); if(inp){ inp.focus(); inp.select(); } }, 50);
  }, 0);
}

// -------------------------- Phase Detail --------------------------
const phaseTitleInput = $("#phaseTitleInput");
const phaseOptionsBtn = $("#phaseOptionsBtn");
const phaseOptionsMenu = $("#phaseOptionsMenu");
const renamePhaseBtn = $("#renamePhaseBtn");
const deletePhaseBtn = $("#deletePhaseBtn");
const completedBlock = $("#completedBlock");
const completedToggle = $("#completedToggle");
const completedCountEl = $("#completedCount");
const completedList = $("#completedList");

phaseOptionsBtn.addEventListener("click", (e)=>{
  phaseOptionsMenu.hidden = !phaseOptionsMenu.hidden;
  const r = e.target.getBoundingClientRect();
  phaseOptionsMenu.style.top = (r.bottom)+"px"; phaseOptionsMenu.style.right = "12px";
});
document.addEventListener("click", (e)=>{
  if(!phaseOptionsMenu.hidden && !phaseOptionsMenu.contains(e.target) && e.target!==phaseOptionsBtn){
    phaseOptionsMenu.hidden = true;
  }
});
renamePhaseBtn.addEventListener("click", ()=>{ phaseTitleInput.focus(); phaseOptionsMenu.hidden=true; });
deletePhaseBtn.addEventListener("click", ()=>{
  phaseOptionsMenu.hidden = true;
  const ph = byId(currentPhaseId); if(!ph) return;
  if(confirm("Delete phase and all tasks? This can’t be undone.")){
    const snap = JSON.stringify(ph);
    state.phases = state.phases.filter(x=>x.id!==ph.id);
    saveState();
    showToast("Phase deleted", ()=>{
      // Undo
      state.phases.push(JSON.parse(snap)); saveState(); renderHome();
    });
    location.hash = "#/home";
  }
});

// Add Task FAB
$("#addTaskFab").addEventListener("click", ()=> openTaskSheet({mode:"create", phaseId: currentPhaseId}));

function renderPhase(phaseId){
  const ph = byId(phaseId);
  if(!ph){ location.hash="#/home"; return; }
  phaseTitleInput.value = ph.title;

  // Title edit behavior
  phaseTitleInput.onkeydown = (e)=>{
    if(e.key==="Enter") phaseTitleInput.blur();
    if(e.key==="Escape"){ phaseTitleInput.value = ph.title; phaseTitleInput.blur(); }
  };
  phaseTitleInput.onblur = ()=>{
    const val = (phaseTitleInput.value||"").trim() || "Untitled";
    if(val !== ph.title){ ph.title = val; saveStateDebounced(); renderHome(); }
  };

  // Build tasks list
  const cont = $("#tasksList"); cont.innerHTML = "";
  const sorted = sortTasks(ph.tasks);

  // Incomplete
  const open = sorted.filter(t=>!t.done);
  const completed = sorted.filter(t=>t.done);
  $("#phaseEmpty").hidden = (sorted.length !== 0);

  open.forEach(t => cont.appendChild(taskItem(ph, t)));

  // Completed expander
  completedCountEl.textContent = `(${completed.length})`;
  completedBlock.classList.toggle("hidden", completed.length===0);
  completedList.innerHTML = "";
  const collapsed = !!state.ui?.completedCollapsed?.[ph.id];
  completedList.style.display = collapsed ? "none" : "grid";
  completedToggle.textContent = (collapsed ? "Show " : "Hide ") + "Completed ";
  completedToggle.appendChild(completedCountEl);
  completedToggle.onclick = ()=>{
    state.ui.completedCollapsed = state.ui.completedCollapsed || {};
    state.ui.completedCollapsed[ph.id] = !collapsed;
    saveState();
    renderPhase(ph.id);
  };
  completed.forEach(t => completedList.appendChild(taskItem(ph, t)));
}

function taskItem(phase, task){
  const wrap = document.createElement("div"); wrap.className = "task"; wrap.dataset.id = task.id;

  const row = document.createElement("div"); row.className = "task-row";

  // Checkbox
  const check = document.createElement("button");
  check.className = "circle" + (task.done ? " done": "");
  check.setAttribute("aria-label", task.done ? "Mark incomplete" : "Mark complete");
  check.innerHTML = task.done ? "✓" : "";
  check.onclick = ()=>{
    task.done = !task.done; saveStateDebounced(); renderPhase(phase.id); renderHome();
  };

  // Main text
  const main = document.createElement("div"); main.className = "t-main";
  const title = document.createElement("div"); title.className = "t-title" + (task.done?" strike":"");
  title.textContent = task.title;
  title.contentEditable = "true";
  title.role = "textbox";
  title.onkeydown = (e)=>{ if(e.key==="Enter"){ e.preventDefault(); title.blur(); } if(e.key==="Escape"){ title.textContent = task.title; title.blur(); } };
  title.onblur = ()=>{ const v = (title.textContent||"").trim(); if(v && v !== task.title){ task.title = v; saveStateDebounced(); renderHome(); } else { title.textContent = task.title; } };
  const sub = document.createElement("div"); sub.className = "t-date"; sub.textContent = task.due ? `Due: ${task.due}` : "No date";
  main.appendChild(title); main.appendChild(sub);

  // Expand
  const exp = document.createElement("button"); exp.className = "expand"; exp.textContent = "⋯";
  const desc = document.createElement("div"); desc.className = "desc";
  const ta = document.createElement("textarea"); ta.rows = 3; ta.placeholder="Notes…"; ta.value = task.desc||"";
  ta.oninput = ()=>{ task.desc = ta.value; saveStateDebounced(); };
  const tools = document.createElement("div"); tools.style.display="flex"; tools.style.gap="8px"; tools.style.marginTop="8px";
  const date = document.createElement("input"); date.type="date"; date.className="input"; date.value = task.due || "";
  date.onchange = ()=>{ task.due = date.value || null; saveStateDebounced(); renderPhase(phase.id); renderHome(); };
  const clear = document.createElement("button"); clear.className="btn subtle"; clear.textContent="Clear date"; clear.onclick = ()=>{ task.due=null; date.value=""; saveStateDebounced(); renderPhase(phase.id); showToast("Date cleared"); };
  const del = document.createElement("button"); del.className="btn danger"; del.textContent="Delete"; del.onclick = ()=>{
    if(confirm("Delete task?")){
      const idx = phase.tasks.findIndex(x=>x.id===task.id);
      const removed = phase.tasks.splice(idx,1)[0];
      saveState(); renderPhase(phase.id); renderHome();
      showToast("Task deleted", ()=>{ phase.tasks.splice(idx,0,removed); saveState(); renderPhase(phase.id); renderHome(); });
    }
  };
  tools.appendChild(date); tools.appendChild(clear); tools.appendChild(del);
  desc.appendChild(ta); desc.appendChild(tools);

  let open = false;
  exp.onclick = ()=>{ open = !open; desc.classList.toggle("open", open); };

  row.appendChild(check); row.appendChild(main); row.appendChild(exp);
  wrap.appendChild(row); wrap.appendChild(desc);
  return wrap;
}

// -------------------------- Task Sheet (create/edit) --------------------------
const sheet = $("#taskSheet");
const sheetScrim = $("#sheetScrim");
const sheetPhase = $("#sheetPhase");
const sheetTitleInput = $("#sheetTitleInput");
const sheetDate = $("#sheetDate");
const sheetDateClear = $("#sheetDateClear");
const sheetDesc = $("#sheetDesc");
const sheetSave = $("#sheetSave");
const sheetCancel = $("#sheetCancel");
const sheetClose = $("#sheetClose");

let sheetCtx = { mode:"create", phaseId:null, taskId:null };

function openTaskSheet(ctx){
  sheetCtx = ctx;
  sheetPhase.innerHTML = "";
  state.phases.forEach(p=>{
    const opt = document.createElement("option");
    opt.value = p.id; opt.textContent = p.title;
    if(ctx.phaseId === p.id) opt.selected = true;
    sheetPhase.appendChild(opt);
  });
  if(ctx.mode==="edit"){
    $("#sheetTitle").textContent = "Edit Task";
    const ph = byId(ctx.phaseId);
    const t = ph?.tasks.find(x=>x.id===ctx.taskId);
    sheetTitleInput.value = t?.title || "";
    sheetDate.value = t?.due || "";
    sheetDesc.value = t?.desc || "";
  }else{
    $("#sheetTitle").textContent = "Add Task";
    sheetTitleInput.value = ""; sheetDate.value = ""; sheetDesc.value = "";
  }
  sheetScrim.hidden = false; sheet.hidden = false;
  sheetTitleInput.focus();
}
function closeTaskSheet(){ sheetScrim.hidden = true; sheet.hidden = true; }

sheetDateClear.addEventListener("click", ()=>{ sheetDate.value = ""; });
sheetCancel.addEventListener("click", closeTaskSheet);
sheetClose.addEventListener("click", closeTaskSheet);
sheetScrim.addEventListener("click", closeTaskSheet);
sheetSave.addEventListener("click", ()=>{
  const title = (sheetTitleInput.value||"").trim();
  if(!title){ sheetTitleInput.focus(); return; }
  const due = sheetDate.value || null;
  const desc = sheetDesc.value.trim();
  const pid = sheetPhase.value;
  const ph = byId(pid); if(!ph) return;

  if(sheetCtx.mode==="edit"){
    const t = ph.tasks.find(x=>x.id===sheetCtx.taskId);
    if(!t) return;
    t.title = title; t.due = due; t.desc = desc;
  }else{
    ph.tasks.push({ id: newId("t"), title, due, desc, done:false });
  }
  saveState(); closeTaskSheet();
  if(view==="phase") renderPhase(currentPhaseId);
  if(view==="timeline") renderTimeline();
  renderHome();
  showToast("Saved");
});

// -------------------------- Timeline --------------------------
const timelineList = $("#timelineList");
const timelineFilterChips = $$(".chip", $("#timelineView"));
timelineFilterChips.forEach(ch => ch.addEventListener("click", ()=>{
  timelineFilterChips.forEach(c => c.setAttribute("aria-selected","false"));
  ch.setAttribute("aria-selected","true");
  state.ui.timelineFilter = ch.dataset.tf; saveState(); renderTimeline();
}));

function gatherDatedItems(){
  const items = [];
  // tasks with due dates
  state.phases.forEach(ph => {
    ph.tasks.forEach(t => {
      if(t.due){
        items.push({ type:"task", date:t.due, title:t.title, phaseId: ph.id, taskId: t.id, phaseTitle: ph.title, done: t.done });
      }
    });
  });
  // seeded milestones
  state.timeline.forEach(m => {
    items.push({ type:"milestone", date:m.date, title:m.title, phaseLabel:m.phase, done:m.done });
  });
  // sort by date asc then title
  items.sort((a,b)=> a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  return items;
}

function renderTimeline(){
  const all = gatherDatedItems();
  const filter = state.ui.timelineFilter || "all";
  const filtered = all.filter(it => {
    if(filter==="all") return true;
    if(it.type==="task"){
      const ph = byId(it.phaseId);
      return ph?.title === filter;
    }else{
      return it.phaseLabel === filter;
    }
  });

  timelineList.innerHTML = "";
  $("#timelineEmpty").hidden = filtered.length !== 0;

  // Group by month
  const byMonth = {};
  filtered.forEach(it => {
    const key = it.date.slice(0,7); // YYYY-MM
    byMonth[key] = byMonth[key] || [];
    byMonth[key].push(it);
  });

  Object.keys(byMonth).sort().forEach(month => {
    const group = document.createElement("div"); group.className = "tl-group";
    const h = document.createElement("div"); h.className = "tl-month"; h.textContent = month;
    group.appendChild(h);

    byMonth[month].forEach(it => {
      const row = document.createElement("div"); row.className = "tl-item";

      const d = document.createElement("div"); d.className = "tl-date"; d.textContent = it.date;
      const title = document.createElement("div"); title.className = "tl-title";
      title.textContent = it.title + (it.type==="task" ? ` — ${byId(it.phaseId)?.title || ""}` : (it.phaseLabel ? ` — ${it.phaseLabel}` : ""));
      const edit = document.createElement("button"); edit.className = "tl-edit"; edit.textContent = "✎";
      edit.title = "Edit";
      edit.onclick = ()=>{
        if(it.type==="task"){
          openTaskSheet({ mode:"edit", phaseId: it.phaseId, taskId: it.taskId });
        }else{
          alert("Milestones are read-only in this version.");
        }
      };

      row.appendChild(d); row.appendChild(title); row.appendChild(edit);
      group.appendChild(row);
    });

    timelineList.appendChild(group);
  });
}

// -------------------------- Boot --------------------------
navigateHash();
renderHome();
/* End easyPCS */
