import {useState} from 'react'; import {api} from '../helpFetch.js'
// ---- Reglas por deporte ----
const DEPORTES=['Fútbol','Microfútbol','Baloncesto','Voleibol','Tenis','Ajedrez']
const FORMATOS=['Todos contra todos','Eliminación directa','Fase de grupos','Sistema suizo']
const ri=n=>Math.floor(Math.random()*n)
const score=sp=>{
 if(sp==='Ajedrez')return [[1,0],[0,1],[.5,.5]][ri(3)]
 if(sp==='Voleibol'||sp==='Tenis'){const w=sp==='Tenis'?2:3,l=ri(w);return ri(2)?[w,l]:[l,w]}
 if(sp==='Baloncesto'){const x=60+ri(50),y=60+ri(50);return [x===y?x+1:x,y]}
 return [ri(5),ri(5)]}
const play=(a,b,sp,sim)=>{if(!sim)return {a,b};const [x,y]=score(sp);return {a,b,x,y}}
const win=m=>m.x>m.y?m.a:m.y>m.x?m.b:(ri(2)?m.a:m.b) // empate en eliminatoria: penales/desempate
// ---- Tabla de posiciones ----
const tabla=(ms,sp,ts)=>{const T={};ts.forEach(t=>T[t]={e:t,pj:0,gf:0,gc:0,pts:0})
 ms.forEach(m=>{if(m.bye){T[m.a].pts+=1;return} if(m.x===undefined)return
  for(const [t,g,c] of [[m.a,m.x,m.y],[m.b,m.y,m.x]]){const o=T[t];o.pj++;o.gf+=g;o.gc+=c
   o.pts+=sp==='Ajedrez'?g:g>c?(sp==='Fútbol'||sp==='Microfútbol'?3:1):g===c?1:0}})
 return Object.values(T).sort((u,v)=>v.pts-u.pts||(v.gf-v.gc)-(u.gf-u.gc)||v.gf-u.gf)}
// ---- Algoritmos ----
const rr=ts=>{let t=[...ts];if(t.length%2)t.push(null);const k=t.length,R=[]
 for(let r=0;r<k-1;r++){const p=[];for(let i=0;i<k/2;i++)if(t[i]&&t[k-1-i])p.push([t[i],t[k-1-i]]);R.push(p);t=[t[0],t[k-1],...t.slice(1,k-1)]}return R}
const knock=(ts,sp,sim)=>{const size=2**Math.ceil(Math.log2(Math.max(2,ts.length)))
 const s=[...ts,...Array(size-ts.length).fill(null)]
 let cur=s.slice(0,size/2).map((a,i)=>[a,s[size-1-i]]),out=[],r=1
 while(true){const ms=cur.map(([a,b])=>b===null?{a,b:'(libre)',bye:true}:play(a,b,sp,sim)),n=ms.length
  out.push({nombre:n===1?'Final':n===2?'Semifinal':n===4?'Cuartos de final':n===8?'Octavos de final':`Ronda ${r}`,ms})
  if(n===1)break
  const w=ms.map((m,i)=>m.bye?m.a:sim?win(m):`Ganador ${r}.${i+1}`);cur=[]
  for(let i=0;i<w.length;i+=2)cur.push([w[i],w[i+1]]);r++}
 return out}
const suizo=(ts,sp,sim)=>{const R=Math.max(1,Math.ceil(Math.log2(ts.length))),out=[],hist=new Set(),all=[]
 for(let r=1;r<=(sim?R:1);r++){const left=sim?tabla(all,sp,ts).map(o=>o.e):[...ts],ms=[]
  while(left.length){const a=left.shift();if(!left.length){ms.push({a,b:'(libre)',bye:true});break}
   let j=left.findIndex(b=>!hist.has(a+'|'+b));if(j<0)j=0
   const b=left.splice(j,1)[0];hist.add(a+'|'+b);hist.add(b+'|'+a);ms.push(play(a,b,sp,sim))}
  all.push(...ms);out.push({nombre:`Ronda ${r}`,ms})}
 return out}
export const build=(f,ts,sp,sim)=>{
 if(f==='Eliminación directa')return {rondas:knock(ts,sp,sim),tablas:[]}
 if(f==='Sistema suizo'){const rondas=suizo(ts,sp,sim),all=rondas.flatMap(r=>r.ms)
  return {rondas,tablas:sim?[{nombre:'Clasificación final',filas:tabla(all,sp,ts)}]:[]}}
 if(f==='Fase de grupos'){const k=Math.ceil(ts.length/4),gs=[...Array(k)].map(()=>[]);ts.forEach((t,i)=>gs[i%k].push(t))
  const rondas=[],tablas=[],q1=[],q2=[]
  gs.forEach((g,gi)=>{const L=String.fromCharCode(65+gi),all=[]
   rr(g).forEach((p,i)=>{const ms=p.map(([a,b])=>play(a,b,sp,sim));all.push(...ms);rondas.push({nombre:`Grupo ${L} - Fecha ${i+1}`,ms})})
   const tb=tabla(all,sp,g);if(sim)tablas.push({nombre:`Grupo ${L}`,filas:tb})
   q1.push(sim?tb[0].e:`1º Grupo ${L}`);q2.push(sim?tb[1].e:`2º Grupo ${L}`)})
  if(k>1)knock([...q1,...q2],sp,sim).forEach(r=>rondas.push({...r,nombre:'Eliminatoria: '+r.nombre}))
  return {rondas,tablas}}
 const rondas=rr(ts).map((p,i)=>({nombre:`Fecha ${i+1}`,ms:p.map(([a,b])=>play(a,b,sp,sim))}))
 return {rondas,tablas:sim?[{nombre:'Tabla de posiciones',filas:tabla(rondas.flatMap(r=>r.ms),sp,ts)}]:[]}}
// ---- Componente ----
export default function Fixture(){
 const [f,setF]=useState({sp:DEPORTES[0],fm:FORMATOS[0],n:8,nombres:''}),[cfg,setCfg]=useState(null),[res,setRes]=useState(null),[msg,setMsg]=useState('')
 const individual=['Tenis','Ajedrez'].includes(f.sp)
 const validar=()=>{let ts=f.nombres.split('\n').map(s=>s.trim()).filter(Boolean)
  if(ts.length){if(!ts.every(s=>/^[\wÁÉÍÓÚáéíóúñÑ .-]{1,30}$/.test(s)))return setMsg('Nombres: solo letras, números y espacios (máx. 30)')
   ts=ts.map((t,i)=>ts.indexOf(t)===i?t:`${t} (${i+1})`)}
  else{const n=Number(f.n);if(!Number.isInteger(n)||n<2||n>32)return setMsg('Cantidad: entero entre 2 y 32')
   ts=[...Array(n)].map((_,i)=>`${individual?'Jugador':'Equipo'} ${i+1}`)}
  if(ts.length<2||ts.length>32)return setMsg('Debe haber entre 2 y 32 participantes')
  if(f.fm==='Fase de grupos'&&ts.length<4)return setMsg('Fase de grupos requiere mínimo 4 participantes')
  setMsg('');return ts}
 const generar=sim=>{const ts=validar();if(!ts)return;const c=cfg&&!sim?null:{ts};setCfg({ts});setRes({...build(f.fm,ts,f.sp,sim),sim})}
 const simular=()=>{if(!cfg)return setMsg('Primero genere el fixture');setMsg('');setRes({...build(f.fm,cfg.ts,f.sp,true),sim:true})}
 const guardar=async()=>{await api.post('fixtures',{deporte:f.sp,formato:f.fm,participantes:cfg.ts,rondas:res.rondas,tablas:res.tablas});setMsg('✅ Fixture guardado en la base de datos')}
 return(<div>
  <form onSubmit={e=>{e.preventDefault();generar(false)}} noValidate aria-label="Generador de fixtures">
   <label>Deporte<select value={f.sp} onChange={e=>setF({...f,sp:e.target.value})}>{DEPORTES.map(d=><option key={d}>{d}</option>)}</select></label>
   <label>Formato<select value={f.fm} onChange={e=>setF({...f,fm:e.target.value})}>{FORMATOS.map(d=><option key={d}>{d}</option>)}</select></label>
   <label>Cantidad de {individual?'jugadores':'equipos'} (2 a 32)<input type="number" min="2" max="32" value={f.n} onChange={e=>setF({...f,n:e.target.value})}/></label>
   <label>Nombres (opcional, uno por línea)<textarea rows="4" value={f.nombres} onChange={e=>setF({...f,nombres:e.target.value})}/></label>
   {msg&&<p role="alert" className={msg.startsWith('✅')?'':'err'}>{msg}</p>}
   <div><button>Generar fixture</button> <button type="button" onClick={simular}>Simular torneo</button> {res&&<button type="button" onClick={guardar}>Guardar</button>}</div>
  </form>
  {res&&<div aria-live="polite">
   <h3>{f.sp} · {f.fm}{res.sim?' (simulado)':''}</h3>
   {f.fm==='Sistema suizo'&&!res.sim&&<p>Se muestra la ronda 1; las siguientes se emparejan según los resultados (use "Simular torneo").</p>}
   {res.rondas.map((r,i)=><section key={i} className="card"><h4>{r.nombre}</h4>
    {r.ms.map((m,j)=><p key={j}>{m.a} {m.x!==undefined?<strong>{m.x} - {m.y}</strong>:'vs'} {m.b}</p>)}</section>)}
   {res.tablas.map((t,i)=><div key={i} className="tablewrap"><h4>{t.nombre}</h4><table><thead><tr><th>Pos</th><th>{individual?'Jugador':'Equipo'}</th><th>PJ</th><th>GF</th><th>GC</th><th>Pts</th></tr></thead>
    <tbody>{t.filas.map((o,k)=><tr key={o.e}><td>{k+1}</td><td>{o.e}</td><td>{o.pj}</td><td>{o.gf}</td><td>{o.gc}</td><td>{o.pts}</td></tr>)}</tbody></table></div>)}
  </div>}</div>)}