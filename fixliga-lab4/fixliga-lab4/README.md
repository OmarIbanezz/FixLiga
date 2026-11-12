# FixLiga – Laboratorio IV: CRUD con React + json-server

**Universidad Libre · Facultad de Ingeniería · Programación Web · Semestre VI · 2026-II**

Front en React que consume una API ficticia (json-server) con los datos del negocio **FixLiga**
(plataforma web para generar fixtures deportivos). Implementa las historias de usuario
**HU01–HU04** (Crear, Leer, Actualizar y Eliminar torneos) y un segundo CRUD de equipos/participantes.

## Integrantes
Kevin Santiago Monroy Ortiz · Sergio Moreno Tabares · Omar Santiago Ibáñez García · Santiago Ubaque Anzola · Nicolas Daza Sierra

## Tecnologías
React 18 (hooks `useState`, `useEffect`) · helper `helpFetch` · Bootstrap 5 · Vite · json-server

## Estructura
```
fixliga-lab4/
├─ db.json                     # "base de datos" de la API (torneos, equipos)
├─ index.html
├─ src/
│  ├─ index.jsx                # punto de entrada, monta <Negocio />
│  ├─ helpers/helpFetch.js     # helper GET/POST/PUT/DELETE
│  └─ components/
│     ├─ Negocio.jsx           # pantalla principal con pestañas
│     ├─ CrudApp.jsx           # lógica CRUD (hooks + helper)
│     ├─ CrudForm.jsx          # formulario crear/editar
│     └─ CrudTable.jsx         # tabla con Editar/Eliminar
```

## Ejecución (dos puertos)
```bash
npm install
npm run api     # puerto 3000 -> API json-server  (http://localhost:3000/torneos)
npm run dev     # puerto 5173 -> aplicación React (http://localhost:5173)
# o ambos a la vez:
npm start
```

## Endpoints
| Método | Ruta | Acción |
|---|---|---|
| GET | /torneos | Listar |
| POST | /torneos | Crear |
| PUT | /torneos/:id | Actualizar |
| DELETE | /torneos/:id | Eliminar |
(igual para `/equipos`)
