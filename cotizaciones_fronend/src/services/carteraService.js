import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/cartera`;

const carteraService = {
  // Listar cartera de clientes con deudas pendientes
  listar: async (params = {}) => {
    try {
        const res = await axios.get(API_URL, { params });
        return Array.isArray(res.data) ? res.data : [res.data];
    } catch (error) {
        console.error("Error al obtener cartera:", error);
        return [];
    }
    }
};

export default carteraService;