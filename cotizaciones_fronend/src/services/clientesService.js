// src/services/productosService.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/clientes`; // Ajusta al puerto de tu backend

export const getCliente = async () => {
  try {
    const res = await axios.get(API_URL);
    // Si el backend devuelve un objeto, lo pasamos a array
    return Array.isArray(res.data) ? res.data : [res.data];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

export const getClienteById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};

export const createCliente = async (cliente) => {
    try {
        const res = await axios.post(API_URL, cliente);
        return res.data;
    } catch (error) {
        console.error("❌ Error al crear cliente:", error.response?.data || error.message);
        throw error; // para que guardarCliente pueda capturarlo
    }
};

export const updateCliente = async (id, cliente) => {
    const res = await axios.put(`${API_URL}/${id}`, cliente);
    return res.data;
};

export const deleteCliente = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};