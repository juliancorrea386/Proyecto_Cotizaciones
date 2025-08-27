import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/cotizaciones`;

const cotizacionesService = {
    listar: (params = {}) => axios.get(API_URL, { params }).then(res => res.data),
    eliminar: (id) => axios.delete(`${API_URL}/${id}`),
    guardarCotizacion: async (cotizacion) => {
        try {
            const res = await axios.post(API_URL, cotizacion);
            return res.data;
        } catch (error) {
            console.error("Error al guardar la cotización:", error);
            throw error; // propagar el error para manejarlo en el componente
        }
    },
    actualizar: (id, data) => axios.put(`${API_URL}/${id}`, data).then(res => res.data),
    obtenerUltimoNumero: async () => {
        try {
            const res = await axios.get(`${API_URL}/Numero`);
            const numero = parseInt(res.data.mayor_numero) || 0;
            return numero + 1;
        } catch (error) {
            console.error("Error al obtener el último número de cotización:", error);
            return 1; // valor por defecto si hay error
        }
    },obtenerPorId: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error al obtener la cotización:", error);
      throw error;
    }
  },
  obtenerPorCliente:async (clienteId) => {
  try {
    const res = await axios.get(`${API_URL}/cliente/${clienteId}`);
    return Array.isArray(res.data) ? res.data : [res.data];
  } catch (error) {
    console.error("Error al obtener cotizaciones por cliente:", error);
    throw error;
  }
},

};

export default cotizacionesService;