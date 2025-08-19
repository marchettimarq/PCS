
const STORAGE_KEY="pcsChecklist.v1";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=(s="")=>s.replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const byDue=(a,b)=>{const ad=a.due||"",bd=b.due||"";if(ad&&bd){const c=ad.localeCompare(bd);if(c)return c}if(ad&&!bd)return -1;if(!ad&&bd)return 1;return (a.title||"").localeCompare(b.title||"")};
const byCompletedAtDesc=(a,b)=>(b.completedAt||0)-(a.completedAt||0);
const save=(()=>{let t;return()=>{clearTimeout(t);t=setTimeout(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state)),180)}})();

let state=load()||seed(); save();

function load(){
  try{const raw=localStorage.getItem(STORAGE_KEY); if(!raw) return null;
      const obj=JSON.parse(raw); if(!obj || !Array.isArray(obj.phases) || obj.phases.length===0) return null; return obj;
  }catch(e){ return null }
}
function seed(){
  const now=Date.now();
  return { phases:[
      {id:"p1",title:"Pre‑Departure",tasks:[
        {id:"t1",title:"Initial Assignment Briefing (vMPF)",due:"2025-08-15",desc:"",done:false,createdAt:now},
        {id:"tCats",title:"Cats (3): checkups + health certificates",due:"2025-08-30",desc:"",done:false,createdAt:now}]},
      {id:"p2",title:"Mid Prep",tasks:[
        {id:"tVip",title:"VIPER folder — upload docs",due:"2025-11-15",desc:"",done:false,createdAt:now}]},
      {id:"p3",title:"Final Out",tasks:[{id:"tCss",title:"CSS Outprocessing",due:"2025-12-18",desc:"",done:false,createdAt:now}]},
      {id:"p4",title:"Arrival",tasks:[{id:"tRpt",title:"Report to unit CSS within 24 hrs",due:"2026-01-02",desc:"",done:false,createdAt:now}]}
    ],
    timeline:[{date:"2025-12-19",title:"MPF Final Out",phase:"Final Out",done:false}]
  }
}

/* --- Router --- */
let currentPhaseId=null;
function show(id){$$(".view").forEach(v=>v.classList.remove("active"));$("#"+id).classList.add("active")}
function route(){
  $("#scrim").hidden=true; $("#addTaskSheet").hidden=true;
  const h=location.hash||"#/home";
  if(h.startsWith("#/phase/")){ currentPhaseId=decodeURIComponent(h.split("/")[2]); show("viewPhase"); renderPhase(currentPhaseId); }
  else if(h.startsWith("#/timeline")){ show("viewTimeline"); renderTimeline(); }
  else { show("viewHome"); renderHome(); }
}
window.addEventListener("hashchange",route);

/* --- Home --- */
function stats(p){const total=p.tasks.length;const done=p.tasks.filter(t=>t.done).length;
  const next=p.tasks.filter(t=>!t.done && t.due).map(t=>t.due).sort()[0]||null; return {total,done,next}}
function renderHome(){
  // Auto-reseed fallback if something cleared phases in a bad way
  if(!state.phases || state.phases.length===0){ state=seed(); save(); }
  const scroller=$("#phaseCarousel"); scroller.innerHTML="";
  const dots=$("#carouselDots"); dots.innerHTML="";
  state.phases.forEach((p,i)=>{
    const s=stats(p);
    const card=document.createElement("button");
    card.className="phase-card"; card.dataset.phaseId=p.id;
    card.innerHTML=`<div class="phase-header-row"><div class="phase-title">${esc(p.title)}</div><div class="phase-metrics">${s.done}/${s.total} complete</div></div>
                    <div class="progress"><div class="progress-fill" style="width:${s.total?Math.round(s.done/s.total*100):0}%"></div></div>
                    <div class="next-date">Next: ${s.next||"—"}</div>`;
    scroller.appendChild(card);
    const dot=document.createElement("div"); dot.className="dot"+(i===0?" active":""); dots.appendChild(dot);
  });
  scroller.onclick=(e)=>{const card=e.target.closest(".phase-card"); if(card) location.hash="#/phase/"+card.dataset.phaseId;}
}
$("#btnTimelineTop").onclick=()=>location.hash="#/timeline";

/* --- Phase detail --- */
function renderPhase(id){
  const p=state.phases.find(x=>x.id===id); if(!p){location.hash="#/home";return}
  $("#phaseTitleInput").value=p.title;
  renderTaskLists(id);
}
function renderTaskLists(id){
  const p=state.phases.find(x=>x.id===id);
  const active=p.tasks.filter(t=>!t.done).sort(byDue);
  const completed=p.tasks.filter(t=>t.done).sort(byCompletedAtDesc);
  const act=$("#activeList"), comp=$("#completedList"); act.innerHTML=""; comp.innerHTML="";
  $("#emptyPhase").hidden=!(active.length===0 && completed.length===0);
  active.forEach(t=>act.appendChild(renderTaskRow(id,t)));
  $("#completedLabel").textContent=`Completed (${completed.length})`;
  completed.forEach(t=>comp.appendChild(renderTaskRow(id,t,true)));
}
function renderTaskRow(phaseId,task,isCompleted=false){
  const row=document.createElement("div"); row.className="task-row"; row.dataset.phaseId=phaseId; row.dataset.taskId=task.id;
  row.innerHTML=`<button class="check${task.done?" done":""}">${task.done?'<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>':""}</button>
                 <div class="task-main"><div class="task-title">${esc(task.title)}</div><div class="task-date">${task.due||"No date"}</div></div>
                 <button class="expand-btn"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="currentColor"/></svg></button>`;
  const desc=document.createElement("div"); desc.className="task-desc";
  desc.innerHTML=`<div class="desc-text">${esc(task.desc||"")}</div>
                  <div class="desc-actions"><label class="label">Due Date</label>
                    <input class="input" type="date" value="${task.due||''}">
                    <div style="display:flex;gap:8px;margin-top:8px;">
                      <button class="btn small" data-action="delete">Delete</button>
                    </div></div>`;
  const frag=document.createDocumentFragment(); frag.appendChild(row); frag.appendChild(desc); return frag;
}
$("#taskLists").addEventListener("click",(e)=>{
  const row=e.target.closest(".task-row"); const btn=e.target.closest("button"); if(!row||!btn) return;
  if(btn.classList.contains("expand-btn")){ row.classList.toggle("expanded"); const d=row.nextElementSibling; if(d&&d.classList.contains("task-desc")) d.style.display=row.classList.contains("expanded")?"block":"none"; return; }
  if(btn.classList.contains("check")){
    const {phaseId,taskId}=row.dataset; const p=state.phases.find(x=>x.id===phaseId); const t=p.tasks.find(x=>x.id===taskId);
    t.done=!t.done; t.completedAt=t.done?Date.now():null; save(); renderTaskLists(phaseId); renderHome(); return;
  }
  if(btn.dataset.action==="delete"){
    const {phaseId,taskId}=row.dataset; const p=state.phases.find(x=>x.id===phaseId);
    p.tasks=p.tasks.filter(x=>x.id!==taskId); save(); renderTaskLists(phaseId); renderHome(); toast("Deleted");
  }
});
$("#taskLists").addEventListener("change",(e)=>{
  if(e.target.type==="date"){
    const desc=e.target.closest(".task-desc"); const row=desc.previousElementSibling; const {phaseId,taskId}=row.dataset;
    const p=state.phases.find(x=>x.id===phaseId); const t=p.tasks.find(x=>x.id===taskId); t.due=e.target.value||null; save(); renderTaskLists(phaseId); renderHome();
  }
});

/* --- Add Task sheet --- */
$("#navAdd").onclick=()=>{
  const sel=$("#taskPhase"); sel.innerHTML=""; state.phases.forEach(p=>{const o=document.createElement("option");o.value=p.id;o.textContent=p.title; if(p.id===currentPhaseId) o.selected=true; sel.appendChild(o);});
  $("#taskTitle").value=""; $("#taskDue").value=""; $("#taskDesc").value="";
  $("#scrim").hidden=false; $("#addTaskSheet").hidden=false;
};
$("#sheetClose").onclick=$("#btnCancelTask").onclick=()=>{ $("#scrim").hidden=true; $("#addTaskSheet").hidden=true; };
$("#scrim").onclick=()=>{ $("#scrim").hidden=true; $("#addTaskSheet").hidden=true; };
$("#taskForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const pid=$("#taskPhase").value; const title=$("#taskTitle").value.trim().slice(0,60); if(!title){$("#taskTitle").focus();return;}
  const due=$("#taskDue").value||null; const desc=$("#taskDesc").value.trim().slice(0,180);
  const p=state.phases.find(x=>x.id===pid); p.tasks.push({id:"t_"+Date.now(),title, due, desc, done:false, createdAt:Date.now()});
  save(); $("#scrim").hidden=true; $("#addTaskSheet").hidden=true; if(currentPhaseId===pid) renderTaskLists(pid); renderHome(); toast("Task added");
});

/* --- Timeline --- */
let timelineFilter="all";
$$(".filters .chip").forEach(ch=> ch.addEventListener("click",()=>{ $$(".filters .chip").forEach(c=>c.classList.remove("active")); ch.classList.add("active"); timelineFilter=ch.dataset.filter; renderTimeline(); }));
$("#btnJumpToday").onclick=()=>{ const t=new Date().toISOString().slice(0,10); const el=$(`[data-date="${t}"]`,$("#timelineList")); if(el) el.scrollIntoView({behavior:"smooth"}) };
function renderTimeline(){
  const list=$("#timelineList"); list.innerHTML="";
  const items=[]; state.phases.forEach(p=> p.tasks.forEach(t=>{ if(t.due) items.push({type:"task",date:t.due,title:t.title,phase:p.title,phaseId:p.id,taskId:t.id}); }));
  state.timeline.forEach(m=> items.push({type:"milestone",date:m.date,title:m.title,phase:m.phase}));
  const filt= timelineFilter==="all"? items: items.filter(i=> (i.phase||"")===timelineFilter);
  filt.sort((a,b)=>a.date.localeCompare(b.date));
  let last=""; filt.forEach(it=>{ const m=it.date.slice(0,7); if(m!==last){ const ml=document.createElement("div"); ml.className="month-label"; ml.textContent=new Date(m+"-01").toLocaleString(undefined,{month:"long",year:"numeric"}); list.appendChild(ml); last=m;}
    const row=document.createElement("button"); row.className="task-row"; row.dataset.date=it.date;
    row.innerHTML=`<div class="check" style="width:12px;height:12px;border-radius:12px"></div>
      <div class="task-main"><div class="task-title">${esc(it.title)}</div><div class="task-date">${it.date}${it.phase?" • "+esc(it.phase):""}</div></div><div style="width:28px"></div>`;
    row.onclick=()=>{ if(it.type==="task"){ location.hash="#/phase/"+it.phaseId; setTimeout(()=>{ const tr=$(\`.task-row[data-task-id="${it.taskId}"]\`); if(tr){ tr.classList.add("expanded"); const d=tr.nextElementSibling; if(d) d.style.display="block"; } },80); } };
    list.appendChild(row);
  });
}

/* --- Menu (includes Reset Data) --- */
$("#btnMenu").onclick=(e)=>{ const m=$("#menuPop"); m.hidden = !m.hidden; };
document.addEventListener("click",(e)=>{ if(!e.target.closest("#btnMenu") && !e.target.closest("#menuPop")) $("#menuPop").hidden=true; });
$("#miReset").onclick=()=>{ localStorage.removeItem(STORAGE_KEY); state=seed(); save(); route(); renderHome(); toast("Data reset"); $("#menuPop").hidden=true; };
$("#miAbout").onclick=()=>{ alert("easyPCS — mobile checklist (vanilla JS)."); $("#menuPop").hidden=true; };

$("#navHome").onclick=()=>location.hash="#/home";
$("#navTimeline").onclick=()=>location.hash="#/timeline";
$("#btnBack").onclick=()=>location.hash="#/home";

/* --- Toast --- */
function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.remove("hidden"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.add("hidden"),1500); }

/* Boot */
route(); renderHome();
