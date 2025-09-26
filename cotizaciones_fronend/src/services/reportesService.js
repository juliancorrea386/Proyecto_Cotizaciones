import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api/reportes";

const reportesService = {
    getReporteInv: async (params = {}) => {
        try {
            const res = await axios.get(`${API_URL}/inventario`, { params });
            return Array.isArray(res.data) ? res.data : [res.data];
        } catch (err) {
            console.error("Error al obtener movimientos:", err);
            return [];
        }
    },
    getReporteVenta: async (params = {}) => {
        try {
            const res = await axios.get(`${API_URL}/ReporteVentas`, { params });
            return res.data; // no envolver en array
        } catch (err) {
            console.error("Error al obtener reporte de ventas:", err);
            return {
                creditos: [],
                contado: [],
                abonos: [],
                resumen: { totalCreditos: 0, totalContado: 0, totalAbonos: 0, totalIngresos: 0 }
            };
        }
    },
    getMovimientosProducto: async (productoId, params = {}) => {
        try {
            const res = await axios.get(`${API_URL}/movimientos-productos/${productoId}`, { params });
            return Array.isArray(res.data) ? res.data : [res.data];
        } catch (err) {
            console.error("Error al obtener movimientos del producto:", err);
            return [];
        }
    },
};

export default reportesService;