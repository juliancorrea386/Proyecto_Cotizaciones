import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api/recibos";

const recibosService = {
    // Listar recibos con filtros opcionales
    listar: (params = {}) => {
        return axios.get(API_URL, { params }).then(res => res.data);
    },

    // Obtener un recibo por ID
    obtenerPorId: async (id) => {
        try {
            const res = await axios.get(`${API_URL}/${id}`);
            return res.data;
        } catch (err) {
            console.error("Error obteniendo recibo:", err);
            throw err;
        }
    },
    // Obtener el último número de recibo
    obtenerUltimoNumero: async () => {
        try {
            const res = await axios.get(`${API_URL}/Numero`);
            const numero = parseInt(res.data.mayor_numero) || 0;
            return numero + 1;
        } catch (err) {
            console.error("Error obteniendo número de recibo:", err);
            return 1; // valor por defecto si falla
        }
    },

    // Crear un nuevo recibo

    crear: async (reciboData) => {
        try {
            const res = await axios.post(API_URL, reciboData);
            return res.data;
        } catch (err) {
            console.error("Error creando recibo:", err);
            throw err;
        }
    },

    // Actualizar recibo existente
    actualizar: async (id, reciboData) => {
        try {
            const res = await axios.put(`${API_URL}/${id}`, reciboData);
            return res.data;
        } catch (err) {
            console.error("Error actualizando recibo:", err);
            throw err;
        }
    },

    // Eliminar recibo
    eliminar: (id) => {
        return axios.delete(`${API_URL}/${id}`).then(res => res.data);
    },

    // Obtener PDF de recibo
    obtenerPDF: (id) => {
        return axios.get(`${API_URL}/${id}/pdf`, { responseType: "blob" });
    }

    // Obtener el último número de recibo (si lo quieres asociar)
};

export default recibosService;
