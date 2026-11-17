#!/bin/bash
# FixLiga - ejecutar UNA vez en la raíz del Codespace:  bash setup.sh
set -e
mkdir -p fixliga/backend fixliga/frontend/src/components && cd fixliga

# ---------- BACKEND (Express + db.json) ----------
cat > backend/package.json <<'EOF'
{"name":"fixliga-api","type":"module","scripts":{"start":"node server.js"},
"dependencies":{"cors":"^2.8.5","express":"^4.19.2"}}
EOF
cat > backend/db.json <<'EOF'
{"productos":[
{"id":1,"nombre":"Plan Colegios","precio":50000,"stock":100},
{"id":2,"nombre":"Plan Clubes","precio":120000,"stock":100},
{"id":3,"nombre":"Plan Profesional","precio":300000,"stock":50}],
"torneos":[{"id":1,"nombre":"Interclases 2026","deporte":"Fútbol","formato":"Fase de grupos"}],
"desarrolladores":[
{"id":1,"nombre":"Kevin Santiago Monroy Ortíz","celular":"3001234567","foto":"https://i.pravatar.cc/120?img=11"},
{"id":2,"nombre":"Sergio Moreno Tabares","celular":"3001234568","foto":"https://i.pravatar.cc/120?img=12"},
{"id":3,"nombre":"Omar Santiago Ibáñez García","celular":"3001234569","foto":"https://i.pravatar.cc/120?img=13"},
{"id":4,"nombre":"Santiago Ubaque Anzola","celular":"3001234570","foto":"https://i.pravatar.cc/120?img=14"}],
"pqr":[],"pedidos":[]}
EOF
cat > backend/server.js <<'EOF'
import express from 'express'; import cors from 'cors'; import fs from 'fs'
const F='./db.json', app=express(); app.use(cors(), express.json())
const rd=()=>JSON.parse(fs.readFileSync(F)), wr=d=>fs.writeFileSync(F,JSON.stringify(d,null,2))
// Facturación + control de stock
app.post('/pedidos',(q,r)=>{const d=rd(); let total=0
  for(const it of q.body.items){const p=d.productos.find(x=>x.id===it.id)
    if(!p||p.stock<it.cant) return r.status(400).json({error:`Sin stock: ${it.nombre}`})
    total+=p.precio*it.cant}
  q.body.items.forEach(it=>{d.productos.find(x=>x.id===it.id).stock-=it.cant})
  const f={id:Date.now(),fecha:new Date().toISOString(),cliente:q.body.cliente,items:q.body.items,total,iva:Math.round(total*0.19)}
  d.pedidos.push(f); wr(d); r.status(201).json(f)})
// CRUD genérico
app.get('/:c',(q,r)=>r.json(rd()[q.params.c]??[]))
app.post('/:c',(q,r)=>{const d=rd(),c=q.params.c; d[c]??=[]; const it={...q.body,id:Date.now()}; d[c].push(it); wr(d); r.status(201).json(it)})
app.put('/:c/:id',(q,r)=>{const d=rd(),c=q.params.c; d[c]=(d[c]||[]).map(x=>x.id==q.params.id?{...q.body,id:x.id}:x); wr(d); r.json(q.body)})
app.delete('/:c/:id',(q,r)=>{const d=rd(),c=q.params.c; d[c]=(d[c]||[]).filter(x=>x.id!=q.params.id); wr(d); r.json({ok:true})})
app.listen(3000,()=>console.log('API en :3000'))
EOF

# ---------- FRONTEND (Vite + React) ----------
cat > frontend/package.json <<'EOF'
{"name":"fixliga-front","private":true,"type":"module",
"scripts":{"dev":"vite --host"},
"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},
"devDependencies":{"@vitejs/plugin-react":"^4.3.1","vite":"^5.4.0"}}
EOF
cat > frontend/vite.config.js <<'EOF'
import {defineConfig} from 'vite'; import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],server:{proxy:{'/api':{target:'http://localhost:3000',rewrite:p=>p.replace(/^\/api/,'')}}}})
EOF
cat > frontend/index.html <<'EOF'
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FixLiga - Organiza. Simula. Vive el deporte.</title></head>
<body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>
EOF
cat > frontend/src/main.jsx <<'EOF'
import {createRoot} from 'react-dom/client'; import App from './App.jsx'; import './App.css'
createRoot(document.getElementById('root')).render(<App/>)
EOF
cat > frontend/src/helpFetch.js <<'EOF'
const U='/api/'
const h=(m,b)=>fetch(U+m.path,{method:m.method,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined}).then(r=>r.json())
export const api={
 get:c=>h({path:c,method:'GET'}),
 post:(c,b)=>h({path:c,method:'POST'},b),
 put:(c,id,b)=>h({path:`${c}/${id}`,method:'PUT'},b),
 del:(c,id)=>h({path:`${c}/${id}`,method:'DELETE'})}
EOF

# CRUD genérico reutilizable (torneos, inventario, desarrolladores)
cat > frontend/src/components/Crud.jsx <<'EOF'
import {useEffect,useState} from 'react'; import {api} from '../helpFetch.js'
export default function Crud({col,campos,foto}){
 const [rows,setRows]=useState([]),[f,setF]=useState({}),[err,setErr]=useState('')
 const load=()=>api.get(col).then(setRows)
 useEffect(()=>{load()},[col])
 const save=async e=>{e.preventDefault()
  for(const c of campos) if(c.re&&!c.re.test(String(f[c.n]??''))){setErr(c.msg);return}
  setErr(''); const b={...f}; campos.forEach(c=>{if(c.type==='number')b[c.n]=Number(b[c.n])})
  b.id?await api.put(col,b.id,b):await api.post(col,b); setF({}); load()}
 const del=async id=>{if(window.confirm(`¿Seguro que desea ELIMINAR el registro ${id}?`)){await api.del(col,id);load()}}
 return(<div>
  <form onSubmit={save} noValidate aria-label={`Formulario ${col}`}>
   {campos.map(c=><label key={c.n}>{c.label}
    <input type={c.type||'text'} value={f[c.n]??''} required onChange={e=>setF({...f,[c.n]:e.target.value})}/></label>)}
   {err&&<p role="alert" className="err">{err}</p>}
   <button>{f.id?'Actualizar':'Crear'}</button>{f.id&&<button type="button" onClick={()=>setF({})}>Cancelar</button>}
  </form>
  <div className="tablewrap"><table><thead><tr>{foto&&<th>Foto</th>}{campos.map(c=><th key={c.n}>{c.label}</th>)}<th>Acciones</th></tr></thead>
   <tbody>{rows.length===0?<tr><td colSpan="9">Sin datos</td></tr>:rows.map(r=><tr key={r.id}>
    {foto&&<td><img src={r.foto} alt={`Foto de ${r.nombre}`} width="48" height="48"/></td>}
    {campos.map(c=><td key={c.n}>{r[c.n]}</td>)}
    <td><button onClick={()=>setF(r)}>Editar</button> <button onClick={()=>del(r.id)}>Eliminar</button></td></tr>)}</tbody></table></div></div>)}
EOF

# Tienda + carrito + pasarela ficticia + factura
cat > frontend/src/components/Tienda.jsx <<'EOF'
import {useEffect,useState} from 'react'; import {api} from '../helpFetch.js'
const money=n=>n.toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})
export default function Tienda(){
 const [prods,setProds]=useState([]),[cart,setCart]=useState([]),[pago,setPago]=useState({}),[msg,setMsg]=useState(''),[fac,setFac]=useState(null)
 const load=()=>api.get('productos').then(setProds); useEffect(()=>{load()},[])
 const add=p=>setCart(c=>{const x=c.find(i=>i.id===p.id); if(x) return c.map(i=>i.id===p.id?{...i,cant:i.cant+1}:i); return [...c,{...p,cant:1}]})
 const quit=id=>setCart(c=>c.filter(i=>i.id!==id))
 const total=cart.reduce((s,i)=>s+i.precio*i.cant,0)
 const pagar=async e=>{e.preventDefault()
  if(!cart.length) return setMsg('El carrito está vacío')
  if(!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(pago.correo||'')) return setMsg('Correo inválido')
  if(!/^\d{16}$/.test(pago.tarjeta||'')) return setMsg('Tarjeta: 16 dígitos')
  if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(pago.exp||'')) return setMsg('Vencimiento MM/AA')
  if(!/^\d{3}$/.test(pago.cvv||'')) return setMsg('CVV: 3 dígitos')
  const r=await api.post('pedidos',{cliente:pago.correo,items:cart})
  if(r.error) return setMsg(r.error)
  setFac(r); setCart([]); setMsg(''); load()}
 return(<div className="grid">
  <div><h3>Productos</h3>{prods.map(p=><article key={p.id} className="card">
   <h4>{p.nombre}</h4><p>{money(p.precio)} · Stock: {p.stock}</p>
   <button disabled={p.stock<1} onClick={()=>add(p)}>Agregar al carrito</button></article>)}</div>
  <div><h3>Carrito</h3>
   {cart.map(i=><p key={i.id}>{i.nombre} x{i.cant} — {money(i.precio*i.cant)} <button onClick={()=>quit(i.id)} aria-label={`Quitar ${i.nombre}`}>✕</button></p>)}
   <p><strong>Total: {money(total)}</strong></p>
   <form onSubmit={pagar} noValidate><h4>Pasarela de pago (ficticia)</h4>
    <label>Correo<input type="email" onChange={e=>setPago({...pago,correo:e.target.value})}/></label>
    <label>Tarjeta<input inputMode="numeric" maxLength="16" onChange={e=>setPago({...pago,tarjeta:e.target.value})}/></label>
    <label>Vence (MM/AA)<input maxLength="5" onChange={e=>setPago({...pago,exp:e.target.value})}/></label>
    <label>CVV<input type="password" maxLength="3" onChange={e=>setPago({...pago,cvv:e.target.value})}/></label>
    {msg&&<p role="alert" className="err">{msg}</p>}<button>Pagar</button></form>
   {fac&&<section className="card" aria-live="polite"><h4>Factura #{fac.id}</h4><p>Cliente: {fac.cliente}</p>
    {fac.items.map(i=><p key={i.id}>{i.nombre} x{i.cant}</p>)}<p>IVA incl.: {money(fac.iva)}</p><p><strong>Total: {money(fac.total)}</strong></p></section>}
  </div></div>)}
EOF

# Slider, acordeón, PQR, chat IA, accesibilidad
cat > frontend/src/components/Extras.jsx <<'EOF'
import {useEffect,useState} from 'react'; import {api} from '../helpFetch.js'
export function Slider(){
 const s=[['Organiza tu torneo en segundos',1],['Eliminación directa, grupos y suizo',2],['Simula resultados',3],['Para colegios, barrios y clubes',4],['Planes desde $50.000',5]]
 const [i,setI]=useState(0); useEffect(()=>{const t=setInterval(()=>setI(x=>(x+1)%5),4000);return()=>clearInterval(t)},[])
 return(<div className="slider"><img src={`https://picsum.photos/seed/fix${s[i][1]}/900/320`} alt={s[i][0]} width="900" height="320"/>
  <p className="cap">{s[i][0]}</p><button onClick={()=>setI((i+4)%5)} aria-label="Anterior">◀</button><button onClick={()=>setI((i+1)%5)} aria-label="Siguiente">▶</button></div>)}
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
  await api.post('pqr',f); setM('✅ PQR radicada correctamente'); setF({tipo:'Petición'})}
 return(<form onSubmit={env} noValidate>
  <label>Tipo<select value={f.tipo} onChange={e=>setF({...f,tipo:e.target.value})}><option>Petición</option><option>Queja</option><option>Reclamo</option></select></label>
  <label>Nombre<input value={f.nombre||''} onChange={e=>setF({...f,nombre:e.target.value})}/></label>
  <label>Correo<input type="email" value={f.correo||''} onChange={e=>setF({...f,correo:e.target.value})}/></label>
  <label>Celular<input value={f.cel||''} maxLength="10" onChange={e=>setF({...f,cel:e.target.value})}/></label>
  <label>Mensaje<textarea value={f.msg||''} onChange={e=>setF({...f,msg:e.target.value})}/></label>
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
EOF

cat > frontend/src/App.jsx <<'EOF'
import Crud from './components/Crud.jsx'; import Tienda from './components/Tienda.jsx'
import {Slider,Acordeon,PQR,Chat,Accesibilidad} from './components/Extras.jsx'
const nom={re:/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 ]{3,}$/,msg:'Mínimo 3 caracteres alfanuméricos'}
const torneos=[{n:'nombre',label:'Torneo',...nom},{n:'deporte',label:'Deporte',...nom},{n:'formato',label:'Formato',...nom}]
const inv=[{n:'nombre',label:'Producto',...nom},{n:'precio',label:'Precio',type:'number',re:/^[1-9]\d*$/,msg:'Precio entero > 0'},{n:'stock',label:'Stock',type:'number',re:/^\d+$/,msg:'Stock entero >= 0'}]
const devs=[{n:'nombre',label:'Nombre',re:/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]{3,}$/,msg:'Nombre: solo letras'},
 {n:'celular',label:'Celular',re:/^3\d{9}$/,msg:'Celular: 10 dígitos iniciando en 3'},{n:'foto',label:'URL foto',re:/^https?:\/\/.+/,msg:'URL inválida'}]
export default function App(){return(<>
 <a href="#main" className="skip">Saltar al contenido</a><Accesibilidad/>
 <header><h1>Fix<span>Liga</span></h1><p>Organiza. Simula. Vive el deporte.</p>
  <nav aria-label="Principal">{['tienda','torneos','inventario','equipo','pqr','datos','contacto'].map(s=><a key={s} href={'#'+s}>{s}</a>)}</nav></header>
 <main id="main">
  <section><Slider/><h2>Sobre nosotros</h2><Acordeon/></section>
  <section id="tienda"><h2>Tienda</h2><Tienda/></section>
  <section id="torneos"><h2>Torneos (CRUD)</h2><Crud col="torneos" campos={torneos}/></section>
  <section id="inventario"><h2>Inventario de productos (CRUD)</h2><Crud col="productos" campos={inv}/></section>
  <section id="equipo"><h2>Desarrolladores (CRUD vía API)</h2><Crud col="desarrolladores" campos={devs} foto/></section>
  <section id="pqr"><h2>Peticiones, quejas y reclamos</h2><PQR/></section>
  <section id="datos"><h2>Tratamiento de datos personales</h2><p>Sistemas y Soluciones Deportivas FixLiga S.A.S usa tus datos solo para gestionar compras y PQR, conforme a la Ley 1581 de 2012. Puedes consultarlos, actualizarlos o solicitar su eliminación escribiendo a contacto@fixliga.co.</p></section>
  <section id="contacto"><h2>Contacto</h2>
   <iframe title="Ubicación FixLiga" src="https://www.google.com/maps?q=Universidad+Libre+Bogot%C3%A1&output=embed" width="100%" height="300" loading="lazy"/>
   <p className="redes"><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a> <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a> <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer">WhatsApp</a> <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></p></section>
  <section><h2>FixBot (asistente IA)</h2><Chat/></section>
 </main><footer>© 2026 Sistemas y Soluciones Deportivas FixLiga S.A.S</footer></>)}
EOF

cat > frontend/src/App.css <<'EOF'
:root{--a:#0b2a8a;--g:#10a37f;--bg:#fff;--tx:#1a1a1a}
body{font-family:Arial,Helvetica,sans-serif;margin:0;background:var(--bg);color:var(--tx);line-height:1.5}
header{background:var(--a);color:#fff;padding:1rem;text-align:center}header span{color:#5ff0c3}
nav a{color:#fff;margin:0 .6rem;text-transform:capitalize}
main{max-width:1000px;margin:auto;padding:1rem}section{margin:2rem 0}
form{display:grid;gap:.5rem;max-width:420px}label{display:grid;font-weight:bold}
input,select,textarea{padding:.5rem;border:1px solid #666;border-radius:4px}
button{background:var(--a);color:#fff;border:0;padding:.5rem 1rem;border-radius:4px;cursor:pointer}
button:focus,a:focus,input:focus{outline:3px solid var(--g)}
.err{color:#b00020}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}
.card{border:1px solid #ccc;border-radius:8px;padding:.8rem;margin:.5rem 0}
.tablewrap{overflow-x:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:.4rem}
.slider{position:relative}.slider img{width:100%;height:auto;border-radius:8px}
.cap{position:absolute;bottom:2.5rem;left:1rem;background:#000a;color:#fff;padding:.3rem .6rem}
.chat .msgs{height:220px;overflow:auto;border:1px solid #ccc;padding:.5rem}.bot{color:var(--a)}.usr{text-align:right}
.acc{background:#eee;padding:.3rem;text-align:right}.acc button{margin:0 .2rem}
.skip{position:absolute;left:-999px}.skip:focus{left:0}
.contraste{--bg:#000;--tx:#ff0}.contraste input,.contraste select,.contraste textarea{background:#222;color:#ff0}.contraste a{color:#0ff}
.subrayado a{text-decoration:underline}
footer{text-align:center;padding:1rem;background:#eee}
EOF

(cd backend && npm install) && (cd frontend && npm install)
echo "LISTO. Terminal 1: cd fixliga/backend && npm start | Terminal 2: cd fixliga/frontend && npm run dev"
