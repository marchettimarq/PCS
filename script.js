const phases = [
 {id:1, name:"Pre-Departure", tasks:["Initial briefing","Car plan","Cats medical"]},
 {id:2, name:"Mid Prep", tasks:["VIPER docs","Reserve lodging"]},
 {id:3, name:"Final Out", tasks:["CSS Outprocessing","Finance out"]},
 {id:4, name:"Arrival", tasks:["Report to unit","Register vehicles","Update DEERS"]}
];
const app=document.getElementById('app');
function renderHome(){
 app.innerHTML='<div class="puzzle">'+phases.map(p=>`<div class="puzzle-piece">${p.name}</div>`).join('')+'</div>';
}
renderHome();