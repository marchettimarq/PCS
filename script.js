
/* easyPCS – minimal working build with modal manager & carousel.
 * This focuses on the bug you're seeing: stuck overlays & sheets stacking.
 * - Only one modal at a time (sheet or dialog).
 * - Body scroll locks via html.modal-open while open.
 * - Add Task sheet opens ONLY on Phase Detail.
 * - On Home, + shows action sheet. Choosing 'Add Task' navigates to phase then opens sheet.
 * - No literal 'Phase' label anywhere.
*/

const LS_KEY = "pcsChecklist.v1";

/* ---------- Seed Data from the spec (trimmed to essentials but structured) ---------- */
function seedData(){
  return {
    version: 1,
    phases: [
      { id:"p1", title:"Pre‑Departure", suspense:"2025-09-23", tasks:[
        {id:"t1",title:"Complete Initial Assignment Briefing in vMPF (within 7 days of RIP)",due:"2025-08-15",desc:"",done:false},
        {id:"t2",title:"Fill out and upload Assignment Information Worksheet",due:"2025-09-23",desc:"",done:false},
        {id:"t3",title:"Verify dependents in DEERS / print DD 1172-2",due:"2025-09-23",desc:"",done:false},
        {id:"t4",title:"Complete SOES/SGLI update in milConnect; print certified copy",due:"2025-09-23",desc:"",done:false},
        {id:"t5",title:"Start FMTS and Initial Travel Screening Questionnaire (ITSQ)",due:"2025-09-23",desc:"",done:false},
        {id:"t6",title:"Schedule/complete Immunizations Memo (86 MDG Immunizations)",due:"2025-09-23",desc:"",done:false},
        {id:"t7",title:"Obtain Security Clearance Memorandum from unit Security Manager (SECRET; validate in DISS)",due:"2025-09-23",desc:"",done:false},
        {id:"t8",title:"Check retainability requirement; start with CSS; obtain signed Retention memo",due:"2025-09-23",desc:"",done:false},
        {id:"t9",title:"If dependents, complete DAF 965 Overseas Tour Election (only if required)",due:"2025-09-23",desc:"",done:false},
        {id:"t10",title:"If TDY enroute, attach RIP + funding info",due:"2025-09-23",desc:"",done:false},
        {id:"t11",title:"If carrying firearms, record POF details (Make/Model/Serial)",due:"2025-09-23",desc:"",done:false},
        {id:"t12",title:"(Optional) Sign AOI Acknowledgement Memo",due:"2025-09-01",desc:"",done:false},
        {id:"t13",title:"(Optional) Upload Assignment Worksheet, medical clearance initiation screenshot, DD1172-2",due:"2025-09-01",desc:"",done:false},
        {id:"t14",title:"(Optional) Use AOI orders for HHG/Passenger Travel scheduling — cannot depart without amendment validating FMTS/security clearance",due:"2025-09-10",desc:"",done:false}
      ]},
      { id:"p2", title:"Mid Prep", suspense:"2025-11-30", tasks:[
        {id:"t1",title:"VIPER Folder – upload all required docs; CSS marks 'In Person Final Out Ready – Submitted to MPF.'",due:"2025-11-15",desc:"",done:false},
        {id:"t2",title:"Relocation Processing Memorandum",due:"2025-11-10",desc:"",done:false},
        {id:"t3",title:"Weapons training current (AF 522 if required)",due:"2025-10-31",desc:"",done:false},
        {id:"t4",title:"Security debrief / badge turn‑in",due:"2025-11-30",desc:"",done:false},
        {id:"t5",title:"Family Care Plan (AF 357) if single parent/mil‑to‑mil",due:"2025-10-15",desc:"",done:false},
        {id:"t6",title:"GTC active / mission‑critical",due:"2025-10-01",desc:"",done:false},
        {id:"t7",title:"AT/FP Brief (not required CONUS)",due:"2025-11-10",desc:"",done:false},
        {id:"t8",title:"Fitness file closed/hand‑carried if applicable",due:"2025-11-20",desc:"",done:false},
        {id:"t9",title:"Route for CC/DO/CCF/First Sgt signature",due:"2025-11-25",desc:"",done:false},
        {id:"t10",title:"Virtual Outprocessing (vMPF) – complete all items except Outbound Assignments",due:"2025-11-20",desc:"",done:false},
        {id:"t11",title:"Physical Fitness valid through 2026‑01‑31 (retest if due)",due:"2025-11-15",desc:"",done:false},
        {id:"t12",title:"Orders Review – dependents, RNLTD, remarks",due:"2025-11-10",desc:"",done:false},
        {id:"t13",title:"Household Goods (TMO) – after orders/AOI, schedule pack‑out",due:"2025-11-05",desc:"",done:false},
        {id:"t14",title:"If traveling different routing: submit Circuitous Travel Memo",due:"2025-11-12",desc:"",done:false}
      ]},
      { id:"p3", title:"Final Out", suspense:"2025-12-19", tasks:[
        {id:"t1",title:"CSS Outprocessing – 1 duty day before MPF",due:"2025-12-18",desc:"",done:false},
        {id:"t2",title:"Final Out Appointment (MPF) – WaitWhile; bring all docs",due:"2025-12-19",desc:"Checklist...",done:false},
        {id:"t3",title:"Port Call (Passenger Travel)",due:"2025-12-10",desc:"",done:false},
        {id:"t4",title:"Finance Outprocessing (CPTS) – DLA, travel voucher, GTC usage",due:"2025-12-19",desc:"",done:false}
      ]},
      { id:"p4", title:"Arrival (Hill AFB)", suspense:"2026-01-31", tasks:[
        {id:"t1",title:"Report to unit CSS within 24 hrs",due:"2026-01-02",desc:"",done:false},
        {id:"t2",title:"In‑process Finance (update BAH, COLA, etc.)",due:"2026-01-05",desc:"",done:false},
        {id:"t3",title:"In‑process Medical at Hill AFB Clinic",due:"2026-01-05",desc:"",done:false},
        {id:"t4",title:"Update DEERS/Tricare with new address",due:"2026-01-06",desc:"",done:false},
        {id:"t5",title:"Secure housing (on/off base)",due:"2026-01-15",desc:"",done:false},
        {id:"t6",title:"School/childcare enrollment for dependents",due:"2026-01-10",desc:"",done:false}
      ]}
    ],
    timeline: [
      {date:"2025-07-15",title:"Assignment notification RIP issued",phase:null,done:true},
      {date:"2025-08-15",title:"Initial assignment briefing complete",phase:"Pre‑Departure",done:true},
      {date:"2025-09-23",title:"Document suspense due",phase:"Pre‑Departure",done:false},
      {date:"2025-11-15",title:"Relocation Memo routing / vOP / fitness",phase:"Mid Prep",done:false},
      {date:"2025-12-18",title:"CSS Outprocessing",phase:"Final Out",done:false},
      {date:"2025-12-19",title:"MPF Final Out appointment",phase:"Final Out",done:false},
      {date:"2026-01-31",title:"Report by RNLTD",phase:"Arrival (Hill AFB)",done:false}
    ],
    ui:{selectedPhaseId:"p1", theme:"auto"}
  };
}

function loadState(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw){ const s = seedData(); localStorage.setItem(LS_KEY, JSON.stringify(s)); return s; }
  try{ return JSON.parse(raw); }catch(e){ const s=seedData(); localStorage.setItem(LS_KEY, JSON.stringify(s)); return s; }
}
let state = loadState();
let saveTimer = null;
function save(){ clearTimeout(saveTimer); saveTimer=setTimeout(()=>localStorage.setItem(LS_KEY, JSON.stringify(state)),120); }

/* ---------- Theme engine (Auto/System/Light/Dark) ---------- */
function applyTheme(){
  let mode = state.ui?.theme || "auto";
  if(mode==="system"){
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    document.documentElement.classList.toggle("dark", mq.matches);
  }else if(mode==="auto"){
    const h = new Date().getHours();
    const dark = !(h>=7 && h<19);
    document.documentElement.classList.toggle("dark", dark);
  }else{
    document.documentElement.classList.toggle("dark", mode==="dark");
  }
}
applyTheme();

/* ---------- Routing ---------- */
const views = {
  home: document.getElementById("view-home"),
  phase: document.getElementById("view-phase"),
  timeline: document.getElementById("view-timeline")
};
function show(view){
  Object.values(views).forEach(v=>v.classList.remove("active"));
  views[view].classList.add("active");
  if(view==="home") renderHome();
  if(view==="phase") renderPhase(state.ui.selectedPhaseId);
  if(view==="timeline") renderTimeline();
  location.hash = `/${view}` + (view==="phase"?`/${state.ui.selectedPhaseId}`:"");
}
window.addEventListener("hashchange", ()=>{
  const parts = location.hash.slice(2).split("/");
  if(parts[0]==="phase" && parts[1]){ state.ui.selectedPhaseId = parts[1]; show("phase"); }
  else if(parts[0]==="timeline"){ show("timeline"); }
  else{ show("home"); }
});

/* ---------- Modal manager (prevents stacking bugs) ---------- */
const scrim = document.getElementById("scrim");
const sheetActions = document.getElementById("sheetActions");
const sheetTask = document.getElementById("sheetTask");
const dialogConfirm = document.getElementById("dialogConfirm");
let openModalEl = null;
function openModal(el){
  if(openModalEl) closeModal();
  openModalEl = el;
  scrim.hidden = false;
  el.hidden = false;
  document.documentElement.classList.add("modal-open");
  // Esc to close
  document.addEventListener("keydown", escListener);
}
function escListener(e){ if(e.key==="Escape") closeModal(); }
function closeModal(){
  [sheetActions, sheetTask, dialogConfirm].forEach(x=>x.hidden=true);
  scrim.hidden = true;
  document.documentElement.classList.remove("modal-open");
  document.removeEventListener("keydown", escListener);
  openModalEl = null;
}
scrim.addEventListener("click", closeModal);

/* ---------- Home (carousel) ---------- */
const carousel = document.getElementById("carousel");
const pager = document.getElementById("pager");
function nearestDue(tasks){
  const upcoming = tasks.filter(t=>t.due && !t.done).map(t=>t.due).sort();
  return upcoming[0] || "—";
}
function renderHome(){
  carousel.innerHTML = "";
  pager.innerHTML = "";
  state.phases.forEach((p, idx)=>{
    const total = p.tasks.length;
    const done = p.tasks.filter(t=>t.done).length;
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = `<h3>${p.title}</h3>
      <div class="meta">${done}/${total} complete</div>
      <div class="progress"><div style="width:${total?Math.round(done/total*100):0}%"></div></div>
      <div class="meta">Next: ${nearestDue(p.tasks)}</div>`;
    card.addEventListener("click", ()=>{ state.ui.selectedPhaseId=p.id; save(); show("phase"); });
    carousel.appendChild(card);
    const dot = document.createElement("div"); dot.className="dot"+(idx===0?" active":""); pager.appendChild(dot);
  });
  // pager binding
  carousel.addEventListener("scroll", ()=>{
    const w = carousel.getBoundingClientRect().width;
    const x = carousel.scrollLeft;
    const i = Math.round(x/(w*0.86 + 12)); // approximate
    [...pager.children].forEach((d,idx)=>d.classList.toggle("active", idx===i));
  }, {passive:true});
}

/* ---------- Phase detail ---------- */
const backHome = document.getElementById("backHome");
document.getElementById("btnTimeline").addEventListener("click", ()=>show("timeline"));
document.getElementById("tabHome").addEventListener("click", ()=>show("home"));
document.getElementById("tabTimeline").addEventListener("click", ()=>show("timeline"));
backHome.addEventListener("click", ()=>show("home"));

const phaseTitle = document.getElementById("phaseTitle");
const taskList = document.getElementById("taskList");
const completedWrap = document.getElementById("completedWrap");

function renderPhase(id){
  const p = state.phases.find(x=>x.id===id); if(!p){ show("home"); return; }
  phaseTitle.value = p.title;
  // tasks sort: incomplete first, then due ascending, then title
  const incomplete = p.tasks.filter(t=>!t.done).sort(sortTasks);
  const complete = p.tasks.filter(t=>t.done).sort(sortTasks);
  taskList.innerHTML = ""; completedWrap.innerHTML = "";

  if(incomplete.length===0){ taskList.innerHTML = "<div class='meta'>No tasks yet. Tap ＋ to add one.</div>"; }
  incomplete.forEach(t=> taskList.appendChild(taskItem(p,t)));

  if(complete.length){
    const exp = document.createElement("details"); exp.open = false;
    const sum = document.createElement("summary"); sum.textContent = `Completed (${complete.length})`;
    exp.appendChild(sum);
    const div = document.createElement("div");
    complete.forEach(t=> div.appendChild(taskItem(p,t)));
    exp.appendChild(div);
    completedWrap.appendChild(exp);
  }
}

function sortTasks(a,b){
  const ad = a.due||""; const bd=b.due||"";
  if(ad && bd){ const c=ad.localeCompare(bd); if(c) return c; }
  if(ad && !bd) return -1; if(!ad && bd) return 1;
  return a.title.localeCompare(b.title);
}

function taskItem(phase, t){
  const el = document.createElement("div"); el.className="task";
  const row = document.createElement("div"); row.className="row";
  const chk = document.createElement("button"); chk.className="chk"+(t.done?" done":""); chk.setAttribute("aria-label","Toggle complete"); chk.textContent = t.done?"✓":"";
  chk.addEventListener("click", ()=>{ t.done=!t.done; save(); renderPhase(phase.id); renderHome(); });
  const mid = document.createElement("div");
  const ttl = document.createElement("div"); ttl.className="t-title"; ttl.contentEditable="true"; ttl.textContent = t.title;
  ttl.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); ttl.blur(); } if(e.key==="Escape"){ ttl.textContent=t.title; ttl.blur(); } });
  ttl.addEventListener("blur", ()=>{ const v=ttl.textContent.trim(); if(v){ t.title=v; save(); renderHome(); } else { ttl.textContent=t.title; } });
  const sub = document.createElement("div"); sub.className="t-sub"; sub.textContent = t.due ? `Due: ${t.due}` : "No date";
  mid.appendChild(ttl); mid.appendChild(sub);
  const chev = document.createElement("button"); chev.className="chev"; chev.textContent="▾";
  row.appendChild(chk); row.appendChild(mid); row.appendChild(chev);
  const details = document.createElement("div"); details.className="details";
  details.innerHTML = `<label>Due date <input type="date" value="${t.due||""}"></label>
  <label>Description <textarea rows="3">${t.desc||""}</textarea></label>
  <div style="display:flex;gap:8px;justify-content:flex-end">
    <button class="btn" data-act="close">Close</button>
    <button class="btn danger" data-act="delete">Delete</button>
  </div>`;
  const dateInput = details.querySelector('input[type="date"]');
  dateInput.addEventListener("change", ()=>{ t.due = dateInput.value || null; save(); renderHome(); sub.textContent = t.due?`Due: ${t.due}`:"No date"; });
  const ta = details.querySelector("textarea");
  ta.addEventListener("input", ()=>{ t.desc = ta.value; save(); });
  details.querySelector('[data-act="delete"]').addEventListener("click", ()=>{
    confirmDialog("Delete this task?", ()=>{
      phase.tasks = phase.tasks.filter(x=>x.id!==t.id);
      save(); renderPhase(phase.id); renderHome();
    });
  });
  details.querySelector('[data-act="close"]').addEventListener("click", ()=>{ details.classList.remove("open"); });
  chev.addEventListener("click", ()=> details.classList.toggle("open"));
  el.appendChild(row); el.appendChild(details);
  return el;
}

/* Inline edit phase title */
phaseTitle.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); phaseTitle.blur(); } if(e.key==="Escape"){ phaseTitle.value = state.phases.find(x=>x.id===state.ui.selectedPhaseId).title; phaseTitle.blur(); } });
phaseTitle.addEventListener("blur", ()=>{
  const p = state.phases.find(x=>x.id===state.ui.selectedPhaseId); if(!p) return;
  const v = phaseTitle.value.trim(); if(v){ p.title = v; save(); renderHome(); }
});

/* ---------- Action sheet (+) ---------- */
const tabPlus = document.getElementById("tabPlus");
tabPlus.addEventListener("click", ()=>{
  // On Home: open action sheet only
  openModal(sheetActions);
});
document.getElementById("closeSheetActions").addEventListener("click", closeModal);
document.getElementById("createPhase").addEventListener("click", ()=>{
  const id = "p"+Math.random().toString(36).slice(2,6);
  state.phases.push({ id, title:"New Phase", suspense:null, tasks:[] });
  save(); closeModal(); renderHome(); state.ui.selectedPhaseId=id; show("phase");
  // focus title
  setTimeout(()=> document.getElementById("phaseTitle").focus(), 0);
});
document.getElementById("createTask").addEventListener("click", ()=>{
  // If not in phase view, go to selected phase then open task sheet
  closeModal();
  if(location.hash.indexOf("#/phase/")!==0){ show("phase"); }
  openModal(sheetTask);
  document.getElementById("taskTitle").focus();
});
document.getElementById("cancelTask").addEventListener("click", closeModal);
document.getElementById("saveTask").addEventListener("click", ()=>{
  const title = document.getElementById("taskTitle").value.trim();
  if(!title) { document.getElementById("taskTitle").focus(); return; }
  const due = document.getElementById("taskDue").value || null;
  const desc = document.getElementById("taskDesc").value.trim();
  const p = state.phases.find(x=>x.id===state.ui.selectedPhaseId);
  p.tasks.push({ id:"t"+Math.random().toString(36).slice(2,6), title, due, desc, done:false });
  save(); closeModal(); renderPhase(p.id); renderHome(); toast("Task added");
});

/* ---------- Confirm dialog ---------- */
function confirmDialog(msg, onOk){
  document.getElementById("confirmMsg").textContent = msg;
  openModal(dialogConfirm);
  document.getElementById("confirmCancel").onclick = closeModal;
  document.getElementById("confirmOk").onclick = ()=>{ closeModal(); onOk&&onOk(); };
}

/* ---------- Toast ---------- */
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.hidden = false;
  setTimeout(()=> t.hidden = true, 1800);
}

/* ---------- Boot ---------- */
document.getElementById("tabHome").click(); // ensure events wired
// Route init
(function initRoute(){
  if(location.hash.startsWith("#/phase/")){ state.ui.selectedPhaseId = location.hash.split("/")[2]; show("phase"); }
  else if(location.hash.startsWith("#/timeline")){ show("timeline"); }
  else { show("home"); }
})();

/* ---------- Timeline (simple version) ---------- */
function renderTimeline(filter="all"){
  const list = document.getElementById("timelineList");
  list.innerHTML = "";
  const items = [];
  state.phases.forEach(p=>p.tasks.forEach(t=>{ if(t.due) items.push({date:t.due,title:t.title,phase:p.title,ref:{p,t}}) }));
  state.timeline.forEach(m=> items.push({date:m.date,title:m.title,phase:m.phase,ref:null}));
  items.sort((a,b)=> a.date.localeCompare(b.date));
  const byMonth = {};
  items.forEach(it=>{
    if(filter!=="all" && it.phase!==filter) return;
    const m = it.date.slice(0,7); (byMonth[m]=byMonth[m]||[]).push(it);
  });
  for(const m of Object.keys(byMonth)){
    const h = document.createElement("h3"); h.textContent = m; list.appendChild(h);
    byMonth[m].forEach(it=>{
      const row = document.createElement("div"); row.className="task";
      row.innerHTML = `<div class="t-title">${it.title}</div><div class="t-sub">${it.date} • ${it.phase||"Milestone"}</div>`;
      if(it.ref){ // editable
        row.addEventListener("click", ()=>{ state.ui.selectedPhaseId = state.phases.find(p=>p.title===it.phase)?.id || state.ui.selectedPhaseId; show("phase"); });
      }
      list.appendChild(row);
    });
  }
  // filter chips
  document.querySelectorAll(".filters .chip").forEach(ch=>{
    ch.onclick = ()=>{ document.querySelectorAll(".filters .chip").forEach(x=>x.classList.remove("active")); ch.classList.add("active"); renderTimeline(ch.dataset.filter); };
  });
}
