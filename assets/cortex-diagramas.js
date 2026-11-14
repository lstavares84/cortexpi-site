/* CortexPi · diagramas de integração (disciplinas × áreas) e base metodológica.
   Requer cortex-viz.js (usa CortexViz.data). */
(function(){
const NS='http://www.w3.org/2000/svg';
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const {AREAS,REL}=CortexViz.data;
const D=[{id:'port',n:'Portfólio'},{id:'proj',n:'Projetos'},{id:'cont',n:'Contratos'},{id:'plan',n:'Planejamento'}];
const Q={port:'Estamos investindo nos projetos certos?',proj:'Estamos executando cada projeto corretamente?',cont:'Estamos cumprindo e protegendo o que foi contratado?',plan:'O que precisa acontecer, quando e com quais recursos?'};
const GRUPOS=[
  ['Estratégia e governança',['Acionistas','Controladoria','Jurídico']],
  ['Comercial e cliente',['Comercial','Pós-vendas']],
  ['Operações',['Engenharia','Suprimentos','Planejamento','Fabricação','Execução','Qualidade','SSMA']],
  ['Suporte e controle',['Financeiro','Custos','RH','TI','Melhoria contínua']]];
const ORDEM=GRUPOS.flatMap(g=>g[1]);
const rel=(d,a)=>REL[d].includes(a);
const el=(t,a={},txt)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e};
const svgRoot=(w,h,label)=>el('svg',{viewBox:`0 0 ${w} ${h}`,class:'dg',role:'img','aria-label':label});
function hover(nodes,onIn,onOut){nodes.forEach(([n,key])=>{n.setAttribute('tabindex','0');n.style.cursor='pointer';
  n.addEventListener('pointerenter',()=>onIn(key));n.addEventListener('focus',()=>onIn(key));
  n.addEventListener('pointerleave',onOut);n.addEventListener('blur',onOut)})}

/* ====================================================== INTEGRAÇÃO */

/* A · Grafo de forças (arrastável) */
function grafo(box){
  const W=1000,H=640,svg=svgRoot(W,H,'Grafo: disciplinas e áreas da empresa');box.appendChild(svg);
  const gE=el('g'),gN=el('g');svg.append(gE,gN);
  const nodes=[],idx={};
  const FIX={port:[140,70],proj:[W-140,70],cont:[140,H-60],plan:[W-140,H-60]};
  D.forEach(d=>{const [x,y]=FIX[d.id];const n={id:d.id,label:d.n,disc:true,fixed:true,x,y,vx:0,vy:0};idx[d.id]=n;nodes.push(n)});
  AREAS.forEach((a,i)=>{const ds=D.filter(d=>REL[d.id].includes(a));let x=0,y=0;ds.forEach(d=>{x+=FIX[d.id][0];y+=FIX[d.id][1]});x/=ds.length;y/=ds.length;x=x*.5+W/2*.5+(Math.random()-.5)*80;y=y*.5+H/2*.5+(Math.random()-.5)*80;const n={id:a,label:a,disc:false,x,y,vx:0,vy:0};idx[a]=n;nodes.push(n)});
  const edges=[];D.forEach(d=>REL[d.id].forEach(a=>edges.push({s:idx[d.id],t:idx[a]})));
  edges.forEach(e=>{e.el=el('line',{class:'e'});gE.appendChild(e.el)});
  nodes.forEach(n=>{const g=el('g',{class:n.disc?'nd disc':'nd'});
    if(n.disc){g.append(el('rect',{x:-58,y:-20,width:116,height:40}),el('text',{y:5,'text-anchor':'middle'},n.label))}
    else{const deg=edges.filter(e=>e.t===n).length;n.r=4+deg*1.6;g.append(el('circle',{r:n.r}),el('text',{y:-n.r-7,'text-anchor':'middle'},n.label))}
    n.el=g;gN.appendChild(g)});
  let alpha=1,drag=null;
  function tick(){
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];let dx=b.x-a.x,dy=(b.y-a.y)*1.6,d=Math.hypot(dx,dy)||.1;
      const min=(a.disc||b.disc)?120:86;if(d<min*1.8){const f=(min*1.8-d)/d*.06*Math.max(alpha,.2);dx*=f;dy*=f/1.6;if(!a.fixed){a.vx-=dx;a.vy-=dy}if(!b.fixed){b.vx+=dx;b.vy+=dy}}}
    edges.forEach(e=>{let dx=e.s.x-e.t.x,dy=e.s.y-e.t.y,d=Math.hypot(dx,dy)||1;const f=(d-150)*.01*alpha;e.t.vx+=dx/d*f;e.t.vy+=dy/d*f});
    nodes.forEach(n=>{if(n.fixed||n===drag)return;n.vx*=.8;n.vy*=.8;n.x+=n.vx;n.y+=n.vy;
      n.x=Math.max(90,Math.min(W-90,n.x));n.y=Math.max(130,Math.min(H-120,n.y))});
    alpha=Math.max(.02,alpha*.99)}
  function render(){edges.forEach(e=>{e.el.setAttribute('x1',e.s.x);e.el.setAttribute('y1',e.s.y);e.el.setAttribute('x2',e.t.x);e.el.setAttribute('y2',e.t.y)});
    nodes.forEach(n=>n.el.setAttribute('transform',`translate(${n.x},${n.y})`))}
  for(let i=0;i<260;i++)tick();if(REDUCE){render()}else{(function loop(){if(alpha>.021||drag)tick();render();requestAnimationFrame(loop)})()}
  const pt=e=>{const r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
  nodes.forEach(n=>n.el.addEventListener('pointerdown',e=>{if(n.fixed)return;drag=n;alpha=Math.max(alpha,.3);n.el.setPointerCapture(e.pointerId)}));
  svg.addEventListener('pointermove',e=>{if(!drag)return;[drag.x,drag.y]=pt(e)});
  svg.addEventListener('pointerup',()=>{drag=null});
  const on=k=>{const n=idx[k];const nb=new Set([k]);edges.forEach(e=>{const hit=e.s===n||e.t===n;e.el.classList.toggle('on',hit);if(hit){nb.add(e.s.id);nb.add(e.t.id)}});
    nodes.forEach(m=>{m.el.classList.toggle('dim',!nb.has(m.id));m.el.classList.toggle('on',m.id===k)})};
  const off=()=>{edges.forEach(e=>e.el.classList.remove('on'));nodes.forEach(m=>m.el.classList.remove('dim','on'))};
  hover(nodes.map(n=>[n.el,n.id]),on,off);
}

/* B · Matriz agrupada */
function matriz(box){
  const t=document.createElement('table');t.className='mx';
  let h='<thead><tr><th>Área da empresa</th>'+D.map(d=>`<th data-c="${d.id}">${d.n}</th>`).join('')+'<th class="tot">Disciplinas</th></tr></thead><tbody>';
  GRUPOS.forEach(([g,as])=>{h+=`<tr class="grp"><td colspan="6">${g}</td></tr>`;
    as.forEach(a=>{const n=D.filter(d=>rel(d.id,a)).length;h+=`<tr><td>${a}</td>`+D.map(d=>`<td data-c="${d.id}">${rel(d.id,a)?'<i></i>':''}</td>`).join('')+`<td class="tot"><span style="--n:${n}"></span>${n}</td></tr>`})});
  h+='</tbody><tfoot><tr><td>Áreas envolvidas</td>'+D.map(d=>`<td data-c="${d.id}">${REL[d.id].length}</td>`).join('')+'<td></td></tr></tfoot>';
  t.innerHTML=h;box.appendChild(t);
  t.addEventListener('pointerover',e=>{const c=e.target.closest('[data-c]');t.querySelectorAll('.hc').forEach(x=>x.classList.remove('hc'));if(c)t.querySelectorAll(`[data-c="${c.dataset.c}"]`).forEach(x=>x.classList.add('hc'))});
  t.addEventListener('pointerleave',()=>t.querySelectorAll('.hc').forEach(x=>x.classList.remove('hc')));
}

/* C · Aluvial (áreas ↔ disciplinas) */
function aluvial(box){
  const W=1000,H=700,svg=svgRoot(W,H,'Diagrama aluvial: áreas ligadas às disciplinas');box.appendChild(svg);
  const gL=el('g'),gA=el('g'),gD=el('g');svg.append(gL,gA,gD);
  const ax=250,dx=760,ay=i=>40+i*(H-80)/(ORDEM.length-1);
  const tot=D.reduce((s,d)=>s+REL[d.id].length,0),gap=18,avail=H-60-gap*3;let y=30;const dpos={};
  D.forEach(d=>{const h=REL[d.id].length/tot*avail;dpos[d.id]={y,h,used:0};y+=h+gap});
  const links=[];
  ORDEM.forEach((a,i)=>{D.forEach(d=>{if(!rel(d.id,a))return;const p=dpos[d.id],step=p.h/REL[d.id].length,ty=p.y+p.used+step/2;p.used+=step;
    const path=el('path',{class:'lk',d:`M${ax+8},${ay(i)} C${(ax+dx)/2},${ay(i)} ${(ax+dx)/2},${ty} ${dx},${ty}`,'stroke-width':Math.max(3,step-2)});gL.appendChild(path);links.push({a,d:d.id,path})})});
  const aN={},dN={};
  ORDEM.forEach((a,i)=>{const g=el('g',{class:'an'});g.append(el('rect',{x:ax,y:ay(i)-6,width:8,height:12}),el('text',{x:ax-12,y:ay(i)+5,'text-anchor':'end'},a));gA.appendChild(g);aN[a]=g});
  D.forEach(d=>{const p=dpos[d.id],g=el('g',{class:'dn'});g.append(el('rect',{x:dx,y:p.y,width:14,height:p.h}),el('text',{x:dx+28,y:p.y+p.h/2-4},d.n),el('text',{x:dx+28,y:p.y+p.h/2+16,class:'sub'},REL[d.id].length+' áreas'));gD.appendChild(g);dN[d.id]=g});
  const on=k=>{links.forEach(l=>l.path.classList.toggle('on',l.a===k||l.d===k));
    Object.entries(aN).forEach(([a,g])=>g.classList.toggle('dim',!(a===k||(dN[k]&&rel(k,a)))));
    Object.entries(dN).forEach(([d,g])=>g.classList.toggle('dim',!(d===k||(aN[k]&&rel(d,k)))))};
  const off=()=>{links.forEach(l=>l.path.classList.remove('on'));[...Object.values(aN),...Object.values(dN)].forEach(g=>g.classList.remove('dim'))};
  hover([...Object.entries(aN).map(([k,g])=>[g,k]),...Object.entries(dN).map(([k,g])=>[g,k])],on,off);
}

/* D · Quatro radiais (small multiples) */
function radiais(box){
  const wrap=document.createElement('div');wrap.className='sm4';box.appendChild(wrap);
  D.forEach(d=>{const c=document.createElement('div');c.className='smc';const S=360,svg=svgRoot(S,S,d.n+': áreas envolvidas');
    const as=REL[d.id],cx=S/2,cy=S/2,r=118;
    as.forEach((a,i)=>{const t=-Math.PI/2+i/as.length*Math.PI*2,x=cx+Math.cos(t)*r,y=cy+Math.sin(t)*r,c2=Math.cos(t);
      svg.append(el('line',{x1:cx,y1:cy,x2:x,y2:y,class:'sp'}),el('rect',{x:x-3.5,y:y-3.5,width:7,height:7,class:'tip'}),
        el('text',{x:x+(c2>.2?10:c2<-.2?-10:0),y:y+(Math.abs(c2)<=.2?(y<cy?-10:18):4),'text-anchor':c2>.2?'start':c2<-.2?'end':'middle',class:'al'},a))});
    svg.append(el('circle',{cx,cy,r,class:'orb'}),el('rect',{x:cx-14,y:cy-14,width:28,height:28,class:'core'}));
    c.innerHTML=`<div class="smh"><span class="micro">${as.length} áreas</span><h3>${d.n}</h3><p>${Q[d.id]}</p></div>`;c.appendChild(svg);wrap.appendChild(c)});
}

/* E · Camadas da empresa */
function camadas(box){
  const w=document.createElement('div');w.className='cam';
  w.innerHTML='<div class="cam-bt">'+D.map(d=>`<button type="button" data-d="${d.id}">${d.n}<em>${REL[d.id].length}</em></button>`).join('')+'</div>'+
    GRUPOS.map(([g,as])=>`<div class="cam-row"><span class="micro">${g}</span><div class="cam-tiles">`+as.map(a=>`<div class="tile" data-a="${a}"><b>${a}</b><span class="pins">`+D.map(d=>`<i class="${rel(d.id,a)?'y':''}" title="${d.n}"></i>`).join('')+'</span></div>').join('')+'</div></div>').join('')+
    '<p class="cam-leg">Os quatro marcadores de cada área seguem a ordem: Portfólio · Projetos · Contratos · Planejamento.</p>';
  box.appendChild(w);
  const sel=id=>{w.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.d===id));
    w.querySelectorAll('.tile').forEach(t=>{t.classList.toggle('on',!!id&&rel(id,t.dataset.a));t.classList.toggle('dim',!!id&&!rel(id,t.dataset.a))})};
  let auto=null,i=0;const stop=()=>{clearInterval(auto);auto=null};
  w.querySelector('.cam-bt').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;stop();sel(b.classList.contains('on')?null:b.dataset.d)});
  sel(D[0].id);if(!REDUCE)auto=setInterval(()=>sel(D[++i%4].id),3200);
}

/* ====================================================== BASE METODOLÓGICA */
const ORGS=[
  ['PMI','Project Management Institute'],['AACE','AACE International'],['ISO','International Organization for Standardization'],
  ['WorldCC','World Commerce & Contracting'],['FIDIC','Fédération Internationale des Ingénieurs-Conseils'],['GAO','U.S. Government Accountability Office'],
  ['NCMA','National Contract Management Association'],['NASA','National Aeronautics and Space Administration'],['NDIA','National Defense Industrial Association']];
const ON=Object.fromEntries(ORGS);
const SHORT={AACE:'AACE International'};
const BASE={port:{p:['PMI'],c:['ISO','AACE']},proj:{p:['PMI','AACE'],c:['ISO']},cont:{p:['WorldCC','FIDIC','PMI'],c:['NCMA','AACE']},plan:{p:['AACE','PMI','GAO'],c:['NASA','NDIA']}};
const DL={port:'Gestão de Portfólio',proj:'Gestão de Projetos',cont:'Gestão de Contratos',plan:'Planejamento'};
const role=(d,o)=>BASE[d].p.includes(o)?'p':BASE[d].c.includes(o)?'c':'';
const nm=o=>SHORT[o]||o;

/* 1 · Matriz de referências */
function bmMatriz(box){
  const t=document.createElement('table');t.className='mx bm';
  t.innerHTML='<thead><tr><th>Disciplina</th>'+ORGS.map(([o])=>`<th data-c="${o}" title="${ON[o]}">${o}</th>`).join('')+'</tr></thead><tbody>'+
    D.map(d=>`<tr><td>${DL[d.id]}</td>`+ORGS.map(([o])=>{const r=role(d.id,o);return `<td data-c="${o}">${r?`<i class="${r}" title="${r==='p'?'Referência principal':'Referência complementar'}"></i>`:''}</td>`}).join('')+'</tr>').join('')+'</tbody>';
  box.appendChild(t);
  box.insertAdjacentHTML('beforeend','<p class="leg"><i class="p"></i>Referência principal <i class="c"></i>Referência complementar</p>');
  t.addEventListener('pointerover',e=>{const c=e.target.closest('[data-c]');t.querySelectorAll('.hc').forEach(x=>x.classList.remove('hc'));if(c)t.querySelectorAll(`[data-c="${c.dataset.c}"]`).forEach(x=>x.classList.add('hc'))});
  t.addEventListener('pointerleave',()=>t.querySelectorAll('.hc').forEach(x=>x.classList.remove('hc')));
}

/* 2 · Grafo bipartido organizações → disciplinas */
function bmGrafo(box){
  const W=1000,H=440,svg=svgRoot(W,H,'Organizações de referência ligadas às disciplinas');box.appendChild(svg);
  const gL=el('g'),gN=el('g');svg.append(gL,gN);
  const bw=ORGS.map(([o])=>Math.max(54,nm(o).length*8.4+22)),gapB=(W-40-bw.reduce((a,b)=>a+b,0))/(ORGS.length-1);const oxs=[];bw.reduce((x,w,i)=>{oxs[i]=x+w/2;return x+w+gapB},20);
  const ox=i=>oxs[i],dxp=i=>160+i*(W-320)/3,oy=70,dy=340;
  const lk=[];D.forEach((d,j)=>ORGS.forEach(([o],i)=>{const r=role(d.id,o);if(!r)return;
    const p=el('path',{class:'bl '+r,d:`M${ox(i)},${oy+18} C${ox(i)},${(oy+dy)/2} ${dxp(j)},${(oy+dy)/2} ${dxp(j)},${dy-24}`});gL.appendChild(p);lk.push({o,d:d.id,p})}));
  const nodes=[];
  ORGS.forEach(([o],i)=>{const g=el('g',{class:'bo'});const w=bw[i];g.append(el('rect',{x:ox(i)-w/2,y:oy-18,width:w,height:36}),el('text',{x:ox(i),y:oy+5,'text-anchor':'middle'},nm(o)));
    g.append(el('title',{},ON[o]));gN.appendChild(g);nodes.push([g,o])});
  D.forEach((d,j)=>{const g=el('g',{class:'bd'});g.append(el('rect',{x:dxp(j)-92,y:dy-24,width:184,height:48}),el('text',{x:dxp(j),y:dy+5,'text-anchor':'middle'},DL[d.id]));gN.appendChild(g);nodes.push([g,d.id])});
  svg.append(el('text',{x:20,y:24,class:'cap'},'ORGANIZAÇÕES'),el('text',{x:20,y:H-22,class:'cap'},'DISCIPLINAS'));
  const on=k=>{lk.forEach(l=>l.p.classList.toggle('on',l.o===k||l.d===k));nodes.forEach(([g,key])=>g.classList.toggle('dim',!(key===k||lk.some(l=>(l.o===k&&l.d===key)||(l.d===k&&l.o===key)))))};
  const off=()=>{lk.forEach(l=>l.p.classList.remove('on'));nodes.forEach(([g])=>g.classList.remove('dim'))};
  hover(nodes,on,off);
  box.insertAdjacentHTML('beforeend','<p class="leg"><b class="ln-p"></b>Referência principal <b class="ln-c"></b>Referência complementar</p>');
}

/* 3 · Cartões por disciplina */
function bmCartoes(box){
  const w=document.createElement('div');w.className='bmc';
  w.innerHTML=D.map(d=>`<div class="bracket"><h3>${DL[d.id]}</h3>
    <p class="lab">Referências principais</p><div class="chips">${BASE[d.id].p.map(o=>`<span class="cp" title="${ON[o]}">${nm(o)}</span>`).join('')}</div>
    <p class="lab">Complementares</p><div class="chips">${BASE[d.id].c.map(o=>`<span class="cc" title="${ON[o]}">${nm(o)}</span>`).join('')}</div></div>`).join('');
  box.appendChild(w);
}

/* 4 · Alvos (principal no anel interno, complementar no externo) */
function bmAlvos(box){
  const w=document.createElement('div');w.className='sm4';box.appendChild(w);
  D.forEach(d=>{const c=document.createElement('div');c.className='smc';const S=320,cx=S/2,cy=S/2+6,svg=svgRoot(S,S,DL[d.id]+': referências');
    svg.append(el('circle',{cx,cy,r:70,class:'ring1'}),el('circle',{cx,cy,r:130,class:'ring2'}));
    const place=(arr,r,cls,off)=>arr.forEach((o,i)=>{const t=-Math.PI/2+off+i/arr.length*Math.PI*2,x=cx+Math.cos(t)*r,y=cy+Math.sin(t)*r;const wd=nm(o).length*7.2+18;
      svg.append(el('rect',{x:x-wd/2,y:y-13,width:wd,height:26,class:cls}),el('text',{x,y:y+4,'text-anchor':'middle',class:cls+'t'},nm(o)))});
    place(BASE[d.id].p,70,'tp',0);place(BASE[d.id].c,130,'tc',Math.PI/4);
    svg.append(el('rect',{x:cx-9,y:cy-9,width:18,height:18,class:'core'}));
    c.innerHTML=`<div class="smh"><span class="micro">Anel interno: principais · externo: complementares</span><h3>${DL[d.id]}</h3></div>`;c.appendChild(svg);w.appendChild(c)});
}

/* 5 · Por organização (cobertura) */
function bmOrgs(box){
  const rows=ORGS.map(([o,full])=>{const rs=D.map(d=>role(d.id,o));const np=rs.filter(r=>r==='p').length,nc=rs.filter(r=>r==='c').length;return {o,full,rs,np,nc}}).sort((a,b)=>(b.np*2+b.nc)-(a.np*2+a.nc));
  const w=document.createElement('div');w.className='bmo';
  w.innerHTML='<div class="bmo-h"><span></span>'+D.map(d=>`<span>${d.n}</span>`).join('')+'<span>Presença</span></div>'+rows.map(r=>`<div class="bmo-r"><div><b>${nm(r.o)}</b><small>${r.full}</small></div>`+
    r.rs.map(x=>`<span class="cell ${x}">${x==='p'?'Principal':x==='c'?'Complementar':''}</span>`).join('')+
    `<div class="bar"><i style="width:${r.np*25}%"></i><i class="c" style="width:${r.nc*25}%"></i></div></div>`).join('');
  box.appendChild(w);
}

function lista(box){
  box.innerHTML=D.map(d=>`<div class="lm"><h3>${{port:'Gestão de Portfólio',proj:'Gestão de Projetos',cont:'Gestão de Contratos',plan:'Planejamento'}[d.id]}<em>${REL[d.id].length} áreas</em></h3><div class="chips">${REL[d.id].map(a=>`<span class="cc">${a}</span>`).join('')}</div></div>`).join('');
}
window.CortexDiagramas={lista,grafo,matriz,aluvial,radiais,camadas,bmMatriz,bmGrafo,bmCartoes,bmAlvos,bmOrgs};
})();
