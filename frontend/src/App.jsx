import Crud from './components/Crud.jsx'; import Tienda from './components/Tienda.jsx'
import {Slider,Acordeon,PQR,Chat,Accesibilidad} from './components/Extras.jsx'
const nom={re:/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 ]{3,}$/,msg:'Mínimo 3 caracteres alfanuméricos'}
const torneos=[{n:'nombre',label:'Torneo',...nom},
 {n:'deporte',label:'Deporte',opts:['Fútbol','Baloncesto','Voleibol','Tenis','Ajedrez','Microfútbol'],re:/.+/,msg:'Elija un deporte'},
 {n:'formato',label:'Formato',opts:['Todos contra todos','Eliminación directa','Fase de grupos','Sistema suizo'],re:/.+/,msg:'Elija un formato'}]
const inv=[{n:'nombre',label:'Producto',...nom},{n:'precio',label:'Precio',type:'number',re:/^[1-9]\d*$/,msg:'Precio entero > 0'},{n:'stock',label:'Stock',type:'number',re:/^\d+$/,msg:'Stock entero >= 0'}]
const devs=[{n:'nombre',label:'Nombre',re:/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]{3,}$/,msg:'Nombre: solo letras'},
 {n:'celular',label:'Celular',re:/^3\d{9}$/,msg:'Celular: 10 dígitos iniciando en 3'},{n:'foto',label:'URL foto',re:/^https?:\/\/.+/,msg:'URL inválida'}]
export default function App(){return(<>
 <a href="#main" className="skip">Saltar al contenido</a><Accesibilidad/>
 <header><h1><img src="/logoFixLiga.PNG" alt="FixLiga - Organiza. Simula. Vive el deporte." width="180" height="170"/></h1>
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
