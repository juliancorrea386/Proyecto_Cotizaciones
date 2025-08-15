// src/services/productosService.js
import axios from "axios";

const API_URL = "http://localhost:4000/api/productos"; // Ajusta al puerto de tu backend

export const getProductos = async () => {
  try {
    const res = await axios.get(API_URL);
    // Si el backend devuelve un objeto, lo pasamos a array
    return Array.isArray(res.data) ? res.data : [res.data];
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
};

export const getProductoById = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
};

export const createProducto = async (producto) => {
    console.log("Creando producto:", producto);
    const res = await axios.post(API_URL, producto);
    return res.data;
};

export const updateProducto = async (id, producto) => {
    const res = await axios.put(`${API_URL}/${id}`, producto);
    return res.data;
};

export const deleteProducto = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};
