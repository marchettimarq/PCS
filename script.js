
/* PCS Checklist v2 – fixed phase navigation, task dates, and phase selector */
const STORAGE_KEY = "pcsChecklistStateV2";

const PHASES = [
  { id: "pre", name: "Pre-Departure", window: "Now → 23 Sep 2025", suspense: "23 Sep 2025", tasks: [
    { id: "pre-1", title: "Complete Initial Assignment Briefing in vMPF", details: "Must be completed within 7 days of RIP.", due: "2025-09-23", done: false },
    { id: "pre-2", title: "Fill out and upload Assignment Information Worksheet", details: "", due: "2025-09-23", done: false },
    { id: "pre-3", title: "Verify dependents in DEERS / print DD 1172-2", details: "", due: "2025-09-23", done: false },
    { id: "pre-4", title: "Complete SOES/SGLI update in milConnect; print certified copy", details: "", due: "2025-09-23", done: false },
    { id: "pre-5", title: "Start FMTS + ITSQ", details: "", due: "2025-09-23", done: false },
    { id: "pre-6", title: "Schedule/complete Immunizations Memo (86 MDG Immunizations)", details: "", due: "2025-09-23", done: false },
    { id: "pre-7", title: "Obtain Security Clearance Memo from Security Manager (SECRET/DISS)", details: "", due: "2025-09-23", done: false },
    { id: "pre-8", title: "Check if retainability required → start with CSS, obtain memo", details: "", due: "2025-09-23", done: false },
    { id: "pre-9", title: "Complete DAF 965 Overseas Tour Election (if flagged)", details: "", due: "2025-09-23", done: false },
    { id: "pre-10", title: "If TDY enroute, attach RIP + funding info", details: "", due: "2025-09-23", done: false },
    { id: "pre-11", title: "If firearms, fill out POF details (Make/Model/Serial)", details: "", due: "2025-09-23", done: false },
    { id: "pre-12", title: "Optional: AOI memo + early orders for HHG/TMO scheduling", details: "", due: "2025-09-23", done: false }
  ]},
  { id: "mid", name: "Mid Prep", window: "24 Sep → 30 Nov 2025", suspense: "30 Nov 2025", tasks: [
    { id: "mid-1", title: "Upload docs to VIPER folder; CSS marks 'Final Out Ready'", details: "", due: "2025-11-30", done: false },
    { id: "mid-2", title: "Relocation Processing Memo routed", details: "Weapons, clearance, FCP, GTC, AT/FP brief, fitness, signatures.", due: "2025-11-30", done: false },
    { id: "mid-3", title: "Complete Virtual Outprocessing (vMPF) except Outbound Assignments", details: "", due: "2025-11-30", done: false },
    { id: "mid-4", title: "Fitness must be valid through 31 Jan 2026", details: "", due: "2025-11-30", done: false },
    { id: "mid-5", title: "Orders review (dependents, RNLTD, remarks)", details: "", due: "2025-11-30", done: false },
    { id: "mid-6", title: "HHG/TMO pack-out scheduling", details: "", due: "2025-11-15", done: false },
    { id: "mid-7", title: "Circuitous Travel Memo (if routing differs)", details: "", due: "2025-11-30", done: false }
  ]},
  { id: "final", name: "Final Out", window: "Dec 2025", suspense: "≈19 Dec 2025", tasks: [
    { id: "final-1", title: "CSS Outprocessing", details: "1 duty day before MPF.", due: "2025-12-18", done: false },
    { id: "final-2", title: "MPF Final Out appointment", details: "Orders, SOES/SGLI, memos, vOP, immunizations, security memo.", due: "2025-12-19", done: false },
    { id: "final-3", title: "Port Call (upload orders to PTA, confirm flight)", details: "", due: "2025-12-10", done: false },
    { id: "final-4", title: "Finance outprocessing (DLA, travel voucher, GTC usage)", details: "", due: "2025-12-19", done: false }
  ]},
  { id: "arrival", name: "Arrival", window: "Hill AFB, Jan 2026", suspense: "Jan 2026", tasks: [
    { id: "arrival-1", title: "Report to unit CSS within 24 hrs", details: "", due: "2026-01-05", done: false },
    { id: "arrival-2", title: "In-process Finance (BAH, COLA, etc.)", details: "", due: "2026-01-10", done: false },
    { id: "arrival-3", title: "In-process Medical (Hill AFB Clinic)", details: "", due: "2026-01-12", done: false },
    { id: "arrival-4", title: "Update DEERS/Tricare with new address", details: "", due: "2026-01-07", done: false },
    { id: "arrival-5", title: "Secure housing (on/off base)", details: "", due: "2026-01-31", done: false },
    { id: "arrival-6", title: "School/childcare enrollment", details: "", due: "2026-01-20", done: false }
  ]}
];

let state = loadState() || seedFromPhases(PHASES);
let currentView = "home"; // 'home' | 'phase'
let currentPhaseId = null;

const viewRoot = document.getElementById("viewRoot");
const backBtn = document.getElementById("backBtn");
const installBtn = document.getElementById("installBtn");

function navigate(to, phaseId = null){
  currentView = to;
  currentPhaseId = phaseId;
  render();
}

function seedFromPhases(phases){
  return {
    phases: phases.map(p => ({
      id: p.id, name: p.name, window: p.window, suspense: p.suspense,
      tasks: p.tasks.map(t => ({...t}))
    }))
  };
}

function loadState(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
}
function findPhase(phaseId){ return state.phases.find(p => p.id === phaseId); }
function allPhases(){ return state.phases; }

function render(){
  backBtn.style.visibility = currentView === "phase" ? "visible" : "hidden";
  if(currentView === "home"){ renderHome(); } else { renderPhase(currentPhaseId); }
}

function cardButton(contentBuilder){
  const btn = document.createElement("button");
  btn.className = "phase-card";
  btn.setAttribute("type", "button");
  btn.setAttribute("role", "button");
  btn.tabIndex = 0;
  contentBuilder(btn);
  return btn;
}

function renderHome(){
  viewRoot.innerHTML = "";
  const grid = document.createElement("section");
  grid.className = "phase-grid";

  state.phases.forEach(phase => {
    const total = phase.tasks.length;
    const done = phase.tasks.filter(t => t.done).length;
    const pct = total ? Math.round((done/total)*100) : 0;

    const btn = cardButton((card)=>{
      const title = document.createElement("div");
      title.className = "phase-title";
      title.textContent = phase.name;

      const sub = document.createElement("div");
      sub.className = "phase-sub";
      sub.textContent = `Suspense: ${phase.suspense}`;

      const progress = document.createElement("div");
      progress.className = "progress-wrap";

      const bar = document.createElement("div");
      bar.className = "progress-bar";
      const fill = document.createElement("div");
      fill.className = "progress-fill";
      fill.style.width = pct + "%";
      bar.appendChild(fill);

      const ptxt = document.createElement("div");
      ptxt.className = "progress-text";
      ptxt.textContent = `${done}/${total}`;

      progress.appendChild(bar);
      progress.appendChild(ptxt);

      card.appendChild(title);
      card.appendChild(sub);
      card.appendChild(progress);
    });

    btn.addEventListener("click", () => navigate("phase", phase.id));
    btn.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); navigate("phase", phase.id); }
    });

    grid.appendChild(btn);
  });

  viewRoot.appendChild(grid);
}

function renderPhase(phaseId){
  const phase = findPhase(phaseId);
  if(!phase){ navigate("home"); return; }

  viewRoot.innerHTML = "";

  const header = document.createElement("div");
  header.className = "phase-header";

  const h2 = document.createElement("h2");
  h2.textContent = phase.name;

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="margin-top:1px;"><path d="M8 7h8M8 12h8M8 17h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Suspense: ${phase.suspense}`;

  header.appendChild(h2);
  header.appendChild(badge);

  const tasksSorted = [...phase.tasks].sort((a,b)=>{
    const ad = a.due || ""; const bd = b.due || "";
    if(ad && bd) return ad.localeCompare(bd) || a.title.localeCompare(b.title);
    if(ad && !bd) return -1;
    if(!ad && bd) return 1;
    return a.title.localeCompare(b.title);
  });

  const listFrag = document.createDocumentFragment();

  tasksSorted.forEach((task) => {
    const el = document.createElement("div");
    el.className = "task";

    const top = document.createElement("div");
    top.className = "task-top";

    const check = document.createElement("button");
    check.className = "check" + (task.done ? " done" : "");
    check.setAttribute("aria-label", "Toggle complete");
    check.innerHTML = task.done ?
      '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' :
      "";
    check.onclick = () => {
      task.done = !task.done;
      saveState();
      renderPhase(phaseId);
    };

    const title = document.createElement("div");
    title.className = "task-title" + (task.done ? " done" : "");
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    if(task.due){
      const due = document.createElement("span");
      due.textContent = `Due: ${task.due}`;
      meta.appendChild(due);
    }

    const caret = document.createElement("button");
    caret.className = "disclosure";
    caret.setAttribute("aria-label", "Show details");
    caret.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    top.appendChild(check);
    top.appendChild(title);
    top.appendChild(meta);
    top.appendChild(caret);

    const details = document.createElement("div");
    details.className = "task-details";
    details.innerHTML = (task.details ? `<div>${task.details}</div>` : "<div>No additional details.</div>")
      + (task.due ? `<div style="margin-top:6px;">Target date: <strong>${task.due}</strong></div>` : "")
      + `<div style="margin-top:6px; font-size:12px; color:#64748b;">ID: ${task.id}</div>`;

    let open = false;
    caret.onclick = () => {
      open = !open;
      details.classList.toggle("open", open);
      caret.innerHTML = open
        ? '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    };

    el.appendChild(top);
    el.appendChild(details);
    listFrag.appendChild(el);
  });

  const addRow = document.createElement("div");
  addRow.className = "add-row";
  const addBtn = document.createElement("button");
  addBtn.className = "btn primary";
  addBtn.textContent = "Add Task";
  addBtn.onclick = () => openAddTaskModal(phaseId);
  addRow.appendChild(addBtn);

  viewRoot.appendChild(header);
  viewRoot.appendChild(listFrag);
  viewRoot.appendChild(addRow);
}

/* Add Task Modal */
const modalScrim = document.getElementById("modalScrim");
const addTaskModal = document.getElementById("addTaskModal");
const taskPhaseEl = document.getElementById("taskPhase");
const taskTitleEl = document.getElementById("taskTitle");
const taskDateEl = document.getElementById("taskDate");
const taskDetailsEl = document.getElementById("taskDetails");
const cancelAddTask = document.getElementById("cancelAddTask");
const saveAddTask = document.getElementById("saveAddTask");

let modalPhaseId = null;

function populatePhaseSelect(selectedId){
  taskPhaseEl.innerHTML = "";
  state.phases.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    if(p.id === selectedId) opt.selected = true;
    taskPhaseEl.appendChild(opt);
  });
}

function openAddTaskModal(phaseId){
  modalPhaseId = phaseId;
  populatePhaseSelect(phaseId || state.phases[0].id);
  taskTitleEl.value = "";
  taskDateEl.value = "";
  taskDetailsEl.value = "";
  modalScrim.hidden = false;
  addTaskModal.hidden = false;
  taskTitleEl.focus();
}

function closeAddTaskModal(){
  modalScrim.hidden = true;
  addTaskModal.hidden = true;
  modalPhaseId = null;
}

cancelAddTask.onclick = closeAddTaskModal;
modalScrim.onclick = closeAddTaskModal;

saveAddTask.onclick = () => {
  const title = (taskTitleEl.value || "").trim();
  if(!title){ taskTitleEl.focus(); return; }
  const details = (taskDetailsEl.value || "").trim();
  const due = taskDateEl.value || null;
  const targetPhaseId = taskPhaseEl.value;

  const target = findPhase(targetPhaseId);
  const newId = targetPhaseId + "-custom-" + Math.random().toString(36).slice(2,8);
  target.tasks.push({ id: newId, title, details, due, done: false });
  saveState();
  closeAddTaskModal();
  if(currentView === "phase"){ renderPhase(currentPhaseId); } else { renderHome(); }
};

/* Back button */
backBtn.onclick = () => { if(currentView === "phase"){ navigate("home"); } };

/* PWA install prompt */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

render();
