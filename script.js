
/* easyPCS – fixes & polish
 * Fix #1: Prevent disappearing tasks by rendering Active + Completed from single source (phase.tasks)
 * Fix #2: Bottom nav icon sizes/tap targets applied via CSS tokens
 * Fix #3: Title wraps to 2 lines; description toggle using .expanded (no horizontal scroll)
 * Option B: Phase carousel with scroll-snap + dots
 * Housekeeping: pure render functions, event delegation, debounced saves
 */

const STORAGE_KEY = "pcsChecklist.v1";

/* ---------- Utils ---------- */
const $ = (sel, root=document)=> root.querySelector(sel);
const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));
const debounce = (fn, ms=200)=>{ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),ms);} };
const byDue = (a,b)=>{ const ad=a.due||"", bd=b.due||""; if(ad&&bd){const c=ad.localeCompare(bd); if(c) return c;} if(ad&&!bd) return -1; if(!ad&&bd) return 1; return (a.title||"").localeCompare(b.title||""); };
const byCompletedAtDesc = (a,b)=> (b.completedAt||0)-(a.completedAt||0);
const escapeHTML = (s="")=> s.replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ---------- State ---------- */
let state = loadState() || seedData();
saveState(); // ensure write once so structure exists

function loadState(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw? JSON.parse(raw): null; }catch(e){ return null; }
}
const saveState = debounce(()=>{
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}, 200);

/* ---------- Router ---------- */
let currentPhaseId = null;
function route(){
  const h = location.hash || "#/home";
  if(h.startsWith("#/phase/")){
    currentPhaseId = decodeURIComponent(h.split("/")[2]);
    show("viewPhase"); renderPhaseDetail(currentPhaseId);
  }else if(h.startsWith("#/timeline")){
    show("viewTimeline"); renderTimeline();
  }else{
    show("viewHome"); renderHome();
  }
}
window.addEventListener("hashchange", route);
function show(id){ $$(".view").forEach(v=>v.classList.remove("active")); $("#"+id).classList.add("active"); }

/* ---------- Seed Data (4 fixed phases) ---------- */
function seedData(){
  const now = Date.now();
  return {
    phases:[
      { id:"p1", title:"Pre‑Departure", tasks:[
        { id:"t1", title:"Complete Initial Assignment Briefing in vMPF (within 7 days of RIP)", due:"2025-08-15", desc:"", done:false, createdAt:now },
        { id:"t2", title:"Fill out and upload Assignment Information Worksheet", due:"2025-09-23", desc:"", done:false, createdAt:now },
        { id:"tCars", title:"Decide car plan: ship, sell, or drive (paperwork)", due:"2025-09-01", desc:"", done:false, createdAt:now },
        { id:"tCats", title:"Cats (3): vet checkups + travel health certificates", due:"2025-08-30", desc:"", done:false, createdAt:now }
      ]},
      { id:"p2", title:"Mid Prep", tasks:[
        { id:"tVip", title:"VIPER Folder — upload required docs", due:"2025-11-15", desc:"", done:false, createdAt:now },
        { id:"tLodging", title:"Reserve lodging at Hill AFB (pet‑friendly)", due:"2025-10-20", desc:"", done:false, createdAt:now }
      ]},
      { id:"p3", title:"Final Out", tasks:[
        { id:"tCss", title:"CSS Outprocessing — 1 duty day before MPF", due:"2025-12-18", desc:"", done:false, createdAt:now },
        { id:"tFin", title:"Finance Outprocessing (CPTS) — DLA, voucher, GTC", due:"2025-12-19", desc:"", done:false, createdAt:now }
      ]},
      { id:"p4", title:"Arrival", tasks:[
        { id:"tRpt", title:"Report to unit CSS within 24 hrs", due:"2026-01-02", desc:"", done:false, createdAt:now },
        { id:"tVeh", title:"Register vehicles / base access decals", due:"2026-01-06", desc:"", done:false, createdAt:now }
      ]}
    ],
    timeline:[
      { date:"2025-07-15", title:"Assignment notification RIP issued", phase:null, done:true },
      { date:"2025-09-23", title:"Document suspense (AW, DD1172‑2, FMTS/ITSQ...)", phase:"Pre‑Departure", done:false },
      { date:"2025-12-19", title:"MPF Final Out appointment", phase:"Final Out", done:false },
      { date:"2026-01-31", title:"Report to Hill AFB by RNLTD", phase:"Arrival", done:false }
    ]
  };
}

/* ---------- Home: Phase Carousel (Option B) ---------- */
function renderHome(){
  const scroller = $("#phaseCarousel"); scroller.innerHTML = "";
  const dots = $("#carouselDots"); dots.innerHTML = "";
  state.phases.forEach((p, i)=>{
    scroller.appendChild(renderPhaseCard(p));
    const d = document.createElement("div"); d.className = "dot" + (i===0?" active":""); d.dataset.index = i; dots.appendChild(d);
  });
  scroller.onclick = (e)=>{
    const card = e.target.closest(".phase-card"); if(!card) return;
    location.hash = `#/phase/${encodeURIComponent(card.dataset.phaseId)}`;
  };
  scroller.addEventListener("scroll", onCarouselScroll, { passive:true });
  requestAnimationFrame(onCarouselScroll);
}
function renderPhaseCard(phase){
  const wrap = document.createElement("button");
  wrap.className = "phase-card"; wrap.dataset.phaseId = phase.id;
  const stats = phaseStats(phase);
  wrap.innerHTML = `
    <div class="phase-header-row">
      <div class="phase-title">${escapeHTML(phase.title)}</div>
      <div class="phase-metrics">${stats.done}/${stats.total} complete</div>
    </div>
    <div class="progress"><div class="progress-fill" style="width:${stats.total? Math.round(stats.done/stats.total*100):0}%"></div></div>
    <div class="next-date">Next: ${stats.next || "—"}</div>
  `;
  return wrap;
}
function onCarouselScroll(){
  const scroller = $("#phaseCarousel");
  const center = scroller.getBoundingClientRect().left + scroller.clientWidth/2;
  const cards = $$(".phase-card", scroller);
  let best=0, dist=Infinity;
  cards.forEach((c,i)=>{
    const r = c.getBoundingClientRect(); const d = Math.abs((r.left+r.width/2) - center);
    if(d<dist){ dist=d; best=i; }
  });
  const dots = $$(".dot"); dots.forEach((d,i)=> d.classList.toggle("active", i===best));
}
function phaseStats(phase){
  const total = phase.tasks.length;
  const done = phase.tasks.filter(t=>t.done).length;
  const incomplete = phase.tasks.filter(t=>!t.done && t.due);
  const next = incomplete.length? incomplete.map(t=>t.due).sort()[0] : null;
  return { total, done, next };
}

/* ---------- Phase Detail ---------- */
function renderPhaseDetail(phaseId){
  const phase = state.phases.find(p=>p.id===phaseId);
  if(!phase){ location.hash="#/home"; return; }
  $("#phaseTitleInput").value = phase.title;
  renderTaskLists(phaseId);
}

/* FIX #1: render active+completed from the single source array; no disappearing */
function renderTaskLists(phaseId){
  const phase = state.phases.find(p=>p.id===phaseId);
  const active = phase.tasks.filter(t=>!t.done).sort(byDue);
  const completed = phase.tasks.filter(t=>t.done).sort(byCompletedAtDesc);

  const activeList = $("#activeList"); const completedList = $("#completedList");
  activeList.innerHTML = ""; completedList.innerHTML = "";

  if(active.length===0 && completed.length===0){ $("#emptyPhase").hidden = False; }
  else { $("#emptyPhase").hidden = true; }

  active.forEach(t=> activeList.appendChild(renderTaskRow(phaseId, t)));
  $("#completedLabel").textContent = `Completed (${completed.length})`;
  completed.forEach(t=> completedList.appendChild(renderTaskRow(phaseId, t, true)));

  // Default collapse if >5 completed and user hasn't toggled
  const block = $("#completedBlock");
  if(completed.length>5 && !block.hasAttribute("data-user")) block.open = False;
}

/* Build one task row + its hidden description block (Fix #3 wraps) */
function renderTaskRow(phaseId, task, isCompleted=false){
  const row = document.createElement("div");
  row.className = "task-row";
  row.dataset.phaseId = phaseId;
  row.dataset.taskId = task.id;
  row.innerHTML = `
    <button class="check${task.done? " done": ""}" aria-label="Toggle complete">
      ${task.done? '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>': ""}
    </button>
    <div class="task-main">
      <div class="task-title">${escapeHTML(task.title)}</div>
      <div class="task-date">${task.due || "No date"}</div>
    </div>
    <button class="expand-btn" aria-label="Expand details"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="currentColor"/></svg></button>
  `;
  const desc = document.createElement("div");
  desc.className = "task-desc";
  desc.innerHTML = `
    <div class="desc-text">${escapeHTML(task.desc||"")}</div>
    <div class="desc-actions">
      <label class="label" for="date-${task.id}">Due Date</label>
      <input id="date-${task.id}" class="input" type="date" value="${task.due||""}">
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button class="btn small" data-action="edit-desc">Edit description</button>
        <button class="btn danger small" data-action="delete-task">Delete</button>
      </div>
    </div>
  `;
  const frag = document.createDocumentFragment();
  frag.appendChild(row); frag.appendChild(desc);
  return frag;
}

/* ---------- Event Delegation ---------- */
// Back to Home
$("#btnBack").addEventListener("click", ()=> location.hash = "#/home");
// Phase title inline save
let prevTitle = "";
$("#phaseTitleInput").addEventListener("focus", e=> prevTitle = e.target.value);
$("#phaseTitleInput").addEventListener("keydown", e=>{
  if(e.key==="Escape"){ e.target.value = prevTitle; e.target.blur(); }
  if(e.key==="Enter"){ e.preventDefault(); e.target.blur(); }
});
$("#phaseTitleInput").addEventListener("blur", e=>{
  const v = e.target.value.trim() || "Untitled";
  const p = state.phases.find(x=>x.id===currentPhaseId); if(!p) return;
  if(p.title !== v){ p.title = v; saveState(); renderHome(); }
});

// Task list click handlers (toggle, expand, delete, edit, date change)
$("#taskLists").addEventListener("click", (e)=>{
  const row = e.target.closest(".task-row");
  const button = e.target.closest("button");
  if(!row || !button) return;

  // Expand
  if(button.classList.contains("expand-btn")){
    row.classList.toggle("expanded");
    const desc = row.nextElementSibling;
    if(desc && desc.classList.contains("task-desc")){
      desc.style.display = row.classList.contains("expanded") ? "block" : "none";
    }
    return;
  }
  // Toggle complete — FIX #1 keep both sections rendered
  if(button.classList.contains("check")){
    const { phaseId, taskId } = row.dataset;
    const ph = state.phases.find(p=>p.id===phaseId);
    const t = ph.tasks.find(x=>x.id===taskId);
    t.done = !t.done;
    t.completedAt = t.done ? Date.now() : null;
    saveState();
    renderTaskLists(phaseId); // re-render Active + Completed
    renderHome();             // update progress & Next
    return;
  }
  // Delete with confirm
  if(button.dataset.action==="delete-task"){
    const { phaseId, taskId } = row.dataset;
    const ph = state.phases.find(p=>p.id===phaseId);
    if(confirm(`Delete task “${row.querySelector(".task-title").textContent}”?`)){
      ph.tasks = ph.tasks.filter(x=>x.id!==taskId);
      saveState(); renderTaskLists(phaseId); renderHome();
    }
    return;
  }
  // Edit description
  if(button.dataset.action==="edit-desc"){
    const { phaseId, taskId } = row.dataset;
    const ph = state.phases.find(p=>p.id===phaseId);
    const t = ph.tasks.find(x=>x.id===taskId);
    const next = prompt("Edit description (max 180 chars):", (t.desc||"").slice(0,180));
    if(next!==null){ t.desc = (next||"").slice(0,180); saveState(); renderTaskLists(phaseId); }
    return;
  }
});
// Inline date change
$("#taskLists").addEventListener("change", (e)=>{
  if(!e.target.matches('input[type="date"]')) return;
  const desc = e.target.closest(".task-desc");
  const row = desc?.previousElementSibling;
  if(!row) return;
  const { phaseId, taskId } = row.dataset;
  const ph = state.phases.find(p=>p.id===phaseId);
  const t = ph.tasks.find(x=>x.id===taskId);
  t.due = e.target.value || null;
  saveState(); renderTaskLists(phaseId); renderHome();
});

/* Bottom nav */
$("#navHome").addEventListener("click", ()=> location.hash="#/home");
$("#navTimeline").addEventListener("click", ()=> location.hash="#/timeline");
$("#navAdd").addEventListener("click", ()=>{
  // From Home or Timeline, pick centered/first phase; from Phase, use current
  let phaseId = currentPhaseId;
  if($("#viewHome").classList.contains("active")){
    const dots = $$(".dot"); const idx = dots.findIndex(d=>d.classList.contains("active"));
    phaseId = state.phases[idx>=0? idx:0].id;
  }
  if($("#viewTimeline").classList.contains("active")){ phaseId = state.phases[0].id; }
  openAddTaskSheet(phaseId);
});

/* ---------- Add Task Sheet (no overlay on Home; it's a modal tied to selected phase) ---------- */
function openAddTaskSheet(phaseId){
  const sel = $("#taskPhase"); sel.innerHTML = "";
  state.phases.forEach(p=>{
    const o = document.createElement("option");
    o.value = p.id; o.textContent = p.title;
    if(p.id===phaseId) o.selected = true;
    sel.appendChild(o);
  });
  $("#taskTitle").value=""; $("#taskDue").value=""; $("#taskDesc").value="";
  document.documentElement.classList.add("modal-open"); $("#scrim").hidden=false; $("#addTaskSheet").hidden=false;
}
function closeSheet(){ document.documentElement.classList.remove("modal-open"); $("#scrim").hidden=true; $("#addTaskSheet").hidden=true; }
$("#sheetClose").addEventListener("click", closeSheet);
$("#btnCancelTask").addEventListener("click", closeSheet);
$("#scrim").addEventListener("click", closeSheet);
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeSheet(); });

// Create task (enforce title 60, desc 180)
$("#taskForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const phaseId = $("#taskPhase").value;
  const title = ($("#taskTitle").value||"").trim().slice(0,60);
  if(!title){ $("#taskTitle").focus(); return; }
  const due = $("#taskDue").value || null;
  const desc = ($("#taskDesc").value||"").trim().slice(0,180);
  const phase = state.phases.find(p=>p.id===phaseId);
  phase.tasks.push({ id: `t_${Date.now()}_${Math.random().toString(36).slice(2,5)}`, title, due, desc, done:false, createdAt:Date.now() });
  saveState(); closeSheet();
  if(currentPhaseId===phaseId) renderTaskLists(phaseId);
  renderHome();
  showToast("Task added");
});

/* ---------- Timeline (simple) ---------- */
let timelineFilter = "all";
$$(".filters .chip").forEach(ch=> ch.addEventListener("click", ()=>{
  $$(".filters .chip").forEach(c=>c.classList.remove("active"));
  ch.classList.add("active");
  timelineFilter = ch.dataset.filter;
  renderTimeline();
}));
$("#btnTimelineTop").addEventListener("click", ()=> location.hash="#/timeline");
$("#btnJumpToday").addEventListener("click", ()=>{
  const today = new Date().toISOString().slice(0,10);
  const el = $(`[data-date="${today}"]`, $("#timelineList"));
  if(el) el.scrollIntoView({ behavior:"smooth", block:"start" });
});
function renderTimeline(){
  const list = $("#timelineList"); list.innerHTML="";
  const items = [];
  state.phases.forEach(p=> p.tasks.forEach(t=>{ if(t.due) items.push({type:"task", date:t.due, title:t.title, phase:p.title, phaseId:p.id, taskId:t.id}); }));
  state.timeline.forEach(m=> items.push({type:"milestone", date:m.date, title:m.title, phase:m.phase}));
  const filt = timelineFilter==="all"? items : items.filter(i=> (i.phase||"")===timelineFilter);
  filt.sort((a,b)=> a.date.localeCompare(b.date));
  let lastMonth = "";
  filt.forEach(it=>{
    const month = it.date.slice(0,7);
    if(month!==lastMonth){
      const ml = document.createElement("div"); ml.className="month-label";
      ml.textContent = new Date(month+"-01").toLocaleString(undefined,{month:"long", year:"numeric"});
      list.appendChild(ml); lastMonth = month;
    }
    const row = document.createElement("button");
    row.className="task-row"; row.dataset.date = it.date;
    row.innerHTML = `
      <div class="check" aria-hidden="true" style="border-radius:12px;width:12px;height:12px;"></div>
      <div class="task-main">
        <div class="task-title">${escapeHTML(it.title)}</div>
        <div class="task-date">${it.date}${it.phase? " • "+escapeHTML(it.phase):""}</div>
      </div>
      <div style="width:28px;"></div>`;
    row.addEventListener("click", ()=>{
      if(it.type==="task"){
        location.hash = `#/phase/${encodeURIComponent(it.phaseId)}`;
        setTimeout(()=>{
          const tr = $(`.task-row[data-task-id="${it.taskId}"]`);
          if(tr){ tr.classList.add("expanded"); const desc = tr.nextElementSibling; if(desc) desc.style.display="block"; }
        }, 80);
      }
    });
    list.appendChild(row);
  });
}

/* ---------- Toast ---------- */
function showToast(msg){
  const t=$("#toast"); t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(showToast._t); showToast._t = setTimeout(()=> t.classList.add("hidden"), 1800);
}

/* ---------- Boot ---------- */
route();
renderHome();
