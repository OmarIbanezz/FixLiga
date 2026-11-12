// Tabla genérica con botones Editar / Eliminar (READ + acciones de UPDATE y DELETE).
const CrudTable = ({ columnas, data, setDataToEdit, deleteData }) => (
  <div className="card shadow-sm">
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead className="table-dark">
          <tr>
            {columnas.map((c) => <th key={c.name}>{c.label}</th>)}
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columnas.length + 1} className="text-center text-muted py-4">Sin datos</td></tr>
          ) : (
            data.map((el) => (
              <tr key={el.id}>
                {columnas.map((c) => <td key={c.name}>{c.render ? c.render(el) : el[c.name]}</td>)}
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setDataToEdit(el)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteData(el.id)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default CrudTable;
