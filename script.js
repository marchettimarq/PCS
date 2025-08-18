
const STORAGE_KEY = "pcsChecklist.v1";

/* Utilities */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const nowId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
const todayISO = () => new Date().toISOString().slice(0,10);
const deepClone = (o)=>JSON.parse(JSON.stringify(o));

/* State */
const initialSeed = () => {
  const t = Date.now();
  return {
    version: 1,
    phases: [
      {
        id: nowId("phase"),
        title: "Pre-Departure",
        createdAt: t,
        order: 0,
        tasks: [
          { id: nowId("task"), title: "Complete Initial Assignment Briefing in vMPF", dueDate: "2025-09-23", description: "Within 7 days of RIP", completed: false, createdAt: t+1 },
          { id: nowId("task"), title: "Verify dependents in DEERS / print DD 1172-2", dueDate: "2025-09-23", description: "", completed: false, createdAt: t+2 },
          { id: nowId("task"), title: "Complete SOES/SGLI update in milConnect", dueDate: "2025-09-23", description: "Print certified copy", completed: false, createdAt: t+3 }
        ]
      },
      { id: nowId("phase"), title: "Mid Prep", createdAt: t, order: 1, tasks: [] },
      { id: nowId("phase"), title: "Final Out", createdAt: t, order: 2, tasks: [] },
      { id: nowId("phase"), title: "Arrival", createdAt: t, order: 3, tasks: [] }
    ],
    ui: { selectedPhaseId: null, filters: {} }
  };
};

function migrate(raw){
  if(!raw) return null;
  if(raw.version === 1) return raw;
  raw.version = 1;
  return raw;
}

let STATE = loadState() || initialSeed();
saveState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return migrate(raw ? JSON.parse(raw) : null);
  }catch(e){ return null; }
}
let saveTimer = null;
function saveStateDebounced(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 120);
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); }catch(e){}
}

const getPhases = () => [...STATE.phases].sort((a,b)=> (a.order ?? 0) - (b.order ?? 0) || a.createdAt - b.createdAt);
const getPhaseById = (id) => STATE.phases.find(p=>p.id === id);
const getFilterFor = (phaseId) => STATE.ui.filters?.[phaseId] || "all";

/* Router */
let CURRENT_VIEW = "phases";
let scrollYPhases = 0;

function goPhases(){
  CURRENT_VIEW = "phases";
  $("#phasesView").classList.add("active");
  $("#phaseView").classList.remove("active");
  $("#addTaskFab").hidden = true;
  $("#phasesFab").style.display = "flex";
  $("#backBtn").hidden = true;
  $("#phaseMenuBtn").hidden = true;
  $("#appTitle").textContent = "PCS Checklist";
  window.scrollTo(0, scrollYPhases);
  renderPhases();
}

function goPhase(phaseId){
  STATE.ui.selectedPhaseId = phaseId;
  saveState();
  CURRENT_VIEW = "phase";
  $("#phasesView").classList.remove("active");
  $("#phaseView").classList.add("active");
  $("#addTaskFab").hidden = false;
  $("#phasesFab").style.display = "none";
  $("#backBtn").hidden = false;
  $("#phaseMenuBtn").hidden = false;
  renderPhase(phaseId);
}

$("#backBtn").addEventListener("click", ()=>{ scrollYPhases = window.scrollY; goPhases(); });

/* Toast */
const toastEl = $("#toast");
const toastMsg = $("#toastMsg");
const toastUndoBtn = $("#toastUndo");
let undoPayload = null;
let toastTimer = null;

function showToast(message, withUndo=false, onUndo=null){
  toastMsg.textContent = message;
  toastEl.hidden = false;
  toastUndoBtn.hidden = !withUndo;
  undoPayload = withUndo ? onUndo : null;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 5000);
}
toastUndoBtn.addEventListener("click", ()=>{ if(typeof undoPayload==="function"){ undoPayload(); } hideToast(); });
function hideToast(){ toastEl.hidden = true; toastMsg.textContent = ""; toastUndoBtn.hidden = true; undoPayload = null; }

/* Phases View */
function renderPhases(){
  const container = $("#phasesList");
  const phases = getPhases();
  container.innerHTML = "";
  $("#phasesEmpty").hidden = phases.length !== 0;

  phases.forEach(phase => {
    const total = phase.tasks.length;
    const done = phase.tasks.filter(t=>t.completed).length;
    const card = document.createElement("button");
    card.className = "card phase-card";
    card.setAttribute("aria-label", `Open ${phase.title}`);
    card.addEventListener("click", ()=>{ scrollYPhases = window.scrollY; goPhase(phase.id); });
    const main = document.createElement("div");
    main.className = "phase-main";
    const title = document.createElement("div");
    title.className = "phase-title"; title.textContent = phase.title;
    const sub = document.createElement("div");
    sub.className = "phase-sub"; sub.textContent = "Phase";
    const count = document.createElement("div");
    count.className = "count"; count.textContent = `${done}/${total}`;
    main.appendChild(title); main.appendChild(sub);
    card.appendChild(main); card.appendChild(count);
    container.appendChild(card);
  });
}

$("#addPhaseBtn").addEventListener("click", createPhase);
$("#addPhaseEmpty").addEventListener("click", createPhase);

function createPhase(){
  const p = { id: nowId("phase"), title: "New Phase", createdAt: Date.now(), order: (STATE.phases?.length||0), tasks: [] };
  STATE.phases.push(p);
  saveState();
  renderPhases();
  setTimeout(()=>{ goPhase(p.id); const input = $("#phaseTitleInput"); input.focus(); input.select(); },0);
}

/* Phase Detail */
const phaseTitleInput = $("#phaseTitleInput");
const chips = $$(".chip");
chips.forEach(ch => ch.addEventListener("click", ()=>{
  const phaseId = STATE.ui.selectedPhaseId;
  STATE.ui.filters = STATE.ui.filters || {};
  STATE.ui.filters[phaseId] = ch.dataset.filter;
  saveState();
  renderPhase(phaseId);
}));

$("#phaseMenuBtn").addEventListener("click", (e)=>{
  const m = $("#phaseMenu");
  m.hidden = !m.hidden;
  const rect = e.target.getBoundingClientRect();
  m.style.top = (rect.bottom) + "px";
  m.style.right = "12px";
});
document.addEventListener("click", (e)=>{
  if(!$("#phaseMenu").hidden && !$("#phaseMenu").contains(e.target) && e.target.id !== "phaseMenuBtn"){
    $("#phaseMenu").hidden = true;
  }
});
$("#deletePhaseBtn").addEventListener("click", ()=>{
  $("#phaseMenu").hidden = true;
  const phase = getPhaseById(STATE.ui.selectedPhaseId);
  if(!phase) return;
  if(confirm("Delete phase and all tasks? This can’t be undone.")){
    const snapshot = deepClone(STATE);
    STATE.phases = STATE.phases.filter(p=>p.id !== phase.id);
    saveState();
    showToast("Phase deleted", true, ()=>{ STATE = snapshot; saveState(); goPhases(); });
    goPhases();
  }
});

function renderPhase(phaseId){
  const phase = getPhaseById(phaseId);
  if(!phase){ goPhases(); return; }
  $("#appTitle").textContent = "Phase";
  phaseTitleInput.value = phase.title;
  chips.forEach(ch => ch.setAttribute("aria-selected", String(ch.dataset.filter === getFilterFor(phaseId))));
  const tasks = sortTasks(applyFilter(phase.tasks, getFilterFor(phaseId)));
  const list = $("#tasksList");
  list.innerHTML = "";
  $("#tasksEmpty").hidden = tasks.length !== 0;
  tasks.forEach(task => list.appendChild(renderTaskItem(phase, task)));
}

let phaseTitlePrev = "";
phaseTitleInput.addEventListener("focus", ()=>{ phaseTitlePrev = phaseTitleInput.value; });
phaseTitleInput.addEventListener("keydown", (e)=>{ if(e.key==="Escape"){ phaseTitleInput.value = phaseTitlePrev; phaseTitleInput.blur(); } if(e.key==="Enter"){ phaseTitleInput.blur(); } });
phaseTitleInput.addEventListener("blur", ()=>{
  const phase = getPhaseById(STATE.ui.selectedPhaseId); if(!phase) return;
  const v = phaseTitleInput.value.trim() || "Untitled Phase";
  if(phase.title !== v){ phase.title = v; saveStateDebounced(); renderPhases(); }
});

/* Tasks */
function renderTaskItem(phase, task){
  const wrap = document.createElement("div");
  wrap.className = "task"; wrap.dataset.taskId = task.id;
  const row = document.createElement("div"); row.className = "task-row";

  const check = document.createElement("button");
  check.className = "check" + (task.completed ? " done" : "");
  check.setAttribute("aria-label", "Toggle complete");
  check.innerHTML = task.completed ? "✓" : "";
  check.addEventListener("click", ()=>{
    task.completed = !task.completed; saveStateDebounced(); renderPhase(phase.id); renderPhases();
  });

  const title = document.createElement("div");
  title.className = "task-title" + (task.completed ? " strike" : "");
  title.textContent = task.title; title.contentEditable = "true"; title.role = "textbox";
  title.dataset.prev = task.title;
  title.addEventListener("keydown", (e)=>{ if(e.key==="Escape"){ title.textContent = title.dataset.prev; title.blur(); } if(e.key==="Enter"){ e.preventDefault(); title.blur(); } });
  title.addEventListener("focus", ()=>{ title.dataset.prev = title.textContent; });
  title.addEventListener("blur", ()=>{ const v = (title.textContent||"").trim(); if(!v){ title.textContent = title.dataset.prev; return; } if(v!==task.title){ task.title=v; saveStateDebounced(); renderPhases(); } });

  const dateWrap = document.createElement("div"); dateWrap.className = "task-date";
  const date = document.createElement("input"); date.type="date"; if(task.dueDate) date.value = task.dueDate;
  date.addEventListener("change", ()=>{ task.dueDate = date.value || null; saveStateDebounced(); renderPhase(phase.id); });
  const clear = document.createElement("button"); clear.className="clear-x"; clear.innerText="×"; clear.title="Clear date";
  clear.addEventListener("click", ()=>{ date.value=""; task.dueDate=null; saveStateDebounced(); renderPhase(phase.id); showToast("Date cleared"); });
  dateWrap.appendChild(date); dateWrap.appendChild(clear);

  let pressTimer=null;
  row.addEventListener("touchstart", ()=>{ pressTimer=setTimeout(()=>confirmDeleteTask(phase, task),550); });
  row.addEventListener("touchend", ()=>clearTimeout(pressTimer));
  row.addEventListener("contextmenu", (e)=>{ e.preventDefault(); confirmDeleteTask(phase, task); });

  row.appendChild(check); row.appendChild(title); row.appendChild(dateWrap);
  wrap.appendChild(row);

  const desc = document.createElement("div"); desc.className="task-desc";
  const teaser = document.createElement("button"); teaser.className="desc-toggle";
  const isOpen = !!task._open;
  teaser.textContent = isOpen ? "Hide details" : (task.description ? "More…" : "Add description");
  teaser.addEventListener("click", ()=>{ task._open = !task._open; renderPhase(phase.id); });
  desc.appendChild(teaser);
  if(isOpen){
    const ta = document.createElement("textarea"); ta.className="input"; ta.rows=3; ta.placeholder="Add details…"; ta.value=task.description||"";
    ta.addEventListener("input", ()=>{ task.description = ta.value; saveStateDebounced(); });
    desc.appendChild(ta);
  }
  wrap.appendChild(desc);
  return wrap;
}

function sortTasks(tasks){
  return [...tasks].sort((a,b)=>{
    if(a.completed !== b.completed) return a.completed ? 1 : -1;
    const ad = a.dueDate || ""; const bd = b.dueDate || "";
    if(ad && bd){ const cmp = ad.localeCompare(bd); if(cmp) return cmp; }
    if(ad && !bd) return -1;
    if(!ad && bd) return 1;
    return a.title.localeCompare(b.title);
  });
}
function applyFilter(tasks, filter){
  const today = todayISO();
  switch(filter){
    case "incomplete": return tasks.filter(t=>!t.completed);
    case "completed": return tasks.filter(t=>t.completed);
    case "overdue": return tasks.filter(t=>!t.completed && t.dueDate && t.dueDate < today);
    default: return tasks;
  }
}

function confirmDeleteTask(phase, task){
  const snapshot = deepClone({ phaseId: phase.id, task, idx: phase.tasks.findIndex(t=>t.id===task.id) });
  phase.tasks = phase.tasks.filter(t=>t.id !== task.id);
  saveState(); renderPhase(phase.id); renderPhases();
  showToast("Task deleted", true, ()=>{
    const p = getPhaseById(snapshot.phaseId); if(!p) return;
    p.tasks.splice(snapshot.idx, 0, snapshot.task); saveState(); renderPhase(snapshot.phaseId); renderPhases();
  });
}

/* Add Task Sheet */
const sheet = $("#taskSheet"), scrim = $("#sheetScrim");
const taskPhaseSelect = $("#taskPhaseSelect");
const taskTitleInput = $("#taskTitleInput");
const taskDateInput = $("#taskDateInput");
const taskDateClear = $("#taskDateClear");
const taskDescInput = $("#taskDescInput");
const taskSave = $("#taskSave");
const taskCancel = $("#taskCancel");
const sheetClose = $("#sheetClose");
const addTaskFab = $("#addTaskFab");

addTaskFab.addEventListener("click", ()=> openTaskSheet());
taskCancel.addEventListener("click", closeTaskSheet);
sheetClose.addEventListener("click", closeTaskSheet);
scrim.addEventListener("click", closeTaskSheet);
taskDateClear.addEventListener("click", ()=>{ taskDateInput.value = ""; });

function openTaskSheet(){
  taskPhaseSelect.innerHTML = "";
  getPhases().forEach(p=>{
    const opt = document.createElement("option");
    opt.value = p.id; opt.textContent = p.title;
    if(STATE.ui.selectedPhaseId === p.id) opt.selected = true;
    taskPhaseSelect.appendChild(opt);
  });
  taskTitleInput.value = ""; taskDateInput.value = ""; taskDescInput.value = "";
  $("#taskSheetTitle").textContent = "Add Task";
  scrim.hidden = false; sheet.hidden = false; taskTitleInput.focus();
}
function closeTaskSheet(){ scrim.hidden = true; sheet.hidden = true; }

taskSave.addEventListener("click", ()=>{
  const title = taskTitleInput.value.trim(); if(!title){ taskTitleInput.focus(); return; }
  const due = taskDateInput.value || null; const desc = taskDescInput.value.trim(); const phaseId = taskPhaseSelect.value;
  const p = getPhaseById(phaseId); if(!p) return;
  p.tasks.push({ id: nowId("task"), title, dueDate: due, description: desc, completed: false, createdAt: Date.now() });
  saveState(); closeTaskSheet(); showToast("Task added");
  if(CURRENT_VIEW === "phase"){ renderPhase(STATE.ui.selectedPhaseId); } renderPhases();
});

/* Init */
(function init(){
  renderPhases();
  if(STATE.ui.selectedPhaseId){ goPhase(STATE.ui.selectedPhaseId); } else { goPhases(); }
})();
