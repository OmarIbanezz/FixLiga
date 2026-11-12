import { useState } from "react";
import CrudApp from "./CrudApp.jsx";

// Configuración de cada entidad del negocio FixLiga.
// HU01-HU04 (Crear, Leer, Actualizar, Eliminar torneo) -> entidad "torneos"
const entidades = {
  torneos: {
    titulo: "Torneos",
    initialForm: { id: null, nombre: "", deporte: "", formato: "", participantes: "", fechaInicio: "", estado: "Programado" },
    campos: [
      { name: "nombre", label: "Nombre del torneo", required: true },
      { name: "deporte", label: "Deporte", required: true, options: ["Fútbol", "Baloncesto", "Voleibol", "Tenis", "Ajedrez", "Otro"] },
      { name: "formato", label: "Formato de competición", required: true, options: ["Eliminación directa", "Fase de grupos", "Sistema suizo"] },
      { name: "participantes", label: "Nº de participantes", type: "number", required: true },
      { name: "fechaInicio", label: "Fecha de inicio", type: "date" },
      { name: "estado", label: "Estado", options: ["Programado", "Activo", "Finalizado", "Cancelado"] },
    ],
    columnas: [
      { name: "id", label: "#" },
      { name: "nombre", label: "Torneo" },
      { name: "deporte", label: "Deporte" },
      { name: "formato", label: "Formato" },
      { name: "participantes", label: "Participantes" },
      { name: "fechaInicio", label: "Inicio" },
      {
        name: "estado", label: "Estado",
        render: (el) => (
          <span className={`badge ${el.estado === "Activo" ? "bg-success" : el.estado === "Cancelado" ? "bg-danger" : el.estado === "Finalizado" ? "bg-secondary" : "bg-primary"}`}>
            {el.estado}
          </span>
        ),
      },
    ],
  },
  equipos: {
    titulo: "Equipos / Participantes",
    initialForm: { id: null, nombre: "", torneoId: "", capitan: "", contacto: "" },
    campos: [
      { name: "nombre", label: "Nombre del equipo", required: true },
      { name: "torneoId", label: "ID del torneo", type: "number", required: true },
      { name: "capitan", label: "Capitán / responsable", required: true },
      { name: "contacto", label: "Correo de contacto", type: "email" },
    ],
    columnas: [
      { name: "id", label: "#" },
      { name: "nombre", label: "Equipo" },
      { name: "torneoId", label: "Torneo (ID)" },
      { name: "capitan", label: "Capitán" },
      { name: "contacto", label: "Contacto" },
    ],
  },
};

const Negocio = () => {
  const [activa, setActiva] = useState("torneos");
  const e = entidades[activa];

  return (
    <>
      <nav className="navbar navbar-dark" style={{ background: "linear-gradient(90deg,#0b2a7a,#12a37f)" }}>
        <div className="container">
          <span className="navbar-brand fw-bold fst-italic fs-3">FixLiga</span>
          <span className="navbar-text text-white-50 small">ORGANIZA. SIMULA. VIVE EL DEPORTE.</span>
        </div>
      </nav>

      <main className="container py-4">
        <h1 className="h3 mb-1">Panel del organizador</h1>
        <p className="text-muted">Mantenimiento de datos del negocio (CRUD) conectado a la API json-server.</p>

        <ul className="nav nav-pills mb-4">
          {Object.entries(entidades).map(([key, val]) => (
            <li className="nav-item" key={key}>
              <button className={`nav-link ${activa === key ? "active" : ""}`} onClick={() => setActiva(key)}>
                {val.titulo}
              </button>
            </li>
          ))}
        </ul>

        {/* key fuerza a React a reiniciar el estado al cambiar de pestaña */}
        <CrudApp key={activa} endpoint={activa} campos={e.campos} columnas={e.columnas} initialForm={e.initialForm} />
      </main>

      <footer className="text-center text-muted small py-3">
        © 2026 Sistemas y Soluciones Deportivas FixLiga S.A.S · Programación Web · Universidad Libre
      </footer>
    </>
  );
};

export default Negocio;
