import { useEffect, useState } from "react";

// Formulario genérico: sirve para CREAR (dataToEdit = null) y ACTUALIZAR.
const CrudForm = ({ campos, initialForm, createData, updateData, dataToEdit, setDataToEdit }) => {
  const [form, setForm] = useState(initialForm);

  // useEffect: cuando cambia el registro a editar, llena el formulario
  useEffect(() => {
    setForm(dataToEdit ?? initialForm);
  }, [dataToEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleReset = () => {
    setForm(initialForm);
    setDataToEdit(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const faltantes = campos.filter((c) => c.required && !String(form[c.name] ?? "").trim());
    if (faltantes.length) return alert(`Complete: ${faltantes.map((c) => c.label).join(", ")}`);
    form.id ? updateData(form) : createData(form);
    handleReset();
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header fw-semibold text-white" style={{ background: "linear-gradient(90deg,#0b2a7a,#12a37f)" }}>
        {dataToEdit ? "Editar registro" : "Nuevo registro"}
      </div>
      <form className="card-body row g-3" onSubmit={handleSubmit}>
        {campos.map((c) => (
          <div className="col-12 col-md-6" key={c.name}>
            <label className="form-label">{c.label}</label>
            {c.options ? (
              <select className="form-select" name={c.name} value={form[c.name] ?? ""} onChange={handleChange}>
                <option value="">Seleccione…</option>
                {c.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                className="form-control"
                type={c.type || "text"}
                min={c.type === "number" ? 2 : undefined}
                name={c.name}
                value={form[c.name] ?? ""}
                onChange={handleChange}
              />
            )}
          </div>
        ))}
        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-success">{dataToEdit ? "Actualizar" : "Guardar"}</button>
          <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>Limpiar</button>
        </div>
      </form>
    </div>
  );
};

export default CrudForm;
