/* CortexPi · visualizações conceituais (dados ilustrativos)
   CortexViz.campo(el, {mode:'hero'|'panel'})  — campo de sinais com o arco da marca
   CortexViz.gantt(el, {mode:'hero'|'panel'})  — cronogramas lidos no horizonte de 60 dias
   CortexViz.counters(root)                     — contadores de sinais lidos           */
(function(){
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad4=n=>String(n).padStart(4,'0');
const dias=d=>d===1?'1 dia':d+' dias';
let SEQ=148;

function setup(el,labels){labels=labels||['Afeta','Antecedência','Decisão'];
  const cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');el.appendChild(cv);
  const co=document.createElement('div');co.className='callout';co.setAttribute('aria-hidden','true');
  co.innerHTML='<span class="id"></span><b></b><dl><dt>'+labels[0]+'</dt><dd data-k="a"></dd><dt>'+labels[1]+'</dt><dd data-k="d"></dd><dt>'+labels[2]+'</dt><dd data-k="x"></dd></dl>';
  el.appendChild(co);
  const fill=(id,t,a,d,x)=>{co.querySelector('.id').textContent=id;co.querySelector('b').textContent=t;
    co.querySelector('[data-k=a]').textContent=a;co.querySelector('[data-k=d]').textContent=d;co.querySelector('[data-k=x]').textContent=x};
  const ctx=cv.getContext('2d');
  const st={W:0,H:0};
  const size=()=>{const DPR=Math.min(devicePixelRatio||1,2);st.W=el.clientWidth;st.H=el.clientHeight;cv.width=st.W*DPR;cv.height=st.H*DPR;cv.style.width=st.W+'px';cv.style.height=st.H+'px';ctx.setTransform(DPR,0,0,DPR,0,0)};
  // só anima quando visível
  st.visible=true;new IntersectionObserver(es=>es.forEach(e=>st.visible=e.isIntersecting)).observe(el);
  return {cv,ctx,co,fill,st,size};
}

/* ------------------------------------------------------------- campo de sinais */
function campo(el,opt={}){
  const mode=opt.mode||'hero',{ctx,co,fill,st,size}=setup(el);
  const SINAIS=[
    ['Documento de engenharia pendente','Início da fabricação · Projeto Charlie','21 dias','Repriorizar engenharia'],
    ['Medição abaixo do previsto','Faturamento · Projeto Alfa','34 dias','Rever sequenciamento'],
    ['Prazo contratual sob pressão','Marco de entrega · Projeto Lima','18 dias','Avaliar recuperação e pleito'],
    ['Conflito de recursos no portfólio','Projetos Uniform e Sierra','27 dias','Priorizar na carteira'],
    ['Linha de base desatualizada','Planejamento · Projeto Sierra','40 dias','Revisar cronograma']];
  let pts=[],arc={},mouse={x:-999,y:-999},active=null,lastPick=-9e9,si=0;
  function lay(){size();const {W,H}=st,wide=W>960;
    if(mode==='hero'){arc={x:W*(wide?.72:.62),y:H*(wide?.44:.3),r:Math.min(W,H)*(wide?.36:.3)};if(wide)arc.r=Math.max(160,Math.min(arc.r,arc.x-700,H*.4))}
    else arc={x:W*.5,y:H*.5,r:Math.min(W,H)*.4};
    pts=[];const step=wide?26:30;
    for(let y=step/2;y<H;y+=step)for(let x=step/2;x<W;x+=step)pts.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,b:Math.random()*.25+.08,p:Math.random()*6.28})}
  lay();addEventListener('resize',lay);
  el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();mouse.x=e.clientX-b.left;mouse.y=e.clientY-b.top});
  el.addEventListener('pointerleave',()=>{mouse.x=mouse.y=-999});
  function pick(now){const {W}=st;
    const c=pts.filter(p=>{const d=Math.hypot(p.x-arc.x,p.y-arc.y);return d<arc.r*.85&&d>arc.r*.25});
    active=c[Math.floor(Math.random()*c.length)];active.t=now;
    const s=SINAIS[si++%SINAIS.length];SEQ+=Math.floor(Math.random()*40)+7;fill('SINAL '+pad4(SEQ),...s);
    co.style.left=(active.x+30+280<W?active.x+30:Math.max(8,active.x-310))+'px';co.style.top=Math.max(mode==='hero'?90:12,active.y-40)+'px';
    setTimeout(()=>co.classList.add('on'),500);setTimeout(()=>co.classList.remove('on'),4300)}
  function draw(now){requestAnimationFrame(draw);if(!st.visible)return;const {W,H}=st;
    ctx.clearRect(0,0,W,H);const ang=REDUCE?-.9:(now/5200)%(Math.PI*2)-Math.PI;
    for(const p of pts){let a=p.b+Math.sin(now/900+p.p)*.05;const dm=Math.hypot(p.x-mouse.x,p.y-mouse.y);if(dm<140)a+=(1-dm/140)*.55;
      const dx=p.x-arc.x,dy=p.y-arc.y;if(Math.hypot(dx,dy)<arc.r){const diff=Math.atan2(Math.sin(ang-Math.atan2(dy,dx)),Math.cos(ang-Math.atan2(dy,dx)));if(diff>0&&diff<.5)a+=(1-diff/.5)*.6}
      ctx.fillStyle=`rgba(199,205,211,${Math.min(a,.95)})`;ctx.fillRect(p.x-1,p.y-1,2,2)}
    if(ctx.createConicGradient){const g=ctx.createConicGradient(ang-.5,arc.x,arc.y);g.addColorStop(0,'rgba(199,205,211,0)');g.addColorStop(.08,'rgba(199,205,211,.07)');g.addColorStop(.0801,'rgba(199,205,211,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(arc.x,arc.y,arc.r,0,Math.PI*2);ctx.fill()}
    ctx.strokeStyle='rgba(199,205,211,.45)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(arc.x,arc.y);ctx.lineTo(arc.x+Math.cos(ang)*arc.r,arc.y+Math.sin(ang)*arc.r);ctx.stroke();
    const R=arc.r,rad=d=>-d*Math.PI/180;
    ctx.strokeStyle='rgba(244,241,236,.85)';ctx.lineWidth=Math.max(6,R*.07);ctx.beginPath();ctx.arc(arc.x,arc.y,R,rad(64),rad(298),true);ctx.stroke();
    ctx.lineWidth=Math.max(2,R*.028);ctx.beginPath();ctx.arc(arc.x,arc.y,R,rad(40),rad(-40),false);ctx.stroke();
    ctx.strokeStyle='rgba(199,205,211,.12)';ctx.lineWidth=1;[.66,.33].forEach(k=>{ctx.beginPath();ctx.arc(arc.x,arc.y,R*k,0,Math.PI*2);ctx.stroke()});
    ctx.fillStyle='#B26E3B';ctx.beginPath();ctx.arc(arc.x+Math.cos(rad(52))*R*.94,arc.y+Math.sin(rad(52))*R*.94,Math.max(4,R*.045),0,Math.PI*2);ctx.fill();
    const q=Math.max(10,R*.14);ctx.strokeStyle='#B26E3B';ctx.lineWidth=1.5;ctx.strokeRect(arc.x-q/2,arc.y-q/2,q,q);
    if(!REDUCE&&now-lastPick>5200){lastPick=now;pick(now)}
    if(active){const t=(now-active.t)/1000;if(t<4.6){ctx.fillStyle='#B26E3B';ctx.beginPath();ctx.arc(active.x,active.y,4,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=`rgba(178,110,59,${Math.max(0,.8-t*.15)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(active.x,active.y,6+t*8,0,Math.PI*2);ctx.stroke();
      if(t>.4){ctx.strokeStyle='rgba(178,110,59,.55)';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(active.x,active.y);ctx.lineTo(arc.x,arc.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='rgba(178,110,59,.25)';ctx.fillRect(arc.x-q/2,arc.y-q/2,q,q)}}}}
  requestAnimationFrame(draw);
}

/* ------------------------------------------------------------- Gantt L·U·C·A·S */
function gantt(el,opt={}){
  const mode=opt.mode||'hero',{ctx,co,fill,st,size}=setup(el);
  const NOMES=['Lima','Uniform','Charlie','Alfa','Sierra']; 
  const RISCOS=[
    ['Documento de engenharia pendente','Início da fabricação','Repriorizar engenharia'],
    ['Fornecedor crítico em atraso','Comissionamento','Ativar suprimento alternativo'],
    ['Medição abaixo do previsto','Faturamento do mês','Rever sequenciamento'],
    ['Conflito de recursos no portfólio','Montagem em campo','Priorizar na carteira'],
    ['Prazo contratual sob pressão','Marco de entrega','Avaliar recuperação e pleito']];
  const DIAS=60,L=NOMES.length;let G={},lanes=[],scan=0,last=0,ri=0,found=null;
  const mk=(x,w)=>({x,w,ev:Math.random()*.7+.15,risk:Math.random()<.32,hit:0});
  function lay(reset){size();const {W,H}=st,wide=W>960;G.wide=wide;
    if(mode==='hero'){G.xs=wide?W*(opt.xs||.42):W*.24;G.today=wide?W*(opt.today||.53):W*.4;G.x1=W-(wide?40:12);G.y0=wide?H*.19:H*.15;G.y1=wide?Math.min(H*.54,H-470):H*.38}
    else{G.xs=wide?190:86;G.today=G.xs+(W-G.xs)*.2;G.x1=W-24;G.y0=64;G.y1=H-56}
    G.lh=(G.y1-G.y0)/L;G.ppd=(G.x1-G.today)/DIAS;
    if(reset||!lanes.length){lanes=[];for(let i=0;i<L;i++){const b=[];let x=G.xs-200;while(x<W+400){const w=(Math.random()*14+6)*G.ppd;b.push(mk(x,w));x+=w+(Math.random()*5+2)*G.ppd}lanes.push(b)}}}
  lay(true);addEventListener('resize',()=>lay(true));
  function detect(b,lane,ex,now){b.hit=now;found={b,t:now};const d=Math.round((ex-G.today)/G.ppd),r=RISCOS[ri++%RISCOS.length];
    SEQ+=Math.floor(Math.random()*30)+5;fill('SINAL '+pad4(SEQ)+' · PROJETO '+NOMES[lane].toUpperCase(),r[0],r[1],dias(d),r[2]);
    const yc=G.y0+G.lh*lane+G.lh/2,{W}=st;
    co.style.left=Math.max(8,Math.min(ex-140,W-300))+'px';
    co.style.top=(lane<L/2?yc+G.lh*.45:yc-G.lh*.45-120)+'px';
    co.classList.add('on');clearTimeout(co._t);co._t=setTimeout(()=>co.classList.remove('on'),3800)}
  function label(i,y){const {xs,wide}=G;ctx.textAlign='right';ctx.font='600 11px Inter, sans-serif';
    ctx.fillStyle='rgba(199,205,211,.55)';ctx.fillText((wide?'PROJETO ':'')+NOMES[i].toUpperCase(),xs-14,y);ctx.textAlign='left'}
  function draw(now){requestAnimationFrame(draw);if(!st.visible){last=now;return}
    const dt=Math.min(50,now-(last||now));last=now;const {W,H}=st,{xs,today,x1,y0,y1,lh,ppd,wide}=G;
    ctx.clearRect(0,0,W,H);const v=REDUCE?0:ppd*.55/1000;
    ctx.font='600 10px Inter, sans-serif';ctx.textAlign='center';
    for(let d=-20;d<=DIAS;d+=(wide?10:20)){const x=today+d*ppd;if(x<xs)continue;ctx.strokeStyle='rgba(199,205,211,.07)';ctx.beginPath();ctx.moveTo(x,y0-10);ctx.lineTo(x,y1+6);ctx.stroke();
      ctx.fillStyle='rgba(199,205,211,.38)';if(d)ctx.fillText((d>0?'+':'')+d+' d',x,y1+22)}
    for(let i=0;i<L;i++)label(i,y0+lh*i+lh/2+4);
    if(!REDUCE){scan+=dt/10000;if(scan>1)scan=0}
    const sx=today+(x1-today)*(REDUCE?1:scan);
    const g=ctx.createLinearGradient(sx-120,0,sx,0);g.addColorStop(0,'rgba(199,205,211,0)');g.addColorStop(1,'rgba(199,205,211,.08)');
    ctx.fillStyle=g;ctx.fillRect(Math.max(today,sx-120),y0-10,Math.min(120,sx-today),y1-y0+16);
    ctx.strokeStyle='rgba(199,205,211,.4)';ctx.beginPath();ctx.moveTo(sx,y0-10);ctx.lineTo(sx,y1+6);ctx.stroke();
    lanes.forEach((bars,i)=>{const yc=y0+lh*i+lh/2,bh=Math.max(6,Math.min(20,lh*.26));
      bars.forEach(b=>b.x-=v*dt);
      if(bars[0].x+bars[0].w<xs-220){bars.shift();const lb=bars[bars.length-1];bars.push(mk(lb.x+lb.w+(Math.random()*5+2)*ppd,(Math.random()*14+6)*ppd))}
      ctx.save();ctx.beginPath();ctx.rect(xs,0,x1-xs+40,H);ctx.clip();
      bars.forEach(b=>{const past=b.x+b.w<today;ctx.fillStyle=past?'rgba(199,205,211,.10)':'rgba(199,205,211,.2)';ctx.fillRect(b.x,yc-bh/2,b.w,bh);
        const ex=b.x+b.w*b.ev;
        if(b.risk&&ex>today&&!b.hit){if((!REDUCE&&Math.abs(ex-sx)<3&&(!found||now-found.t>3000))||(REDUCE&&!found&&ex<today+40*ppd))detect(b,i,ex,now)}
        if(b.hit&&ex>xs){const lit=ex>today+ppd&&found&&found.b===b&&(REDUCE||now-b.hit<3800);
          ctx.fillStyle=lit?'#B26E3B':'rgba(178,110,59,.35)';ctx.fillRect(b.x,yc-bh/2,Math.max(0,ex-b.x),bh);
          ctx.fillStyle=lit?'#B26E3B':'rgba(178,110,59,.7)';ctx.beginPath();ctx.arc(ex,yc,lit?5:3,0,6.283);ctx.fill();
          if(lit){ctx.strokeStyle='rgba(244,241,236,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ex,yc,13,-.9,-.9+5.48*Math.min(1,REDUCE?1:(now-b.hit)/600));ctx.stroke();ctx.lineWidth=1;
            const d=Math.round((ex-today)/ppd),ya=yc-lh*.36;ctx.strokeStyle='rgba(178,110,59,.8)';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(today,ya);ctx.lineTo(ex,ya);ctx.stroke();ctx.setLineDash([]);
            ctx.beginPath();ctx.moveTo(ex,ya-4);ctx.lineTo(ex,ya+4);ctx.stroke();
            ctx.fillStyle='#F4F1EC';ctx.font='600 11px Inter, sans-serif';ctx.textAlign='center';ctx.fillText(dias(d),(today+ex)/2,ya-5);ctx.textAlign='left'}}
        else if(!b.risk){ctx.fillStyle='rgba(199,205,211,.35)';ctx.fillRect(ex-1.5,yc-1.5,3,3)}});
      ctx.restore()});
    ctx.strokeStyle='#F4F1EC';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(today,y0-24);ctx.lineTo(today,y1+8);ctx.stroke();ctx.lineWidth=1;
    ctx.fillStyle='#F4F1EC';ctx.font='600 10.5px Inter, sans-serif';ctx.textAlign='center';ctx.fillText('HOJE',today,y0-30);
    ctx.fillStyle='rgba(199,205,211,.45)';if(wide)ctx.fillText('PASSADO',(xs+today)/2,y0-30);
    ctx.fillText(wide?'HORIZONTE DE LEITURA · 60 DIAS':'PRÓXIMOS 60 DIAS',(today+x1)/2+(wide?0:10),y0-30);ctx.textAlign='left'}
  requestAnimationFrame(draw);
}

/* ------------------------------------------------------------- símbolo como mira + disciplinas */
const DISC=[ // ângulo central do quadrante (graus matemáticos)
  {id:'port',nome:'Gestão de Portfólio',q:'Estamos investindo nos projetos certos?',a:135,comp:['Seleção e priorização','Capacidade e recursos','Gestão financeira','Gestão de riscos','Governança']},
  {id:'proj',nome:'Gestão de Projetos',q:'Estamos executando cada projeto corretamente?',a:45,comp:['Custos','Integração','Qualidade','Stakeholders','Escopo e mudanças']},
  {id:'cont',nome:'Gestão de Contratos',q:'Estamos cumprindo e protegendo o que foi contratado?',a:225,comp:['Pleitos e contrapleitos','Subcontratos','Gestão econômico-financeira','Obrigações e deveres','Notificações']},
  {id:'plan',nome:'Planejamento',q:'O que precisa acontecer, quando e com quais recursos?',a:315,comp:['Planejamento integrado','Recursos e capacidade','Previsões','Caminho crítico','Curto e médio prazo']}];
function simbolo(el,opt={}){
  const {ctx,co,fill,st,size}=setup(el,['Lidera','Apoiam','Decisão']);
  const SIG=[
    ['port','Dois projetos precisam da mesma equipe de montagem','Projetos · Planejamento · Contratos','Priorizar na carteira'],
    ['proj','Equipamento atrasado na fabricação','Planejamento · Contratos','Recuperar sequência de montagem'],
    ['cont','Cliente solicita serviço fora do escopo','Projetos · Planejamento','Formalizar mudança contratual'],
    ['plan','Cronograma aponta atraso de 30 dias na conclusão','Projetos · Contratos · Portfólio','Avaliar cenário de recuperação'],
    ['proj','Margem prevista em deterioração','Contratos · Planejamento · Portfólio','Rever custos e recuperações']];
  const labels={};DISC.forEach(d=>labels[d.id]=el.querySelector('[data-d='+d.id+']'));
  let pts=[],C={},mouse={x:-999,y:-999},sig=null,si=0,hl=null,hlT=0,lastAng=0;
  function lay(){size();const {W,H}=st,wide=W>760;C={x:W/2,y:H/2,R:Math.min(W,H)*(wide?.27:.36),wide};C.k=C.R/95;
    pts=[];const step=26;for(let y=step/2;y<H;y+=step)for(let x=step/2;x<W;x+=step)pts.push({x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*10,b:Math.random()*.2+.06,p:Math.random()*6.28})}
  lay();addEventListener('resize',lay);
  el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect();mouse.x=e.clientX-b.left;mouse.y=e.clientY-b.top});
  el.addEventListener('pointerleave',()=>{mouse.x=mouse.y=-999});
  const rad=d=>-d*Math.PI/180,P=(r,d)=>[C.x+Math.cos(rad(d))*r,C.y+Math.sin(rad(d))*r];
  function newSig(){const s=SIG[si++%SIG.length],d=DISC.find(x=>x.id===s[0]);const ang=d.a+(Math.random()-.5)*60,r=C.R*(.38+Math.random()*.42);
    const [x,y]=P(r,ang);sig={s,d,x,y,ang:((ang%360)+360)%360,hit:0}}
  newSig();
  function hit(now){sig.hit=now;hl=sig.d.id;hlT=now;SEQ+=Math.floor(Math.random()*30)+5;
    fill('SINAL '+pad4(SEQ),sig.s[1],sig.d.nome,sig.s[2],sig.s[3]);
    const {W}=st;co.style.left=(sig.x+24+290<W?sig.x+24:Math.max(8,sig.x-314))+'px';co.style.top=Math.max(8,sig.y-30)+'px';
    co.classList.add('on');clearTimeout(co._t);co._t=setTimeout(()=>co.classList.remove('on'),3600);
    Object.entries(labels).forEach(([k,l])=>l&&l.classList.toggle('on',k===hl))}
  function draw(now){requestAnimationFrame(draw);if(!st.visible)return;const {W,H}=st,{R,k}=C;
    ctx.clearRect(0,0,W,H);
    for(const p of pts){let a=p.b+Math.sin(now/900+p.p)*.04;const dm=Math.hypot(p.x-mouse.x,p.y-mouse.y);if(dm<140)a+=(1-dm/140)*.5;ctx.fillStyle=`rgba(199,205,211,${a})`;ctx.fillRect(p.x-1,p.y-1,2,2)}
    // varredura a partir do núcleo de decisão
    const ang=REDUCE?52:((now/6000)*360)%360; // graus matemáticos, anti-horário
    if(ctx.createConicGradient){const g=ctx.createConicGradient(rad(ang),C.x,C.y);g.addColorStop(0,'rgba(199,205,211,.10)');g.addColorStop(.07,'rgba(199,205,211,0)');g.addColorStop(1,'rgba(199,205,211,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(C.x,C.y,R*.86,0,Math.PI*2);ctx.fill()}
    const [bx,by]=P(R*.86,ang);ctx.strokeStyle='rgba(244,241,236,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(C.x,C.y);ctx.lineTo(bx,by);ctx.stroke();
    // anel de competências
    if(C.wide){ctx.strokeStyle='rgba(199,205,211,.14)';ctx.setLineDash([2,5]);ctx.beginPath();ctx.arc(C.x,C.y,R*1.16,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      ctx.font='600 11px Inter, sans-serif';
      DISC.forEach(d=>{const on=hl===d.id&&now-hlT<4000;d.comp.forEach((c,i)=>{const a=d.a+(i-(d.comp.length-1)/2)*17;const [tx,ty]=P(R*1.16,a),[lx,ly]=P(R*1.24,a);
        ctx.fillStyle=on?'#B26E3B':'rgba(199,205,211,.5)';ctx.fillRect(tx-2.5,ty-2.5,5,5);
        const right=Math.cos(rad(a))>0;ctx.textAlign=right?'left':'right';ctx.fillStyle=on?'#F4F1EC':'rgba(199,205,211,.62)';ctx.fillText(c,lx,ly+4)})});ctx.textAlign='left'}
    // símbolo CortexPi (geometria oficial v1.1-R1: arcos de 240° e 74°, aberturas de 22° e 24°)
    ctx.strokeStyle='#F4F1EC';ctx.lineWidth=13.8*k;ctx.beginPath();ctx.arc(C.x,C.y,87.1*k,rad(60),rad(300),true);ctx.stroke();
    ctx.lineWidth=7.6*k;ctx.beginPath();ctx.arc(C.x,C.y,90.2*k,rad(38),rad(-36),false);ctx.stroke();
    ctx.strokeStyle='rgba(199,205,211,.82)';ctx.lineWidth=5.6*k;ctx.lineJoin='miter';ctx.beginPath();
    ctx.moveTo(C.x,C.y-31*k);ctx.lineTo(C.x,C.y-61*k);ctx.arc(C.x,C.y,61*k,-Math.PI/2,Math.PI/2,true);ctx.lineTo(C.x,C.y+18*k);ctx.stroke();
    const [dx,dy]=P(90.4*k,53.09);ctx.fillStyle='#B26E3B';ctx.beginPath();ctx.arc(dx,dy,8.2*k,0,Math.PI*2);ctx.fill();
    const q=28*k;ctx.fillRect(C.x-q/2,C.y-q/2,q,q);
    // sinal
    if(sig){const dA=((ang-sig.ang)+360)%360;
      if(!sig.hit&&!REDUCE&&dA<4&&((lastAng-sig.ang+360)%360)>300)hit(now);
      if(REDUCE&&!sig.hit)hit(now);
      const t=sig.hit?(now-sig.hit)/1000:0;
      ctx.fillStyle=sig.hit?'#B26E3B':'rgba(199,205,211,.75)';ctx.beginPath();ctx.arc(sig.x,sig.y,sig.hit?5:3.5,0,Math.PI*2);ctx.fill();
      if(sig.hit&&t<3.6){ctx.strokeStyle=`rgba(178,110,59,${Math.max(0,.9-t*.25)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(sig.x,sig.y,7+t*10,0,Math.PI*2);ctx.stroke();
        ctx.setLineDash([3,3]);ctx.strokeStyle='rgba(178,110,59,.6)';ctx.beginPath();ctx.moveTo(sig.x,sig.y);ctx.lineTo(C.x,C.y);ctx.stroke();ctx.setLineDash([]);
        ctx.strokeStyle='rgba(178,110,59,.9)';ctx.lineWidth=1.5;ctx.strokeRect(C.x-q/2-6,C.y-q/2-6,q+12,q+12);ctx.lineWidth=1}
      if(sig.hit&&t>4.2&&!REDUCE)newSig()}
    if(hl&&now-hlT>4000){Object.values(labels).forEach(l=>l&&l.classList.remove('on'));hl=null}
    lastAng=ang}
  requestAnimationFrame(draw);
}

/* ------------------------------------------------------------- mapa disciplinas × áreas */
const AREAS=['Acionistas','Comercial','Jurídico','Financeiro','Controladoria','Custos','Suprimentos','Engenharia','Planejamento','Fabricação','Execução','Qualidade','SSMA','Pós-vendas','RH','TI','Melhoria contínua'];
const REL={
  port:['Acionistas','Comercial','Financeiro','Controladoria','RH','Execução','TI'],
  proj:['Comercial','Engenharia','Suprimentos','Fabricação','Execução','Qualidade','SSMA','Pós-vendas','Custos','Planejamento','Melhoria contínua'],
  cont:['Jurídico','Comercial','Financeiro','Controladoria','Suprimentos','Pós-vendas','Execução','Qualidade'],
  plan:['Engenharia','Suprimentos','Fabricação','Execução','Planejamento','RH','Custos','TI','SSMA','Melhoria contínua']};
const RESP={port:'Selecionar, priorizar, equilibrar e acompanhar o conjunto de projetos conforme a estratégia e a capacidade da organização.',
  proj:'Integrar e conduzir as entregas, controlando escopo, prazo, custo, qualidade, riscos e recursos.',
  cont:'Administrar obrigações, direitos, mudanças, riscos comerciais, evidências e resultados econômico-contratuais.',
  plan:'Estruturar, integrar, programar, acompanhar e projetar a execução física e temporal dos projetos.'};
function mapa(el){
  const NS='http://www.w3.org/2000/svg',cx=500,cy=330,rx=420,ry=262;
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1000 660');svg.setAttribute('class','mapa-svg');svg.setAttribute('role','img');
  svg.setAttribute('aria-label','Relação entre as quatro disciplinas de gestão e as áreas da empresa');
  const gL=document.createElementNS(NS,'g'),gA=document.createElementNS(NS,'g'),gD=document.createElementNS(NS,'g');svg.append(gL,gA,gD);
  const dpos={port:[cx-118,cy-62],proj:[cx+118,cy-62],cont:[cx-118,cy+62],plan:[cx+118,cy+62]};
  const apos={};AREAS.forEach((a,i)=>{const t=-Math.PI/2+i*2*Math.PI/AREAS.length;apos[a]=[cx+rx*Math.cos(t),cy+ry*Math.sin(t),Math.cos(t)]});
  const lines=[];
  Object.entries(REL).forEach(([d,as])=>as.forEach(a=>{const [x1,y1]=dpos[d],[x2,y2,c]=apos[a];const p=document.createElementNS(NS,'path');
    p.setAttribute('d',`M${x1},${y1} Q${(x1+x2)/2+(cx-(x1+x2)/2)*.35},${(y1+y2)/2+(cy-(y1+y2)/2)*.35} ${x2},${y2}`);p.setAttribute('class','ln');gL.appendChild(p);lines.push({d,a,p})}));
  const aEls={};AREAS.forEach(a=>{const [x,y,c]=apos[a];const g=document.createElementNS(NS,'g');g.setAttribute('class','ar');g.setAttribute('tabindex','0');
    const r=document.createElementNS(NS,'rect');r.setAttribute('x',x-4);r.setAttribute('y',y-4);r.setAttribute('width',8);r.setAttribute('height',8);
    const t=document.createElementNS(NS,'text');t.setAttribute('x',x+(c>.15?14:c<-.15?-14:0));t.setAttribute('y',y+(Math.abs(c)<=.15?(y<cy?-14:24):5));
    t.setAttribute('text-anchor',c>.15?'start':c<-.15?'end':'middle');t.textContent=a;g.append(r,t);gA.appendChild(g);aEls[a]=g;
    const go=()=>{stop();showArea(a)};g.addEventListener('pointerenter',go);g.addEventListener('focus',go)});
  const dEls={};DISC.forEach(d=>{const [x,y]=dpos[d.id];const g=document.createElementNS(NS,'g');g.setAttribute('class','dc');g.setAttribute('tabindex','0');
    const r=document.createElementNS(NS,'rect');r.setAttribute('x',x-96);r.setAttribute('y',y-26);r.setAttribute('width',192);r.setAttribute('height',52);
    const t=document.createElementNS(NS,'text');t.setAttribute('x',x);t.setAttribute('y',y+5);t.setAttribute('text-anchor','middle');t.textContent={port:'Portfólio',proj:'Projetos',cont:'Contratos',plan:'Planejamento'}[d.id];
    g.append(r,t);gD.appendChild(g);dEls[d.id]=g;const go=()=>{stop();showDisc(d.id)};g.addEventListener('pointerenter',go);g.addEventListener('focus',go);g.addEventListener('click',go)});
  const core=document.createElementNS(NS,'rect');core.setAttribute('x',cx-9);core.setAttribute('y',cy-9);core.setAttribute('width',18);core.setAttribute('height',18);core.setAttribute('class','core');gD.appendChild(core);
  el.querySelector('.mapa-stage').appendChild(svg);
  const info=el.querySelector('.mapa-info');
  function reset(){lines.forEach(l=>l.p.classList.remove('on'));Object.values(aEls).forEach(e=>e.classList.remove('on','dim'));Object.values(dEls).forEach(e=>e.classList.remove('on','dim'))}
  function showDisc(id){reset();const d=DISC.find(x=>x.id===id);lines.forEach(l=>l.p.classList.toggle('on',l.d===id));
    AREAS.forEach(a=>aEls[a].classList.add(REL[id].includes(a)?'on':'dim'));Object.entries(dEls).forEach(([k,e])=>e.classList.add(k===id?'on':'dim'));
    info.innerHTML=`<span class="micro">Disciplina</span><h3>${d.nome}</h3><p class="q">${d.q}</p><p>${RESP[id]}</p><p class="n"><b>${REL[id].length}</b> áreas envolvidas: ${REL[id].join(' · ')}</p>`;
    tabs(id)}
  function showArea(a){reset();const ds=DISC.filter(d=>REL[d.id].includes(a));lines.forEach(l=>l.p.classList.toggle('on',l.a===a));
    AREAS.forEach(x=>aEls[x].classList.add(x===a?'on':'dim'));Object.entries(dEls).forEach(([k,e])=>e.classList.add(ds.some(d=>d.id===k)?'on':'dim'));
    info.innerHTML=`<span class="micro">Área da empresa</span><h3>${a}</h3><p>Conectada a <b>${ds.length}</b> disciplina${ds.length>1?'s':''}:</p><p class="n">${ds.map(d=>d.nome).join('<br>')}</p>`}
  // versão compacta (celular)
  const tb=el.querySelector('.mapa-tabs');
  if(tb){tb.innerHTML=DISC.map(d=>`<button type="button" data-t="${d.id}">${{port:'Portfólio',proj:'Projetos',cont:'Contratos',plan:'Planejamento'}[d.id]}</button>`).join('');
    tb.addEventListener('click',e=>{const b=e.target.closest('button');if(b){stop();showDisc(b.dataset.t)}})}
  function tabs(id){if(!tb)return;tb.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===id));
    const ch=el.querySelector('.mapa-chips');if(ch)ch.innerHTML=REL[id].map(a=>`<span>${a}</span>`).join('')}
  let auto=null,ai=0;const cycle=()=>showDisc(DISC[ai++%DISC.length].id);
  function stop(){if(auto){clearInterval(auto);auto=null}}
  cycle();if(!REDUCE)auto=setInterval(cycle,3600);
}

function counters(root){
  const nl=root.querySelector('[data-c=lidos]'),nr=root.querySelector('[data-c=rel]'),nd=root.querySelector('[data-c=dec]');if(!nl)return;
  let lidos=12408,rel=37;const tick=()=>{lidos+=Math.floor(Math.random()*9)+1;if(Math.random()<.05)rel++;nl.textContent=lidos.toLocaleString('pt-BR');nr.textContent=rel;nd.textContent=3};
  tick();setInterval(tick,REDUCE?4000:420)}

window.CortexViz={campo,gantt,simbolo,mapa,counters,data:{DISC,AREAS,REL,RESP}};
})();
