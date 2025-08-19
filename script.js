
// easyPCS: minimal clean build that must render reliably on first load
const STORAGE_KEY = 'pcsChecklist.v1';

/** ---- tiny helpers ---- */
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const save=()=>localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const toast=m=>{const s=$("#status"); s.textContent=m; clearTimeout(toast.t); toast.t=setTimeout(()=>s.textContent="",1500);};
const byDue=(a,b)=>{const A=a.due||"",B=b.due||""; if(A&&B){const c=A.localeCompare(B); if(c) return c;} if(A&&!B) return -1; if(!A&&B) return 1; return (a.title||"").localeCompare(b.title||"");};
const byCompletedAtDesc=(a,b)=>(b.completedAt||0)-(a.completedAt||0);

/** ---- state + seed ---- */
let state = load() || seed();
function load(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); const obj = raw? JSON.parse(raw): null;
    if(!obj || !Array.isArray(obj.phases) || obj.phases.length===0) return null; return obj;
  }catch(e){ return null; }
}
function seed(){
  const now=Date.now();
  const s= {
    phases:[
      {id:'p1',title:'Pre‑Departure',tasks:[
        {id:'t1',title:'Complete Initial Assignment Briefing in vMPF (within 7 days of RIP)',due:'2025-08-15',desc:'',done:false,createdAt:now},
        {id:'t2',title:'Fill out and upload Assignment Information Worksheet',due:'2025-09-23',desc:'',done:false,createdAt:now},
        {id:'tCats',title:'Cats (3): vet checkups + health certificates',due:'2025-08-30',desc:'',done:false,createdAt:now}
      ]},
      {id:'p2',title:'Mid Prep',tasks:[
        {id:'tviper',title:'VIPER Folder — upload required docs',due:'2025-11-15',desc:'',done:false,createdAt:now}
      ]},
      {id:'p3',title:'Final Out',tasks:[
        {id:'tcss',title:'CSS Outprocessing — 1 duty day before MPF',due:'2025-12-18',desc:'',done:false,createdAt:now}
      ]},
      {id:'p4',title:'Arrival',tasks:[
        {id:'trpt',title:'Report to unit CSS within 24 hrs',due:'2026-01-02',desc:'',done:false,createdAt:now}
      ]}
    ],
    timeline:[
      {date:'2025-07-15',title:'Assignment notification RIP issued',phase:null,done:true},
      {date:'2025-12-19',title:'MPF Final Out appointment',phase:'Final Out',done:false}
    ]
  };
  save.call({}); // ensure STORAGE_KEY exists
  return s;
}

/** ---- routing ---- */
let cur = null;
const show=id=>{$$('.view').forEach(v=>v.classList.remove('active')); $('#'+id).classList.add('active');};
function goHome(){ show('home'); renderHome(); }
function goPhase(id){ cur=id; show('phase'); renderPhase(id); }
function goTimeline(){ show('timeline'); renderTimeline(); }

/** ---- home ---- */
function renderHome(){
  const list=$("#phaseList"); list.innerHTML="";
  if(!state.phases || state.phases.length===0){ $("#homeEmpty").style.display='block'; return; }
  $("#homeEmpty").style.display='none';
  state.phases.forEach(p=>{
    const total=p.tasks.length, done=p.tasks.filter(t=>t.done).length;
    const next=(p.tasks.filter(t=>!t.done && t.due).map(t=>t.due).sort()[0])||'—';
    const card=document.createElement('button'); card.className='card'; card.onclick=()=>goPhase(p.id);
    card.innerHTML=`<h3>${p.title}</h3>
      <div class="progress"><div class="fill" style="width:${total?Math.round(done/total*100):0}%"></div></div>
      <div class="small">${done}/${total} complete • Next: ${next}</div>`;
    list.appendChild(card);
  });
}

/** ---- phase ---- */
function renderPhase(id){
  const p = state.phases.find(x=>x.id===id); if(!p){ goHome(); return; }
  $("#phaseTitle").value=p.title;
  const active=p.tasks.filter(t=>!t.done).sort(byDue);
  const completed=p.tasks.filter(t=>t.done).sort(byCompletedAtDesc);
  const list=$("#taskList"), comp=$("#completedList");
  list.innerHTML=""; comp.innerHTML="";
  active.forEach(t=> list.appendChild(rowFor(p.id,t)));
  $("#completedCount").textContent = `(${completed.length})`;
  completed.forEach(t=> comp.appendChild(rowFor(p.id,t)));
  $("#completedWrap").open=false;
}
function rowFor(phaseId, t){
  const frag=document.createDocumentFragment();
  const row=document.createElement('div'); row.className='taskRow'; row.dataset.phaseId=phaseId; row.dataset.taskId=t.id;
  row.innerHTML=`<button class="check ${t.done?'done':''}" aria-label="toggle">${t.done?'✓':''}</button>
    <div><div class="title">${t.title}</div><div class="date">${t.due||'No date'}</div></div>
    <button class="expand" aria-label="expand">▾</button>`;
  const desc=document.createElement('div'); desc.className='desc'; desc.textContent=t.desc||'';
  frag.appendChild(row); frag.appendChild(desc);
  return frag;
}

/** ---- events ---- */
$("#btnHome").onclick=goHome;
$("#btnTimeline").onclick=goTimeline;
$("#back").onclick=goHome;
$("#btnReset").onclick=()=>{ localStorage.removeItem(STORAGE_KEY); state=seed(); save(); toast('Data reset'); goHome(); };

$("#phaseTitle").addEventListener('blur', e=>{
  const p=state.phases.find(x=>x.id===cur); if(!p) return;
  const v=(e.target.value||'').trim()||'Untitled'; p.title=v; save(); renderHome();
});

$("#phase").addEventListener('click', e=>{
  const row=e.target.closest('.taskRow'); if(!row) return;
  if(e.target.classList.contains('expand')){
    row.classList.toggle('expanded'); const d=row.nextElementSibling; if(d && d.classList.contains('desc')) d.style.display=row.classList.contains('expanded')?'block':'none'; return;
  }
  if(e.target.classList.contains('check')){
    const p=state.phases.find(x=>x.id===row.dataset.phaseId); const t=p.tasks.find(x=>x.id===row.dataset.taskId);
    t.done=!t.done; t.completedAt=t.done?Date.now():null; save(); renderPhase(p.id); renderHome(); return;
  }
});

$("#addTask").addEventListener('submit', e=>{
  e.preventDefault();
  const p=state.phases.find(x=>x.id===cur); if(!p) return;
  const title=($("#newTitle").value||'').trim(); if(!title) return;
  const due=$("#newDue").value||null; const desc=$("#newDesc").value||'';
  p.tasks.push({id:'t_'+Date.now(), title:title.slice(0,60), due, desc:desc.slice(0,180), done:false, createdAt:Date.now()});
  save(); $("#newTitle").value=''; $("#newDue").value=''; $("#newDesc").value=''; renderPhase(p.id); renderHome(); toast('Task added');
});

/** ---- timeline ---- */
function renderTimeline(){
  const host=$("#timelineList"); host.innerHTML='';
  const items=[];
  state.phases.forEach(p=> p.tasks.forEach(t=>{if(t.due) items.push({date:t.due, title:t.title, phase:p.title, phaseId:p.id, taskId:t.id})}));
  state.timeline.forEach(m=>items.push({date:m.date, title:m.title, phase:m.phase}));
  items.sort((a,b)=>a.date.localeCompare(b.date));
  items.forEach(it=>{
    const row=document.createElement('div'); row.className='card';
    row.innerHTML=`<div><strong>${it.date}</strong> — ${it.title}${it.phase? ' • '+it.phase:''}</div>`;
    if(it.phaseId){ row.style.cursor='pointer'; row.onclick=()=>{ goPhase(it.phaseId); setTimeout(()=>{
      const r=$(\`.taskRow[data-task-id="${it.taskId}"]\`); if(r){ r.classList.add('expanded'); const d=r.nextElementSibling; if(d) d.style.display='block'; }
    }, 50);}}
    host.appendChild(row);
  });
}

/** ---- boot ---- */
goHome();
