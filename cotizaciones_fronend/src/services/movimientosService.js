import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/movimientos`;

const movimientosService = {
  getMovimientos: async (params = {}) => {
    try {
      const res = await axios.get(API_URL, { params });
      return Array.isArray(res.data) ? res.data : [res.data];
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      return [];
    }
  },

  getMovimientoById: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error al obtener movimiento con id ${id}:`, err);
      return null;
    }
  },

  createMovimiento: async (movimiento) => {
    try {
      const res = await axios.post(API_URL, movimiento);
      return res.data;
    } catch (err) {
      console.error("Error al crear movimiento:", err);
      throw err;
    }
  },

  updateMovimiento: async (id, movimiento) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, movimiento);
      return res.data;
    } catch (err) {
      console.error(`Error al actualizar movimiento con id ${id}:`, err);
      throw err;
    }
  },

  deleteMovimiento: async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Error al eliminar movimiento con id ${id}:`, err);
      throw err;
    }
  },
};

export default movimientosService;
