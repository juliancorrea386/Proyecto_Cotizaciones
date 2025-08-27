import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/clientes`;

const clientesService = {
  // Listar todos los clientes
  listar: async () => {
    try {
      const res = await axios.get(API_URL);
      return Array.isArray(res.data) ? res.data : [res.data];
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      return [];
    }
  },

  // Obtener un cliente por ID
  obtenerPorId: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error al obtener cliente:", error);
      return null;
    }
  },

  // Crear cliente
  crear: async (cliente) => {
    try {
      const res = await axios.post(API_URL, cliente);
      return res.data;
    } catch (error) {
      console.error("❌ Error al crear cliente:", error.response?.data || error.message);
      throw error;
    }
  },

  // Actualizar cliente
  actualizar: async (id, cliente) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, cliente);
      return res.data;
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error.response?.data || error.message);
      throw error;
    }
  },

  // Eliminar cliente
  eliminar: async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      return res.data;
    } catch (error) {
      console.error("❌ Error al eliminar cliente:", error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener el último número de recibo (si lo quieres asociar)
  obtenerUltimoNumeroRecibo: async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/recibos/Numero`);
      const numero = parseInt(res.data.mayor_numero) || 0;
      return numero + 1;
    } catch (error) {
      console.error("❌ Error al obtener número de recibo:", error);
      return 1; // valor por defecto
    }
  }
};

export default clientesService;
