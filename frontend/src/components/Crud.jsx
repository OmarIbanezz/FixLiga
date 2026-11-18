import {useEffect,useState} from 'react'; import {api} from '../helpFetch.js'
const gh=r=>r.github?r.github.replace(/\/$/,'')+'.png':''
export default function Crud({col,campos,foto}){
 const [rows,setRows]=useState([]),[f,setF]=useState({}),[err,setErr]=useState(''),[q,setQ]=useState('')
 const load=()=>api.get(col).then(setRows)
 useEffect(()=>{load()},[col])
 const vis=rows.filter(r=>campos.some(c=>String(r[c.n]??'').toLowerCase().includes(q.trim().toLowerCase())))
 const save=async e=>{e.preventDefault()
  for(const c of campos) if(c.re&&!c.re.test(String(f[c.n]??''))){setErr(c.msg);return}
  setErr(''); const b={...f}; campos.forEach(c=>{if(c.type==='number')b[c.n]=Number(b[c.n])})
  b.id?await api.put(col,b.id,b):await api.post(col,b); setF({}); load()}
 const del=async id=>{if(window.confirm(`¿Seguro que desea ELIMINAR el registro ${id}?`)){await api.del(col,id);load()}}
 return(<div>
  <form onSubmit={save} noValidate aria-label={`Formulario ${col}`}>
   {campos.map(c=><label key={c.n}>{c.label}
    {c.opts
     ?<select value={f[c.n]??''} onChange={e=>setF({...f,[c.n]:e.target.value})}>
       <option value="">Seleccione</option>{c.opts.map(o=><option key={o}>{o}</option>)}</select>
     :<input type={c.type||'text'} value={f[c.n]??''} required onChange={e=>setF({...f,[c.n]:e.target.value})}/>}
   </label>)}
   {err&&<p role="alert" className="err">{err}</p>}
   <button>{f.id?'Actualizar':'Crear'}</button>{f.id&&<button type="button" onClick={()=>setF({})}>Cancelar</button>}
  </form>
  <label>Buscar en {col}<input type="search" placeholder="Escriba para filtrar" value={q} onChange={e=>setQ(e.target.value)}/></label>
  <p>{vis.length} de {rows.length} registros</p>
  <div className="tablewrap"><table><thead><tr>{foto&&<th>Foto</th>}{campos.map(c=><th key={c.n}>{c.label}</th>)}<th>Acciones</th></tr></thead>
   <tbody>{vis.length===0?<tr><td colSpan="9">Sin resultados</td></tr>:vis.map(r=><tr key={r.id}>
    {foto&&<td><img src={r.foto||gh(r)} alt={`Foto de ${r.nombre}`} width="48" height="48"
      onError={e=>{if(gh(r)&&e.currentTarget.src!==gh(r)){e.currentTarget.src=gh(r)}}}/></td>}
    {campos.map(c=><td key={c.n}>{/^https?:\/\//.test(String(r[c.n]))
      ?<a href={r[c.n]} target="_blank" rel="noreferrer">{String(r[c.n]).replace('https://github.com/','@')}</a>
      :r[c.n]}</td>)}
    <td><button onClick={()=>setF(r)}>Editar</button> <button onClick={()=>del(r.id)}>Eliminar</button></td></tr>)}</tbody></table></div></div>)}