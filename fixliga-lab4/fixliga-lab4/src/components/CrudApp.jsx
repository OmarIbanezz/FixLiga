import { useEffect, useState } from "react";
import { helpFetch } from "../helpers/helpFetch.js";
import CrudForm from "./CrudForm.jsx";
import CrudTable from "./CrudTable.jsx";

// CRUD completo para un endpoint de json-server (torneos, equipos, ...).
const CrudApp = ({ endpoint, campos, columnas, initialForm }) => {
  const api = helpFetch();
  const [db, setDb] = useState(null);          // null = cargando
  const [dataToEdit, setDataToEdit] = useState(null);
  const [error, setError] = useState(null);

  // READ: se ejecuta al montar el componente y cada vez que cambia el endpoint
  useEffect(() => {
    setDb(null);
    setError(null);
    api.get(endpoint).then((res) => {
      if (res.err) { setError(res); setDb([]); } else setDb(res);
    });
  }, [endpoint]);

  // CREATE
  const createData = (data) => {
    const { id, ...body } = data;
    api.post(endpoint, { body }).then((res) => {
      if (res.err) setError(res); else setDb([...db, res]);
    });
  };

  // UPDATE
  const updateData = (data) => {
    api.put(`${endpoint}/${data.id}`, { body: data }).then((res) => {
      if (res.err) setError(res); else setDb(db.map((el) => (el.id === data.id ? res : el)));
    });
  };

  // DELETE
  const deleteData = (id) => {
    if (!window.confirm(`¿Eliminar el registro #${id}?`)) return;
    api.del(`${endpoint}/${id}`).then((res) => {
      if (res.err) setError(res); else setDb(db.filter((el) => el.id !== id));
    });
  };

  return (
    <>
      {error && <div className="alert alert-danger">Error {error.status}: {error.statusText}</div>}
      <CrudForm
        campos={campos}
        initialForm={initialForm}
        createData={createData}
        updateData={updateData}
        dataToEdit={dataToEdit}
        setDataToEdit={setDataToEdit}
      />
      {db === null ? (
        <div className="text-center py-4"><div className="spinner-border text-success" role="status" /></div>
      ) : (
        <CrudTable columnas={columnas} data={db} setDataToEdit={setDataToEdit} deleteData={deleteData} />
      )}
    </>
  );
};

export default CrudApp;
