const U='/api/'
const h=(m,b)=>fetch(U+m.path,{method:m.method,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined}).then(r=>r.json())
export const api={
 get:c=>h({path:c,method:'GET'}),
 post:(c,b)=>h({path:c,method:'POST'},b),
 put:(c,id,b)=>h({path:`${c}/${id}`,method:'PUT'},b),
 del:(c,id)=>h({path:`${c}/${id}`,method:'DELETE'})}
