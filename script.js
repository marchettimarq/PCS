
/* easyPCS - clean build (no neon, fixed 4 phases)
   - Home: puzzle board of 4 pieces; connects as phases reach 100%
   - Phase Detail: tasks with circular checkboxes, title (60 cap), date subline, expandable description (180 cap)
   - Add Task sheet with phase selector; character limits enforced
   - Timeline basic view
   - localStorage: pcsChecklist.v1
*/

const STORAGE_KEY = "pcsChecklist.v1";
const MAX_TITLE = 60;
const MAX_DESC = 180;
const PREVIEW_DESC = 80;

const $ = (sel, root=document)=>root.querySelector(sel);
const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));
const nowId = (p)=> `${p}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

/* ---------- Seed Data (fixed 4 phases) ---------- */
function seedData(){
  return {
    version:1,
    phases:[
      { id:"p1", title:"Pre‑Departure", suspense:"2025-09-23", tasks:[
        {id:nowId("t"), title:"Complete Initial Assignment Briefing in vMPF (within 7 days of RIP)", due:"2025-08-15", desc:"", done:false},
        {id:nowId("t"), title:"Fill out and upload Assignment Information Worksheet", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"Verify dependents in DEERS / print DD 1172-2", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"Complete SOES/SGLI update in milConnect; print certified copy", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"Start FMTS and Initial Travel Screening Questionnaire (ITSQ)", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"Schedule/complete Immunizations Memo (86 MDG Immunizations)", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"Obtain Security Clearance Memorandum from unit Security Manager (SECRET; validate in DISS)", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"Check retainability requirement; start with CSS; obtain signed Retention memo", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"If dependents, complete DAF 965 Overseas Tour Election (only if required)", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"If TDY enroute, attach RIP + funding info", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"If carrying firearms, record POF details (Make/Model/Serial)", due:"2025-09-23", desc:"", done:false},
        {id:nowId("t"), title:"(Optional) Sign AOI Acknowledgement Memo", due:"2025-09-01", desc:"", done:false},
        {id:nowId("t"), title:"(Optional) Upload Assignment Worksheet, medical clearance initiation screenshot, DD1172-2", due:"2025-09-01", desc:"", done:false},
        {id:nowId("t"), title:"(Optional) Use AOI orders for HHG/Passenger Travel scheduling — cannot depart without amendment validating FMTS/security clearance", due:"2025-09-10", desc:"", done:false},
        // extras
        {id:nowId("t"), title:"Decide car plan: ship, sell, or drive (paperwork path)", due:"2025-08-25", desc:"Get quotes and DMV/shipper requirements.", done:false},
        {id:nowId("t"), title:"Cats: schedule vet checkups & travel health certificates for 3 cats", due:"2025-08-20", desc:"Ask clinic for airline/base requirements.", done:false},
      ]},
      { id:"p2", title:"Mid Prep", suspense:"2025-11-30", tasks:[
        {id:nowId("t"), title:"VIPER Folder – upload all required docs; CSS marks 'In Person Final Out Ready – Submitted to MPF.'", due:"2025-11-15", desc:"", done:false},
        {id:nowId("t"), title:"Relocation Processing Memorandum", due:"2025-11-10", desc:"", done:false},
        {id:nowId("t"), title:"Weapons training current (AF 522 if required)", due:"2025-10-31", desc:"", done:false},
        {id:nowId("t"), title:"Security debrief / badge turn‑in", due:"2025-11-30", desc:"", done:false},
        {id:nowId("t"), title:"Family Care Plan (AF 357) if single parent/mil‑to‑mil", due:"2025-10-15", desc:"", done:false},
        {id:nowId("t"), title:"GTC active / mission‑critical", due:"2025-10-01", desc:"", done:false},
        {id:nowId("t"), title:"AT/FP Brief (not required CONUS)", due:"2025-11-10", desc:"", done:false},
        {id:nowId("t"), title:"Fitness file closed/hand‑carried if applicable", due:"2025-11-20", desc:"", done:false},
        {id:nowId("t"), title:"Route for CC/DO/CCF/First Sgt signature", due:"2025-11-25", desc:"", done:false},
        {id:nowId("t"), title:"Virtual Outprocessing (vMPF) – complete all items except Outbound Assignments", due:"2025-11-20", desc:"", done:false},
        {id:nowId("t"), title:"Physical Fitness valid through 2026‑01‑31 (retest if due)", due:"2025-11-15", desc:"", done:false},
        {id:nowId("t"), title:"Orders Review – dependents, RNLTD, remarks", due:"2025-11-10", desc:"", done:false},
        {id:nowId("t"), title:"Household Goods (TMO) – after orders/AOI, schedule pack‑out", due:"2025-11-05", desc:"", done:false},
        {id:nowId("t"), title:"If traveling different routing: submit Circuitous Travel Memo", due:"2025-11-12", desc:"", done:false},
        // extra
        {id:nowId("t"), title:"Reserve lodging at Hill AFB before rental search (pet‑friendly)", due:"2025-11-01", desc:"", done:false},
      ]},
      { id:"p3", title:"Final Out", suspense:"2025-12-19", tasks:[
        {id:nowId("t"), title:"CSS Outprocessing – 1 duty day before MPF", due:"2025-12-18", desc:"", done:false},
        {id:nowId("t"), title:"Final Out Appointment (MPF) – WaitWhile; bring all docs", due:"2025-12-19", desc:"Checklist: Orders, SOES/SGLI, Relocation Memos, vOP, Immunizations, Security Memo", done:false},
        {id:nowId("t"), title:"Port Call – upload orders to PTA, confirm flight", due:"2025-12-10", desc:"", done:false},
        {id:nowId("t"), title:"Finance Outprocessing – DLA, travel voucher, GTC usage", due:"2025-12-19", desc:"", done:false}
      ]},
      { id:"p4", title:"Arrival (Hill AFB)", suspense:"2026-01-31", tasks:[
        {id:nowId("t"), title:"Report to unit CSS within 24 hrs", due:"2026-01-02", desc:"", done:false},
        {id:nowId("t"), title:"In‑process Finance (update BAH, COLA, etc.)", due:"2026-01-05", desc:"", done:false},
        {id:nowId("t"), title:"In‑process Medical at Hill AFB Clinic", due:"2026-01-05", desc:"", done:false},
        {id:nowId("t"), title:"Update DEERS/Tricare with new address", due:"2026-01-06", desc:"", done:false},
        {id:nowId("t"), title:"Secure housing (on/off base)", due:"2026-01-15", desc:"", done:false},
        {id:nowId("t"), title:"School/childcare enrollment for dependents", due:"2026-01-10", desc:"", done:false},
        {id:nowId("t"), title:"Register vehicle(s) / base access decals as applicable", due:"2026-01-07", desc:"", done:false},
      ]},
    ],
    timeline:[
      {date:"2025-07-15", title:"Assignment notification RIP issued", phase:null, done:true},
      {date:"2025-08-15", title:"Initial Assignment Briefing complete; begin medical/security/immunizations", phase:"Pre‑Departure", done:true},
      {date:"2025-09-23", title:"Document suspense — AW, DD1172‑2, FMTS/ITSQ, Immunizations, Security Memo, Retainability memo uploaded", phase:"Pre‑Departure", done:false},
      {date:"2025-10-15", title:"Follow up FMTS clearance; VIPER folder check", phase:"Mid Prep", done:false},
      {date:"2025-11-15", title:"Relocation Memo routing, vOP, fitness if due. Schedule HHG. Circuitous Travel if needed.", phase:"Mid Prep", done:false},
      {date:"2025-12-05", title:"Confirm orders and port call", phase:"Final Out", done:false},
      {date:"2025-12-18", title:"CSS Outprocessing", phase:"Final Out", done:false},
      {date:"2025-12-19", title:"MPF Final Out appointment", phase:"Final Out", done:false},
      {date:"2025-12-22", title:"Projected Departure", phase:"Final Out", done:false},
      {date:"2026-01-31", title:"Report to Hill AFB by RNLTD 31 Jan; in‑process unit, finance, housing, medical", phase:"Arrival (Hill AFB)", done:false}
    ]
  };
}

/* ---------- Persistence ---------- */
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    const data = JSON.parse(raw);
    return data && data.version===1 ? data : null;
  }catch(e){ return null; }
}
let STATE = loadState() || seedData();
save();
function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); }catch(e){} }

/* ---------- Router (#/home, #/phase/:id, #/timeline) ---------- */
window.addEventListener("hashchange", route);
function route(){
  const h = location.hash || "#/home";
  if(h.startsWith("#/phase/")) renderPhase(h.split("/")[2]);
  else if(h.startsWith("#/timeline")) renderTimeline();
  else renderHome();
}
/* Nav buttons */
$("#homeNav").onclick = ()=> location.hash="#/home";
$("#timelineNav").onclick = $("#timelineBtnTop").onclick = ()=> location.hash="#/timeline";
$("#menuBtn").onclick = ()=> openActionSheet();
$("#addNav").onclick = ()=> openActionSheet();

/* ---------- Helpers ---------- */
function progress(phase){
  const total = phase.tasks.length;
  const done = phase.tasks.filter(t=>t.done).length;
  const pct = total? Math.round(done/total*100): 0;
  const next = nextDue(phase);
  return {total, done, pct, next};
}
function nextDue(phase){
  const today="0000-00-00";
  const dates = phase.tasks.filter(t=>!t.done && t.due).map(t=>t.due).sort();
  return dates[0] || "";
}
function textClamp(str, max){ if(!str) return ""; if(str.length<=max) return str; return str.slice(0,max-1)+"…"; }

/* ---------- Home (Puzzle Board) ---------- */
function renderHome(){
  const root = $("#viewRoot");
  root.innerHTML = "";
  const board = document.createElement("section");
  board.className = "board";
  // compute number of fully completed phases
  let completedPhases = 0;
  STATE.phases.forEach((p,i)=>{
    const {total, done, pct, next} = progress(p);
    if(total>0 && done===total) completedPhases++;
    const piece = document.createElement("article");
    piece.className = `piece p${i+1}`;
    piece.innerHTML = `
      <div>
        <h3>${p.title}</h3>
        <div class="sub">${done}/${total} complete</div>
        <div class="progress" aria-label="progress"><span style="width:${pct}%"></span></div>
        <div class="sub">${next?`Next: ${next}`:`No pending dates`}</div>
      </div>
    `;
    piece.addEventListener("click", ()=> location.hash = `#/phase/${p.id}`);
    board.appendChild(piece);
  });
  if(completedPhases>0) board.classList.add(`connect-${Math.min(4,completedPhases)}`);
  root.appendChild(board);
}

/* ---------- Phase Detail ---------- */
function renderPhase(phaseId){
  const phase = STATE.phases.find(p=>p.id===phaseId);
  if(!phase){ location.hash="#/home"; return; }
  const root = $("#viewRoot"); root.innerHTML = "";
  const header = document.createElement("div");
  header.className="header-row";
  const title = document.createElement("div"); title.className="phase-title"; title.textContent = phase.title;
  const back = document.createElement("button"); back.className="btn"; back.textContent="← Home"; back.onclick=()=>location.hash="#/home";
  header.appendChild(back); header.appendChild(title);
  root.appendChild(header);

  const list = document.createElement("div"); list.className="tasks";

  const tasksSorted = phase.tasks.slice().sort((a,b)=>{
    if(a.done!==b.done) return a.done?1:-1;
    const ad=a.due||"", bd=b.due||""; if(ad&&bd){ const c=ad.localeCompare(bd); if(c) return c; }
    if(ad&&!bd) return -1; if(!ad&&bd) return 1;
    return a.title.localeCompare(b.title);
  });

  let completed = [];

  tasksSorted.forEach(t=>{
    const item = document.createElement("div"); item.className="task";
    const row = document.createElement("div"); row.className="row";

    const box = document.createElement("button"); box.className="check"+(t.done?" done":""); box.setAttribute("aria-label","Toggle complete");
    box.textContent = t.done?"✓":"";
    box.onclick = ()=>{ t.done = !t.done; save(); renderPhase(phaseId); };

    const mid = document.createElement("div");
    const ttl = document.createElement("div"); ttl.className="title"; ttl.textContent = textClamp(t.title, MAX_TITLE);
    // inline edit via prompt on click
    ttl.title = t.title;
    ttl.onclick = ()=>{
      const v = prompt("Edit title (max "+MAX_TITLE+")", t.title)||t.title;
      t.title = v.slice(0,MAX_TITLE); save(); renderPhase(phaseId);
    };
    const date = document.createElement("div"); date.className="date"; date.textContent = t.due? t.due : "No date";
    mid.appendChild(ttl); mid.appendChild(date);

    const che = document.createElement("button"); che.className="chev"; che.textContent="▾";
    che.onclick = ()=>{
      const m = item.querySelector(".meta");
      m.classList.toggle("open");
      che.textContent = m.classList.contains("open")?"▴":"▾";
    };

    row.appendChild(box); row.appendChild(mid); row.appendChild(che);
    item.appendChild(row);

    const meta = document.createElement("div"); meta.className="meta";
    const dlabel = document.createElement("label"); dlabel.className="label"; dlabel.textContent="Description";
    const p = document.createElement("p"); p.className="small"; p.textContent = t.desc? textClamp(t.desc, PREVIEW_DESC) : "No description";
    const editDesc = document.createElement("button"); editDesc.className="btn"; editDesc.textContent="Edit description";
    editDesc.onclick = ()=>{
      const v = prompt("Description (max "+MAX_DESC+")", t.desc||"")||"";
      t.desc = v.slice(0,MAX_DESC); save(); renderPhase(phaseId);
    };
    const dl = document.createElement("label"); dl.className="label"; dl.textContent="Due date";
    const di = document.createElement("input"); di.className="input"; di.type="date"; di.value = t.due||"";
    di.onchange = ()=>{ t.due = di.value||null; save(); renderPhase(phaseId); };
    const del = document.createElement("button"); del.className="btn danger"; del.textContent="Delete task";
    del.onclick = ()=> confirmDialog(`Delete task “${textClamp(t.title,40)}”?`, ()=>{
      phase.tasks = phase.tasks.filter(x=>x.id!==t.id); save(); renderPhase(phaseId);
    });

    meta.appendChild(dlabel); meta.appendChild(p); meta.appendChild(editDesc); meta.appendChild(dl); meta.appendChild(di); meta.appendChild(del);
    item.appendChild(meta);

    (t.done? completed: list).appendChild(item);
  });

  // Completed collapsible
  if(completed.children && completed.children.length>0){
    const wrap = document.createElement("details"); wrap.style.marginTop="8px";
    const sum = document.createElement("summary"); sum.textContent = `Completed (${completed.children.length})`;
    wrap.appendChild(sum);
    while(completed.firstChild){ wrap.appendChild(completed.firstChild); }
    root.appendChild(list); root.appendChild(wrap);
  }else{
    root.appendChild(list);
  }

  // Add button opens task sheet preselected phase
  $("#addNav").onclick = ()=> openTaskSheet(phase.id);
}

/* ---------- Timeline ---------- */
function renderTimeline(){
  const root = $("#viewRoot"); root.innerHTML = "";
  const hdr = document.createElement("div"); hdr.className="header-row";
  hdr.innerHTML = `<div class="phase-title">Master Timeline</div>`;
  root.appendChild(hdr);

  const grouped = {};
  // collect tasks with due + milestones
  STATE.phases.forEach(p=> p.tasks.forEach(t=>{ if(t.due){ (grouped[t.due.slice(0,7)] ||= []).push({type:"task", date:t.due, title:t.title, phase:p, task:t}); } }));
  STATE.timeline.forEach(m=>{ (grouped[m.date.slice(0,7)] ||= []).push({type:"mile", date:m.date, title:m.title, phase:null}); });
  const months = Object.keys(grouped).sort();
  months.forEach(m=>{
    const h = document.createElement("div"); h.className="month"; h.textContent = m;
    root.appendChild(h);
    grouped[m].sort((a,b)=> a.date.localeCompare(b.date));
    grouped[m].forEach(entry=>{
      const row = document.createElement("div"); row.className="timeline-item";
      const left = document.createElement("div");
      left.innerHTML = `<div>${entry.title}</div><div class="small">${entry.date}${entry.type==="task"?" • "+entry.phase.title:""}</div>`;
      const right = document.createElement("div");
      if(entry.type==="task"){
        const btn = document.createElement("button"); btn.className="btn"; btn.textContent="Edit";
        btn.onclick = ()=>{ location.hash = `#/phase/${entry.phase.id}`; setTimeout(()=>{ /* open sheet? keep simple */ }, 50); };
        right.appendChild(btn);
      }
      row.appendChild(left); row.appendChild(right);
      root.appendChild(row);
    });
  });
}

/* ---------- Action Sheet / Task Sheet ---------- */
function openActionSheet(){
  $("#actionScrim").classList.remove("hidden");
  $("#actionSheet").classList.remove("hidden");
  document.documentElement.classList.add("modal-open");
  $("#asAddTask").onclick = ()=>{ closeActionSheet(); openTaskSheet(); };
  $("#asCancel").onclick = closeActionSheet;
  $("#actionScrim").onclick = closeActionSheet;
  document.onkeydown = (e)=>{ if(e.key==="Escape") closeActionSheet(); };
}
function closeActionSheet(){
  $("#actionScrim").classList.add("hidden");
  $("#actionSheet").classList.add("hidden");
  document.documentElement.classList.remove("modal-open");
  document.onkeydown = null;
}

function openTaskSheet(phaseId){
  // Fill phase options
  const sel = $("#taskPhase"); sel.innerHTML="";
  STATE.phases.forEach(p=>{
    const opt=document.createElement("option"); opt.value=p.id; opt.textContent=p.title;
    if(phaseId && phaseId===p.id) opt.selected = true;
    sel.appendChild(opt);
  });
  $("#taskTitle").value=""; $("#taskDue").value=""; $("#taskDesc").value="";
  $("#taskScrim").classList.remove("hidden"); $("#taskSheet").classList.remove("hidden");
  document.documentElement.classList.add("modal-open");
  $("#taskCancel").onclick = closeTaskSheet;
  $("#taskScrim").onclick = closeTaskSheet;
  document.onkeydown = (e)=>{ if(e.key==="Escape") closeTaskSheet(); };
  $("#taskSave").onclick = ()=>{
    const phase = STATE.phases.find(p=>p.id===sel.value);
    const title = ($("#taskTitle").value || "").trim().slice(0,MAX_TITLE);
    if(!phase || !title){ toast("Title required"); return; }
    const due = $("#taskDue").value || null;
    const desc = ($("#taskDesc").value||"").slice(0,MAX_DESC);
    phase.tasks.push({ id: nowId("t"), title, due, desc, done:false });
    save();
    closeTaskSheet();
    toast("Task added");
    route(); // refresh current view
  };
}
function closeTaskSheet(){
  $("#taskScrim").classList.add("hidden"); $("#taskSheet").classList.add("hidden");
  document.documentElement.classList.remove("modal-open");
  document.onkeydown = null;
}

/* ---------- Confirm & Toast ---------- */
function confirmDialog(message, onOk){
  $("#confirmMsg").textContent = message;
  $("#confirmScrim").classList.remove("hidden");
  $("#confirm").classList.remove("hidden");
  document.documentElement.classList.add("modal-open");
  $("#confirmCancel").onclick = closeConfirm;
  $("#confirmScrim").onclick = closeConfirm;
  $("#confirmOk").onclick = ()=>{ closeConfirm(); onOk&&onOk(); };
  document.onkeydown = (e)=>{ if(e.key==="Escape") closeConfirm(); };
}
function closeConfirm(){
  $("#confirmScrim").classList.add("hidden"); $("#confirm").classList.add("hidden");
  document.documentElement.classList.remove("modal-open");
  document.onkeydown = null;
}
function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.hidden=false;
  clearTimeout(toast._t); toast._t = setTimeout(()=> t.hidden=true, 2200);
}

/* ---------- Boot ---------- */
route();
