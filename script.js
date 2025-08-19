
const STORAGE_KEY="pcsChecklist.v1";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const db=(f,m=200)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),m)}};
const byDue=(a,b)=>{const ad=a.due||"",bd=b.due||"";if(ad&&bd){const c=ad.localeCompare(bd);if(c)return c}if(ad&&!bd)return -1;if(!ad&&bd)return 1;return (a.title||"").localeCompare(b.title||"")};
const byCompletedAtDesc=(a,b)=>(b.completedAt||0)-(a.completedAt||0);
const esc=(s="")=>s.replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));

let state = safeLoad() || seedData(); safeSave();

function safeLoad(){ try{ const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return null; const obj=JSON.parse(raw); if(!obj||!Array.isArray(obj.phases)||obj.phases.length===0) return null; return obj;}catch(e){ report(e); return null; } }
const safeSave=db(()=>{ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ report(e); } },200);

function seedData(){
  const now=Date.now();
  return { phases:[
    {id:"p1",title:"Pre‑Departure",tasks:[
      {id:"t1",title:"Complete Initial Assignment Briefing in vMPF (within 7 days of RIP)",due:"2025-08-15",desc:"",done:false,createdAt:now},
      {id:"t2",title:"Fill out and upload Assignment Information Worksheet",due:"2025-09-23",desc:"",done:false,createdAt:now},
      {id:"tCars",title:"Decide car plan: ship, sell, or drive (paperwork)",due:"2025-09-01",desc:"",done:false,createdAt:now},
      {id:"tCats",title:"Cats (3): vet checkups + health certificates",due:"2025-08-30",desc:"",done:false,createdAt:now}
    ]},
    {id:"p2",title:"Mid Prep",tasks:[
      {id:"tVip",title:"VIPER Folder — upload required docs",due:"2025-11-15",desc:"",done:false,createdAt:now},
      {id:"tLodging",title:"Reserve lodging at Hill AFB (pet‑friendly)",due:"2025-10-20",desc:"",done:false,createdAt:now}
    ]},
    {id:"p3",title:"Final Out",tasks:[
      {id:"tCss",title:"CSS Outprocessing — 1 duty day before MPF",due:"2025-12-18",desc:"",done:false,createdAt:now},
      {id:"tFin",title:"Finance Outprocessing (CPTS) — DLA, voucher, GTC",due:"2025-12-19",desc:"",done:false,createdAt:now}
    ]},
    {id:"p4",title:"Arrival",tasks:[
      {id:"tRpt",title:"Report to unit CSS within 24 hrs",due:"2026-01-02",desc:"",done:false,createdAt:now},
      {id:"tVeh",title:"Register vehicles / base access decals",due:"2026-01-06",desc:"",done:false,createdAt:now}
    ]}
  ],
  timeline:[
    {date:"2025-07-15",title:"Assignment notification RIP issued",phase:null,done:true},
    {date:"2025-09-23",title:"Document suspense — upload AW, DD1172‑2, FMTS/ITSQ, immunizations, security memo, retainability",phase:"Pre‑Departure",done:false},
    {date:"2025-12-19",title:"MPF Final Out appointment",phase:"Final Out",done:false},
    {date:"2026-01-31",title:"Report to Hill AFB by RNLTD; in‑process unit, finance, housing, medical",phase:"Arrival",done:false}
  ]};
}

function report(err){ try{ const box=$("#fatal"); box.style.display="block"; box.textContent="JavaScript error: "+(err&&err.message?err.message:err); }catch(_){ } }

function route(){
  hideOverlays();
  const h=location.hash||"#/home";
  if(h.startsWith("#/phase/")){ currentPhaseId=decodeURIComponent(h.split("/")[2]); show("viewPhase"); renderPhaseDetail(currentPhaseId); }
  else if(h.startsWith("#/timeline")){ show("viewTimeline"); renderTimeline(); }
  else { show("viewHome"); renderHome(); }
}
window.addEventListener("hashchange", route);
function show(id){ $$(".view").forEach(v=>v.classList.remove("active")); $("#"+id).classList.add("active"); }
function hideOverlays(){ ["confirm","scrim","addTaskSheet"].forEach(id=>{ const el=$("#"+id); if(el) el.hidden=true; }); document.documentElement.classList.remove("modal-open"); }

function stats(p){ const total=p.tasks.length; const done=p.tasks.filter(t=>t.done).length; const next=p.tasks.filter(t=>!t.done&&t.due).map(t=>t.due).sort()[0]||null; return {total,done,next}; }
function renderHome(){
  const sc=$("#phaseCarousel"); const dots=$("#carouselDots");
  sc.innerHTML=""; dots.innerHTML="";
  state.phases.forEach((p,i)=>{
    const s=stats(p);
    const card=document.createElement("button"); card.className="phase-card"; card.dataset.phaseId=p.id;
    card.innerHTML=`<div class="phase-header-row"><div class="phase-title">${esc(p.title)}</div><div class="phase-metrics">${s.done}/${s.total} complete</div></div>
    <div class="progress"><div class="progress-fill" style="width:${s.total?Math.round(s.done/s.total*100):0}%"></div></div>
    <div class="next-date">Next: ${s.next||"—"}</div>`;
    sc.appendChild(card);
    const d=document.createElement("div"); d.className="dot"+(i===0?" active":""); d.dataset.index=i; dots.appendChild(d);
  });
  $("#bootHint").style.display = state.phases.length? "none":"block";
  sc.onclick=(e)=>{ const btn=e.target.closest(".phase-card"); if(!btn) return; location.hash = "#/phase/"+encodeURIComponent(btn.dataset.phaseId); };
  sc.addEventListener("scroll", onCarouselScroll, {passive:true}); requestAnimationFrame(onCarouselScroll);
}
function onCarouselScroll(){
  const sc=$("#phaseCarousel"); const center=sc.getBoundingClientRect().left+sc.clientWidth/2;
  const cards=$$(".phase-card", sc); let best=0,dist=1e9;
  cards.forEach((c,i)=>{ const r=c.getBoundingClientRect(); const d=Math.abs((r.left+r.width/2)-center); if(d<dist){dist=d;best=i;} });
  $$(".dot").forEach((d,i)=> d.classList.toggle("active", i===best));
}

let currentPhaseId=null;
function renderPhaseDetail(id){
  const p=state.phases.find(x=>x.id===id); if(!p){ location.hash="#/home"; return; }
  $("#phaseTitleInput").value=p.title; renderTaskLists(id);
}
function renderTaskLists(id){
  const p=state.phases.find(x=>x.id===id);
  const active=p.tasks.filter(t=>!t.done).sort(byDue);
  const completed=p.tasks.filter(t=>t.done).sort(byCompletedAtDesc);
  const a=$("#activeList"), c=$("#completedList"); a.innerHTML=""; c.innerHTML="";
  $("#emptyPhase").hidden = !(active.length===0 && completed.length===0);
  active.forEach(t=> a.appendChild(renderTaskRow(id,t)));
  $("#completedLabel").textContent = `Completed (${completed.length})`;
  completed.forEach(t=> c.appendChild(renderTaskRow(id,t,true)));
  const block=$("#completedBlock"); if(completed.length>5 && !block.hasAttribute("data-user")) block.open=false;
}
function renderTaskRow(pid, t, done=false){
  const row=document.createElement("div"); row.className="task-row"; row.dataset.phaseId=pid; row.dataset.taskId=t.id;
  row.innerHTML=`<button class="check${t.done?' done':''}" aria-label="Toggle">
      ${t.done?'<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>':''}
    </button>
    <div class="task-main"><div class="task-title">${esc(t.title)}</div><div class="task-date">${t.due||'No date'}</div></div>
    <button class="expand-btn" aria-label="Expand"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="currentColor"/></svg></button>`;
  const desc=document.createElement("div"); desc.className="task-desc";
  desc.innerHTML=`<div class="desc-text">${esc(t.desc||"")}</div>
    <div class="desc-actions">
      <label class="label" for="date-${t.id}">Due Date</label>
      <input id="date-${t.id}" class="input" type="date" value="${t.due||''}">
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="btn small" data-action="edit-desc">Edit description</button>
        <button class="btn danger small" data-action="delete-task">Delete</button>
      </div>
    </div>`;
  const frag=document.createDocumentFragment(); frag.appendChild(row); frag.appendChild(desc); return frag;
}

$("#btnBack").addEventListener("click", ()=> location.hash="#/home");
let prevTitle=""; $("#phaseTitleInput").addEventListener("focus",e=> prevTitle=e.target.value);
$("#phaseTitleInput").addEventListener("keydown",e=>{ if(e.key==="Escape"){e.target.value=prevTitle;e.target.blur();} if(e.key==="Enter"){e.preventDefault();e.target.blur();} });
$("#phaseTitleInput").addEventListener("blur",e=>{ const p=state.phases.find(x=>x.id===currentPhaseId); if(!p) return; const v=(e.target.value||"").trim()||"Untitled"; if(p.title!==v){ p.title=v; safeSave(); renderHome(); } });

$("#taskLists").addEventListener("click", e=>{
  const row=e.target.closest(".task-row"); const btn=e.target.closest("button"); if(!row||!btn) return;
  if(btn.classList.contains("expand-btn")){ row.classList.toggle("expanded"); const d=row.nextElementSibling; if(d&&d.classList.contains("task-desc")) d.style.display=row.classList.contains("expanded")?"block":"none"; return; }
  if(btn.classList.contains("check")){ const {phaseId,taskId}=row.dataset; const p=state.phases.find(x=>x.id===phaseId); const t=p.tasks.find(x=>x.id===taskId); t.done=!t.done; t.completedAt=t.done?Date.now():null; safeSave(); renderTaskLists(phaseId); renderHome(); return; }
  if(btn.dataset.action==="delete-task"){ const {phaseId,taskId}=row.dataset; const p=state.phases.find(x=>x.id===phaseId); if(confirm(`Delete task “${row.querySelector(".task-title").textContent}”?`)){ p.tasks=p.tasks.filter(x=>x.id!==taskId); safeSave(); renderTaskLists(phaseId); renderHome(); } return; }
  if(btn.dataset.action==="edit-desc"){ const {phaseId,taskId}=row.dataset; const p=state.phases.find(x=>x.id===phaseId); const t=p.tasks.find(x=>x.id===taskId); const next=prompt("Edit description (max 180 chars):",(t.desc||"").slice(0,180)); if(next!==null){ t.desc=(next||"").slice(0,180); safeSave(); renderTaskLists(phaseId); } return; }
});
$("#taskLists").addEventListener("change", e=>{
  if(!e.target.matches('input[type="date"]')) return;
  const desc=e.target.closest(".task-desc"); const row=desc?.previousElementSibling; if(!row) return;
  const {phaseId,taskId}=row.dataset; const p=state.phases.find(x=>x.id===phaseId); const t=p.tasks.find(x=>x.id===taskId); t.due=e.target.value||null; safeSave(); renderTaskLists(phaseId); renderHome();
});

$("#navHome").addEventListener("click",()=> location.hash="#/home");
$("#navTimeline").addEventListener("click",()=> location.hash="#/timeline");
$("#btnTimelineTop").addEventListener("click",()=> location.hash="#/timeline");
$("#navAdd").addEventListener("click",()=>{
  let pid=currentPhaseId;
  if($("#viewHome").classList.contains("active")){ const dots=$$(".dot"); const idx=dots.findIndex(d=>d.classList.contains("active")); pid=(state.phases[idx>=0?idx:0]||state.phases[0]).id; }
  if($("#viewTimeline").classList.contains("active")) pid=state.phases[0].id;
  openAddTaskSheet(pid);
});

function openAddTaskSheet(pid){
  const sel=$("#taskPhase"); sel.innerHTML=""; state.phases.forEach(p=>{ const o=document.createElement("option"); o.value=p.id; o.textContent=p.title; if(p.id===pid) o.selected=true; sel.appendChild(o); });
  $("#taskTitle").value=""; $("#taskDue").value=""; $("#taskDesc").value="";
  document.documentElement.classList.add("modal-open"); $("#scrim").hidden=false; $("#addTaskSheet").hidden=false;
}
function closeSheet(){ document.documentElement.classList.remove("modal-open"); $("#scrim").hidden=true; $("#addTaskSheet").hidden=true; }
$("#sheetClose").addEventListener("click", closeSheet);
$("#btnCancelTask").addEventListener("click", closeSheet);
$("#scrim").addEventListener("click", closeSheet);
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeSheet(); });
$("#taskForm").addEventListener("submit", e=>{
  e.preventDefault();
  const pid=$("#taskPhase").value; const title=($("#taskTitle").value||"").trim().slice(0,60); if(!title){ $("#taskTitle").focus(); return; }
  const due=$("#taskDue").value||null; const desc=($("#taskDesc").value||"").trim().slice(0,180);
  const p=state.phases.find(x=>x.id===pid); p.tasks.push({id:"t_"+Date.now()+"_"+Math.random().toString(36).slice(2,5),title,due,desc,done:false,createdAt:Date.now()});
  safeSave(); closeSheet(); if(currentPhaseId===pid) renderTaskLists(pid); renderHome(); notify("Task added");
});

function renderTimeline(){
  const list=$("#timelineList"); list.innerHTML="";
  const items=[]; state.phases.forEach(p=> p.tasks.forEach(t=>{ if(t.due) items.push({type:"task",date:t.due,title:t.title,phase:p.title,phaseId:p.id,taskId:t.id}); }));
  state.timeline.forEach(m=> items.push({type:"milestone",date:m.date,title:m.title,phase:m.phase}));
  items.sort((a,b)=> a.date.localeCompare(b.date));
  let last=""; items.forEach(it=>{
    const month=it.date.slice(0,7); if(month!==last){ const ml=document.createElement("div"); ml.className="month-label"; ml.textContent=new Date(month+"-01").toLocaleString(undefined,{month:"long",year:"numeric"}); list.appendChild(ml); last=month; }
    const row=document.createElement("button"); row.className="task-row"; row.dataset.date=it.date;
    row.innerHTML=`<div class="check" aria-hidden="true" style="border-radius:12px;width:12px;height:12px;"></div>
    <div class="task-main"><div class="task-title">${esc(it.title)}</div><div class="task-date">${it.date}${it.phase?" • "+esc(it.phase):""}</div></div><div style="width:28px;"></div>`;
    row.addEventListener("click", ()=>{ if(it.type==="task"){ location.hash="#/phase/"+encodeURIComponent(it.phaseId); setTimeout(()=>{ const tr=$('.task-row[data-task-id="'+it.taskId+'"]'); if(tr){ tr.classList.add("expanded"); const d=tr.nextElementSibling; if(d) d.style.display="block"; } },90); } });
    list.appendChild(row);
  });
}

function notify(m){ const t=$("#toast"); t.textContent=m; t.classList.remove("hidden"); clearTimeout(notify._t); notify._t=setTimeout(()=> t.classList.add("hidden"),1500); }

route(); renderHome();
