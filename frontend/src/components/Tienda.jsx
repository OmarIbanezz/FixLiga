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
    if(!pago.acepto) return setMsg('Debe aceptar el tratamiento de datos personales')  
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
        <label><input type="checkbox" onChange={e=>setPago({...pago,acepto:e.target.checked})}/> Acepto el tratamiento de mis datos personales (<a href="#datos">ver política</a>)</label>
    {msg&&<p role="alert" className="err">{msg}</p>}<button>Pagar</button></form>
   {fac&&<section className="card" aria-live="polite"><h4>Factura #{fac.id}</h4><p>Cliente: {fac.cliente}</p>
    {fac.items.map(i=><p key={i.id}>{i.nombre} x{i.cant}</p>)}<p>IVA incl.: {money(fac.iva)}</p><p><strong>Total: {money(fac.total)}</strong></p></section>}
  </div></div>)}
