import axios from "axios";
import { use } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/municipios`;

const municipiosService = {
    getMunicipios: async () => {
        try {
            const res = await axios.get(API_URL);
            return Array.isArray(res.data) ? res.data : [res.data];
        }
        catch (err) {
            console.error("Error al obtener municipios:", err);
            return [];
        }     
    },

    getMunicipioById: async (id) => {   
        try {
            const res = await axios.get(`${API_URL}/${id}`);
            return res.data;
        }
        catch (err) {
            console.error(`Error al obtener municipio con id ${id}:`, err);
            return null;
        }
    },
};

export default municipiosService;