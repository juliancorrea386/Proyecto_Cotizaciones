// src/services/productosService.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/productos`;

const productosService = {
  listar: async () => {
    try {
      const res = await axios.get(API_URL);
      // Aseguramos que siempre devuelva un array
      return Array.isArray(res.data) ? res.data : [res.data];
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return [];
    }
  },

  obtenerPorId: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      return null;
    }
  },

  crear: async (producto) => {
    try {
      const res = await axios.post(API_URL, producto);
      return res.data;
    } catch (error) {
      console.error("Error al crear producto:", error);
      return null;
    }
  },

  actualizar: async (id, producto) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, producto);
      return res.data;
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      return null;
    }
  },

  eliminar: async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      return null;
    }
  }
};

export default productosService;
