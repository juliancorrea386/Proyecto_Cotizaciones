// src/services/productosService.js
import axios from "axios";

const API_URL = "http://localhost:4000/api/auth"; // Ajusta al puerto de tu backend

export const getUsuario = async () => {
  try {
    const res = await axios.get(API_URL);
    // Si el backend devuelve un objeto, lo pasamos a array
    return Array.isArray(res.data) ? res.data : [res.data];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

export const getUsuarioById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};


export const createUsuario = async (usuario) => {
    try {
        const res = await axios.post(API_URL, usuario);
        return res.data;
    } catch (error) {
        console.error("❌ Error al crear usuario:", error.response?.data || error.message);
        throw error; // para que guardarCliente pueda capturarlo
    }
};

export const updateUsuario = async (id, usuario) => {
    const res = await axios.put(`${API_URL}/${id}`, usuario);
    return res.data;
};

export const deleteUsuario = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};