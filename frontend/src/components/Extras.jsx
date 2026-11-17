import {useEffect,useState} from 'react'; import {api} from '../helpFetch.js'
export function Slider(){
 const s=[
  ['banner_1.png','Organiza tu torneo en segundos. Organiza. Simula. Vive el deporte.'],
  ['banner_2.png','Eliminación directa, grupos y sistema suizo'],
  ['banner_3.png','Simula tu torneo antes de jugarlo'],
  ['banner_4.png','FixLiga para todos los deportes'],
  ['banner_5.png','Planes desde $50.000: Colegios, Clubes y Profesional']]
 const [i,setI]=useState(0),[pausa,setPausa]=useState(false)
 useEffect(()=>{if(pausa)return;const t=setInterval(()=>setI(x=>(x+1)%s.length),4000);return()=>clearInterval(t)},[pausa])
 return(<div className="slider" role="region" aria-roledescription="carrusel" aria-label="Publicidad FixLiga">
  <img src={'/'+s[i][0]} alt={s[i][1]} width="900" height="320"/>
  <p>Imagen {i+1} de {s.length}</p>
  <button onClick={()=>setI((i+s.length-1)%s.length)} aria-label="Anterior">◀</button>
  <button onClick={()=>setPausa(!pausa)}>{pausa?'Reanudar':'Pausar'}</button>
  <button onClick={()=>setI((i+1)%s.length)} aria-label="Siguiente">▶</button></div>)}
export const Acordeon=()=><div>
 <details><summary>Misión</summary><p>Ayudar a las personas a organizar automáticamente cualquier fixture deportivo sin importar la cantidad de participantes, evitando atrasos en la logística deportiva.</p></details>
 <details><summary>Visión</summary><p>Ser la plataforma líder en la organización de torneos deportivos, rápida, precisa y accesible para organizadores de cualquier nivel.</p></details>
 <details><summary>Objetivos</summary><p>Generar fixtures automáticos, ofrecer eliminación directa, grupos y suizo, simular torneos y reducir errores manuales.</p></details></div>
export function PQR(){
 const [f,setF]=useState({tipo:'Petición'}),[m,setM]=useState('')
 const env=async e=>{e.preventDefault()
  if(!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]{3,}$/.test(f.nombre||'')) return setM('Nombre inválido (solo letras)')
  if(!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(f.correo||'')) return setM('Correo inválido')
  if(!/^3\d{9}$/.test(f.cel||'')) return setM('Celular colombiano: 10 dígitos iniciando en 3')
  if((f.msg||'').length<10) return setM('Mensaje: mínimo 10 caracteres')
  if(!f.acepto) return setM('Debe aceptar el tratamiento de datos personales')
  await api.post('pqr',f); setM('✅ PQR radicada correctamente'); setF({tipo:'Petición'})}
 return(<form onSubmit={env} noValidate>
  <label>Tipo<select value={f.tipo} onChange={e=>setF({...f,tipo:e.target.value})}><option>Petición</option><option>Queja</option><option>Reclamo</option></select></label>
  <label>Nombre<input value={f.nombre||''} onChange={e=>setF({...f,nombre:e.target.value})}/></label>
  <label>Correo<input type="email" value={f.correo||''} onChange={e=>setF({...f,correo:e.target.value})}/></label>
  <label>Celular<input value={f.cel||''} maxLength="10" onChange={e=>setF({...f,cel:e.target.value})}/></label>
  <label>Mensaje<textarea value={f.msg||''} onChange={e=>setF({...f,msg:e.target.value})}/></label>
    <label><input type="checkbox" checked={!!f.acepto} onChange={e=>setF({...f,acepto:e.target.checked})}/> Acepto el tratamiento de mis datos personales (<a href="#datos">ver política</a>)</label>
  {m&&<p role="alert">{m}</p>}<button>Enviar</button></form>)}
// Asistente IA: genera fixtures round-robin y responde sobre la plataforma
const fixture=n=>{let t=[...Array(n)].map((_,i)=>i+1); if(n%2) t.push(0); const k=t.length,R=[]
 for(let r=0;r<k-1;r++){const p=[];for(let i=0;i<k/2;i++){const a=t[i],b=t[k-1-i]; if(a&&b)p.push(`${a} vs ${b}`)}
  R.push(`Fecha ${r+1}: ${p.join(' | ')}`); t=[t[0],t[k-1],...t.slice(1,k-1)]} return R}
export function Chat(){
 const [log,setLog]=useState([{b:1,t:'Hola, soy FixBot. Escribe "equipos 6" y te armo el fixture, o pregunta por "planes" o "formatos".'}]),[q,setQ]=useState('')
 const resp=s=>{const m=s.match(/(\d+)/),x=s.toLowerCase()
  if(m&&x.includes('equipo')){const n=+m[1]; return n<2||n>20?'Indica entre 2 y 20 equipos.':fixture(n).join('\n')}
  if(x.includes('plan'))return 'Planes: Colegios $50.000, Clubes $120.000, Profesional $300.000.'
  if(x.includes('formato'))return 'Eliminación directa, fase de grupos y sistema suizo.'
  return 'No te entendí. Prueba: "equipos 8", "planes" o "formatos".'}
 const send=e=>{e.preventDefault(); if(!q.trim())return; setLog([...log,{t:q},{b:1,t:resp(q)}]); setQ('')}
 return(<div className="chat"><div className="msgs" aria-live="polite">{log.map((l,i)=><p key={i} className={l.b?'bot':'usr'} style={{whiteSpace:'pre-line'}}>{l.t}</p>)}</div>
  <form onSubmit={send}><input aria-label="Mensaje" value={q} onChange={e=>setQ(e.target.value)}/><button>Enviar</button></form></div>)}
export function Accesibilidad(){
 const [z,setZ]=useState(100),[c,setC]=useState(false),[u,setU]=useState(false)
 useEffect(()=>{document.documentElement.style.fontSize=z+'%';document.body.classList.toggle('contraste',c);document.body.classList.toggle('subrayado',u)},[z,c,u])
 return(<div className="acc" role="toolbar" aria-label="Accesibilidad">
  <button onClick={()=>setZ(Math.min(150,z+10))}>A+</button><button onClick={()=>setZ(Math.max(80,z-10))}>A-</button>
  <button onClick={()=>setC(!c)}>Contraste</button><button onClick={()=>setU(!u)}>Subrayar enlaces</button></div>)}
