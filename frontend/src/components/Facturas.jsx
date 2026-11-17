import {useEffect,useState} from 'react'; import {api} from '../helpFetch.js'
const money=n=>n.toLocaleString('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0})
export default function Facturas(){
 const [fs,setFs]=useState([]),[q,setQ]=useState('')
 useEffect(()=>{api.get('pedidos').then(d=>setFs([...d].reverse()))},[])
 const vis=fs.filter(x=>`${x.id} ${x.cliente}`.toLowerCase().includes(q.trim().toLowerCase()))
 const suma=vis.reduce((s,x)=>s+x.total,0)
 return(<div>
  <label>Buscar factura (número o correo)<input type="search" value={q} onChange={e=>setQ(e.target.value)}/></label>
  <p>{vis.length} facturas · Total vendido: <strong>{money(suma)}</strong></p>
  {vis.length===0&&<p>No hay facturas para mostrar.</p>}
  {vis.map(x=><details key={x.id} className="card">
   <summary>#{x.id} · {x.cliente} · {money(x.total)}</summary>
   <p>Fecha: {new Date(x.fecha).toLocaleString('es-CO')}</p>
   {x.items.map(i=><p key={i.id}>{i.nombre} x{i.cant} — {money(i.precio*i.cant)}</p>)}
   <p>IVA incluido: {money(x.iva)}</p></details>)}
 </div>)}