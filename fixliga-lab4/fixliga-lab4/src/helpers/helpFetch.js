// Helper reutilizable que encapsula la API Fetch.
// Uso: const api = helpFetch(); api.get("torneos"); api.post("torneos", { body })
export const helpFetch = () => {
  const URL = "http://localhost:3000";

  const customFetch = async (endpoint, options = {}) => {
    const defaultHeaders = { "Content-Type": "application/json" };
    const controller = new AbortController();
    options.signal = controller.signal;
    options.method = options.method || "GET";
    options.headers = options.headers
      ? { ...defaultHeaders, ...options.headers }
      : defaultHeaders;
    options.body = JSON.stringify(options.body) || false;
    if (!options.body) delete options.body;

    // Cancela la petición si el servidor no responde en 5 segundos
    setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`${URL}/${endpoint}`, options);
      if (!res.ok) {
        throw { err: true, status: res.status || "00", statusText: res.statusText || "Ocurrió un error" };
      }
      return await res.json();
    } catch (err) {
      return err.err
        ? err
        : { err: true, status: "00", statusText: "No se pudo conectar con la API (¿json-server está corriendo en el puerto 3000?)" };
    }
  };

  const get = (endpoint) => customFetch(endpoint);
  const post = (endpoint, options = {}) => { options.method = "POST"; return customFetch(endpoint, options); };
  const put = (endpoint, options = {}) => { options.method = "PUT"; return customFetch(endpoint, options); };
  const del = (endpoint, options = {}) => { options.method = "DELETE"; return customFetch(endpoint, options); };

  return { get, post, put, del };
};
