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
